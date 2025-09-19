# booking/views.py
from __future__ import annotations

import calendar
import logging
from collections import defaultdict
from datetime import date as date_cls, datetime as dt_cls, timedelta

import requests
from django.conf import settings
from django.db import transaction, IntegrityError, models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, viewsets, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import (
    Field,
    Timeslot,
    FieldWeeklySlot,
    FieldBlackout,
    BookingSeries,
    Booking,
    ChapaPayment,
    BookingStatus,
    SeriesStatus,
)
from .serializers import (
    FieldSerializer,
    TimeslotSerializer,
    FieldWeeklySlotSerializer,
    FieldBlackoutSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    BookingSeriesSerializer,
    BookingSeriesCreateSerializer,
    ChapaPaymentSerializer,
)

logger = logging.getLogger(__name__)

# ============================================================================
# Config (read from settings / .env)
# ============================================================================
CHAPA_PUBLIC_KEY = getattr(settings, "CHAPA_PUBLIC_KEY", "")
CHAPA_SECRET_KEY = getattr(settings, "CHAPA_SECRET_KEY", "")
CHAPA_BASE_URL = getattr(settings, "CHAPA_BASE_URL", "https://api.chapa.co").rstrip("/")
CHAPA_INIT_ENDPOINT = f"{CHAPA_BASE_URL}/v1/transaction/initialize"
CHAPA_VERIFY_ENDPOINT = f"{CHAPA_BASE_URL}/v1/transaction/verify"

CHAPA_RETURN_URL = getattr(settings, "CHAPA_RETURN_URL", "http://localhost:3000/payment-return")
CHAPA_CALLBACK_URL = getattr(settings, "CHAPA_CALLBACK_URL", "http://localhost:8000/booking/payments/chapa/callback/")

PENDING_HOLD_TTL_MINUTES = int(getattr(settings, "PENDING_HOLD_TTL_MINUTES", 10))
CURRENCY = getattr(settings, "CURRENCY", "ETB")
HTTP_TIMEOUT_SEC = int(getattr(settings, "HTTP_TIMEOUT_SEC", 20))


def _require_chapa_config() -> tuple[bool, str]:
    if not CHAPA_SECRET_KEY:
        return False, "Missing CHAPA_SECRET_KEY"
    if not CHAPA_RETURN_URL:
        return False, "Missing CHAPA_RETURN_URL"
    if not CHAPA_CALLBACK_URL:
        return False, "Missing CHAPA_CALLBACK_URL"
    return True, ""


# ============================================================================
# Date helpers
# ============================================================================
def add_months(d: date_cls, months: int) -> date_cls:
    y = d.year + (d.month - 1 + months) // 12
    m = (d.month - 1 + months) % 12 + 1
    last_day = calendar.monthrange(y, m)[1]
    return date_cls(y, m, min(d.day, last_day))


def weekly_dates(start: date_cls, months: int) -> list[date_cls]:
    end = add_months(start, months)
    out = []
    cur = start
    while cur < end:
        out.append(cur)
        cur += timedelta(days=7)
    return out


def _now_local():
    return timezone.localtime()


def _today_local():
    return timezone.localdate()


def _slot_label_from_times(start_t, end_t) -> str:
    def _fmt(t):
        if hasattr(t, "strftime"):
            return t.strftime("%H:%M")
        s = str(t)
        parts = s.split(":")
        return f"{parts[0]:0>2}:{parts[1]:0>2}"

    return f"{_fmt(start_t)} - {_fmt(end_t)}"


# ============================================================================
# Availability helpers
# ============================================================================
def _is_slot_open(field_obj: Field, d: date_cls, ts: Timeslot) -> bool:
    """
    OPEN BY DEFAULT.
    - If settings.ALWAYS_OPEN_SLOTS is True: skip weekly rules entirely.
    - If False: apply 'open-by-default if no weekly rows; closed if weekly rows exist
      and none is open'.
    - Blackouts are always enforced.
    """
    if not getattr(settings, "ALWAYS_OPEN_SLOTS", False):
        dow = d.weekday()
        weekly_qs = FieldWeeklySlot.objects.filter(
            playground=field_obj,
            day_of_week=dow,
            time_slot=ts,
        )
        # If there are weekly rows and none of them is open -> closed
        if weekly_qs.exists() and not weekly_qs.filter(is_open=True).exists():
            return False

    # Blackouts by date (optionally per-timeslot)
    blocked = FieldBlackout.objects.filter(
        playground=field_obj,
        date=d
    ).filter(
        models.Q(time_slot__isnull=True) | models.Q(time_slot=ts)
    ).exists()
    if blocked:
        return False

    return True


def _pending_fresh_q() -> models.Q:
    cutoff = _now_local() - timedelta(minutes=PENDING_HOLD_TTL_MINUTES)
    return models.Q(status=BookingStatus.PENDING, created_at__gte=cutoff)


def _has_conflict(field_obj: Field, d: date_cls, ts: Timeslot) -> bool:
    return Booking.objects.filter(
        playground=field_obj,
        date=d,
        time_slot=ts
    ).filter(
        models.Q(status=BookingStatus.APPROVED) | _pending_fresh_q()
    ).exists()


# ============================================================================
# Start checkout (series)
# ============================================================================
class StartCheckoutSeriesView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ok, msg = _require_chapa_config()
        if not ok:
            return Response({"error": f"Payment config error: {msg}"}, status=500)

        # Make a mutable copy to inject computed weekday regardless of input
        data = request.data.copy()

        # Parse minimal inputs so we can compute weekday and do existence checks
        try:
            field_id = int(data.get("playground"))
            time_slot_id = int(data.get("time_slot"))
            start_date_str = data.get("start_date")
            if not start_date_str:
                return Response({"start_date": ["This field is required."]}, status=400)
            start_date = dt_cls.strptime(start_date_str, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return Response({"detail": "Invalid playground/time_slot/start_date"}, status=400)

        # Always compute weekday from start_date (Mon=0..Sun=6)
        data["weekday"] = start_date.weekday()

        # Ensure field/timeslot exist (no weekly-closure hard fail here)
        try:
            field_obj = Field.objects.get(pk=field_id)
            ts_obj = Timeslot.objects.get(pk=time_slot_id)
        except Field.DoesNotExist:
            return Response({"playground": ["Selected field does not exist."]}, status=400)
        except Timeslot.DoesNotExist:
            return Response({"time_slot": ["Selected time slot does not exist."]}, status=400)

        # Validate via serializer (with computed weekday)
        create_ser = BookingSeriesCreateSerializer(data=data)
        try:
            create_ser.is_valid(raise_exception=True)
        except ValidationError:
            errs = create_ser.errors
            logger.error("StartCheckoutSeries invalid: %s", errs)
            nfe = errs.get("non_field_errors")
            if isinstance(nfe, (list, tuple)) and nfe:
                return Response({"detail": str(nfe[0]), **errs}, status=status.HTTP_400_BAD_REQUEST)
            return Response(errs, status=status.HTTP_400_BAD_REQUEST)

        series: BookingSeries = create_ser.save(status=SeriesStatus.DRAFT)

        # attach purchaser if logged-in
        if request.user.is_authenticated and getattr(series, "purchaser_id", None) is None:
            try:
                series.purchaser = request.user.profile  # type: ignore[attr-defined]
            except Exception:
                series.purchaser = None
            series.save(update_fields=["purchaser"])

        field_obj = series.playground
        ts = series.time_slot
        start = series.start_date
        months = series.months

        dates = weekly_dates(start, months)
        total_count = 0
        tx_ref = f"FIELDBOOK-{series.group_key}"

        # Reserve occurrences
        with transaction.atomic():
            for d in dates:
                if d < _today_local():
                    continue
                if not _is_slot_open(field_obj, d, ts):
                    continue
                if _has_conflict(field_obj, d, ts):
                    continue

                try:
                    Booking.objects.create(
                        series=series,
                        user=series.purchaser,
                        guest_name=series.guest_name,
                        guest_email=series.guest_email,
                        guest_phone=series.guest_phone,
                        playground=field_obj,
                        time_slot=ts,
                        date=d,
                        status=BookingStatus.PENDING,
                        is_booked=False,
                        is_paid=False,
                        chapa_tx_ref=tx_ref,
                    )
                    total_count += 1
                except IntegrityError:
                    continue

            if total_count == 0:
                series.delete()
                return Response(
                    {"error": "No available occurrences to book for the selected package."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            amount = (field_obj.price_per_session or 0) * total_count
            if amount <= 0:
                series.delete()
                return Response(
                    {"error": "Invalid total amount (<= 0). Check field price_per_session."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            series.amount_etb = amount
            series.currency = CURRENCY
            series.chapa_tx_ref = tx_ref
            series.status = SeriesStatus.PENDING
            series.save(update_fields=["amount_etb", "currency", "chapa_tx_ref", "status", "updated_at"])

            payment = ChapaPayment.objects.create(
                series=series, tx_ref=tx_ref, amount_etb=amount, currency=CURRENCY, status="initiated"
            )

        # Initialize Chapa transaction
        try:
            headers = {
                "Authorization": f"Bearer {CHAPA_SECRET_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            name = (series.guest_name or getattr(series.purchaser, "full_name", "") or "Guest").strip()
            email = (series.guest_email or getattr(series.purchaser, "email", "") or "guest@example.com").strip()
            slot_text = _slot_label_from_times(ts.start_time, ts.end_time)

            payload = {
                "amount": str(amount),
                "currency": series.currency or CURRENCY,
                "email": email,
                "first_name": name.split(" ", 1)[0] or name,
                "last_name": (name.split(" ", 1)[1] if " " in name else name),
                "tx_ref": tx_ref,
                "callback_url": CHAPA_CALLBACK_URL,
                "return_url": CHAPA_RETURN_URL,
                "customization[title]": "Playground Reservation",
                "customization[description]": f"{field_obj.name} · {slot_text} · {months} month(s)",
            }

            resp = requests.post(CHAPA_INIT_ENDPOINT, json=payload, headers=headers, timeout=HTTP_TIMEOUT_SEC)
            data = resp.json() if resp.content else {}
            if resp.status_code >= 400 or not data.get("status"):
                logger.error("Chapa initialize failed: %s", data)
                raise RuntimeError("Chapa initialize failed")

            checkout_url = (data.get("data") or {}).get("checkout_url")
            if not checkout_url:
                raise RuntimeError("Chapa did not return checkout_url")

            series.chapa_checkout_url = checkout_url
            series.save(update_fields=["chapa_checkout_url", "updated_at"])
            payment.checkout_url = checkout_url
            payment.save(update_fields=["checkout_url", "updated_at"])

            out = BookingSeriesSerializer(series).data
            out.update(
                {
                    "checkout_url": checkout_url,
                    "tx_ref": tx_ref,
                    "occurrences": total_count,
                    "amount_etb": str(amount),
                }
            )
            return Response(out, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Chapa init error")
            return Response({"error": f"Failed to start payment: {e}"}, status=status.HTTP_502_BAD_GATEWAY)


# ============================================================================
# Chapa verification
# ============================================================================
@api_view(["POST"])
@csrf_exempt
def chapa_callback(request):
    ok, msg = _require_chapa_config()
    if not ok:
        return Response({"error": f"Payment config error: {msg}"}, status=500)

    tx_ref = request.data.get("tx_ref") or request.POST.get("tx_ref") or request.GET.get("tx_ref")
    if not tx_ref:
        return Response({"error": "tx_ref is required"}, status=400)

    # Verify with Chapa
    try:
        headers = {"Authorization": f"Bearer {CHAPA_SECRET_KEY}", "Accept": "application/json"}
        url = f"{CHAPA_VERIFY_ENDPOINT}/{tx_ref}"
        resp = requests.get(url, headers=headers, timeout=HTTP_TIMEOUT_SEC)
        data = resp.json() if resp.content else {}
        ok = bool(data.get("status")) and str((data.get("data") or {}).get("status", "")).lower() == "success"
        if not ok:
            return Response({"status": "not_paid", "chapa": data}, status=200)
    except Exception as e:
        logger.exception("Chapa verify error")
        return Response({"error": f"verify_failed: {e}"}, status=502)

    # Mark series + bookings
    try:
        with transaction.atomic():
            payment = ChapaPayment.objects.select_for_update().get(tx_ref=tx_ref)
            series = payment.series

            if payment.status != "paid":
                payment.status = "paid"
                payment.paid_at = _now_local()
                payment.payload = data
                payment.save(update_fields=["status", "paid_at", "payload", "updated_at"])

            if series.status != SeriesStatus.APPROVED:
                series.status = SeriesStatus.APPROVED
                series.save(update_fields=["status", "updated_at"])

            cutoff = _now_local() - timedelta(minutes=PENDING_HOLD_TTL_MINUTES)
            qs = Booking.objects.select_for_update().filter(
                chapa_tx_ref=tx_ref, status=BookingStatus.PENDING, created_at__gte=cutoff
            )
            updated = 0
            for b in qs:
                b.status = BookingStatus.APPROVED
                b.is_paid = True
                b.is_booked = True
                b.save(update_fields=["status", "is_paid", "is_booked", "updated_at"])
                updated += 1

        return Response({"status": "paid", "approved_bookings": updated}, status=200)

    except ChapaPayment.DoesNotExist:
        return Response({"error": "payment_not_found"}, status=404)
    except Exception as e:
        logger.exception("Callback DB update failed")
        return Response({"error": str(e)}, status=500)


# ============================================================================
# Availability endpoints
# ============================================================================
@never_cache
@api_view(["GET"])
def booked_map(request):
    try:
        field_id = int(request.GET.get("field_id"))
        year = int(request.GET.get("year"))
        month = int(request.GET.get("month"))
        only_future = (request.GET.get("only_future", "1") != "0")
    except Exception:
        return Response({"error": "Provide valid field_id, year, month"}, status=400)

    field_obj = get_object_or_404(Field, pk=field_id)
    start = date_cls(year, month, 1)
    next_start = add_months(start, 1)
    today = _today_local()

    qs = Booking.objects.filter(
        playground=field_obj,
        date__gte=start,
        date__lt=next_start,
        status=BookingStatus.APPROVED
    ).values("date", "time_slot__start_time", "time_slot__end_time")

    booked = defaultdict(list)
    for row in qs:
        d = row["date"]
        if only_future and d < today:
            continue
        label = _slot_label_from_times(row["time_slot__start_time"], row["time_slot__end_time"])
        booked[d.isoformat()].append(label)

    return Response({"booked": booked}, status=200)


@never_cache
@api_view(["GET"])
def available_map(request):
    try:
        field_id = int(request.GET.get("field_id"))
        year = int(request.GET.get("year"))
        month = int(request.GET.get("month"))
        only_future = (request.GET.get("only_future", "1") != "0")
    except Exception:
        return Response({"error": "Provide valid field_id, year, month"}, status=400)

    field_obj = get_object_or_404(Field, pk=field_id)
    start = date_cls(year, month, 1)
    next_start = add_months(start, 1)
    today = _today_local()
    timeslots = list(Timeslot.objects.all().order_by("start_time"))

    out: dict[str, list[str]] = {}
    d = start
    while d < next_start:
        if only_future and d < today:
            d += timedelta(days=1)
            continue

        avail_labels = []
        for ts in timeslots:
            if not _is_slot_open(field_obj, d, ts):
                continue
            if _has_conflict(field_obj, d, ts):
                continue
            avail_labels.append(_slot_label_from_times(ts.start_time, ts.end_time))

        if avail_labels:
            out[d.isoformat()] = avail_labels
        d += timedelta(days=1)

    return Response({"available": out}, status=200)


@never_cache
@api_view(["GET"])
def available_by_type(request):
    sport_type = (request.GET.get("type") or "").strip().lower()
    try:
        year = int(request.GET.get("year"))
        month = int(request.GET.get("month"))
        only_future = (request.GET.get("only_future", "1") != "0")
    except Exception:
        return Response({"error": "Provide valid type, year, month"}, status=400)

    field_obj = Field.objects.filter(type=sport_type, is_active=True).first()
    if not field_obj:
        return Response({"available": {}}, status=200)

    start = date_cls(year, month, 1)
    next_start = add_months(start, 1)
    today = _today_local()
    timeslots = list(Timeslot.objects.all().order_by("start_time"))

    out: dict[str, list[str]] = {}
    d = start
    while d < next_start:
        if only_future and d < today:
            d += timedelta(days=1)
            continue

        avail_labels = []
        for ts in timeslots:
            if not _is_slot_open(field_obj, d, ts):
                continue
            if _has_conflict(field_obj, d, ts):
                continue
            avail_labels.append(_slot_label_from_times(ts.start_time, ts.end_time))

        if avail_labels:
            out[d.isoformat()] = avail_labels
        d += timedelta(days=1)

    return Response({"available": out}, status=200)


# ============================================================================
# Booking list/detail
# ============================================================================
class BookingView(APIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated and getattr(user, "is_staff", False):
            qs = Booking.objects.all().order_by("-created_at")
        elif user.is_authenticated:
            try:
                prof = user.profile  # type: ignore[attr-defined]
                qs = Booking.objects.filter(
                    models.Q(user=prof) | models.Q(series__purchaser=prof)
                ).order_by("-created_at")
            except Exception:
                qs = Booking.objects.none()
        else:
            qs = Booking.objects.none()

        return Response(BookingSerializer(qs, many=True).data, status=200)

    def post(self, request):
        if not (request.user.is_authenticated and getattr(request.user, "is_staff", False)):
            return Response({"error": "Admin only."}, status=403)

        ser = BookingCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        if not _is_slot_open(data["playground"], data["date"], data["time_slot"]):
            return Response({"error": "Slot closed or blacked out."}, status=400)
        if _has_conflict(data["playground"], data["date"], data["time_slot"]):
            return Response({"error": "Slot already taken."}, status=400)

        b = ser.save(status=BookingStatus.APPROVED, is_booked=True, is_paid=True)
        return Response(BookingSerializer(b).data, status=201)


class BookingDetailView(APIView):
    def get(self, request, pk):
        b = get_object_or_404(Booking, pk=pk)
        return Response(BookingSerializer(b).data, status=200)

    def put(self, request, pk):
        if not (request.user.is_authenticated and getattr(request.user, "is_staff", False)):
            return Response({"error": "Admin only."}, status=403)
        b = get_object_or_404(Booking, pk=pk)
        ser = BookingSerializer(b, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=200)

    def delete(self, request, pk):
        if not (request.user.is_authenticated and getattr(request.user, "is_staff", False)):
            return Response({"error": "Admin only."}, status=403)
        b = get_object_or_404(Booking, pk=pk)
        b.delete()
        return Response({"status": "deleted"}, status=200)


# ============================================================================
# Per-date availability array
# ============================================================================
class BookingAvailabilityView(APIView):
    """
    GET /booking/availability/?field_id=1&date=YYYY-MM-DD
    -> [{"label":"HH:MM - HH:MM","status":"available"|"booked"|"closed"}]
    """
    def get(self, request):
        date_str = request.query_params.get("date")
        field_id = request.query_params.get("field_id")
        if not date_str or not field_id:
            return Response({"error": "date and field_id are required"}, status=400)

        try:
            d = dt_cls.strptime(date_str, "%Y-%m-%d").date()
            field_obj = Field.objects.get(pk=int(field_id))
        except Exception:
            return Response({"error": "Invalid date or field_id"}, status=400)

        out = []
        for ts in Timeslot.objects.all().order_by("start_time"):
            label = _slot_label_from_times(ts.start_time, ts.end_time)
            if not _is_slot_open(field_obj, d, ts):
                out.append({"label": label, "status": "closed", "start_time": str(ts.start_time)[:5], "end_time": str(ts.end_time)[:5]})
                continue
            if _has_conflict(field_obj, d, ts):
                out.append({"label": label, "status": "booked", "start_time": str(ts.start_time)[:5], "end_time": str(ts.end_time)[:5]})
            else:
                out.append({"label": label, "status": "available", "start_time": str(ts.start_time)[:5], "end_time": str(ts.end_time)[:5]})
        return Response(out, status=200)


# ============================================================================
# Analytics
# ============================================================================
@api_view(["GET"])
def bookings_stats(request):
    today = _today_local()
    labels, values = [], []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = Booking.objects.filter(date=day).count()
        labels.append(day.strftime("%a"))
        values.append(count)
    return Response({"labels": labels, "values": values})


@api_view(["GET"])
def revenue(request):
    month = request.GET.get("month")
    if not month:
        return Response({"error": "month parameter required (YYYY-MM)"}, status=400)
    try:
        year, m = month.split("-")
        year = int(year)
        m = int(m)
    except Exception:
        return Response({"error": "Invalid month format"}, status=400)

    start = date_cls(year, m, 1)
    next_start = add_months(start, 1)

    qs = Booking.objects.filter(
        status=BookingStatus.APPROVED,
        date__gte=start,
        date__lt=next_start
    ).select_related("playground")

    total = sum([(b.playground.price_per_session or 0) for b in qs])
    return Response({"total_etb": str(total)}, status=200)


@api_view(["GET"])
def recent_activities(request):
    qs = Booking.objects.select_related("playground", "time_slot").order_by("-id")[:5]
    items = []
    for b in qs:
        slot_text = _slot_label_from_times(b.time_slot.start_time, b.time_slot.end_time)
        items.append(
            {
                "id": b.id,
                "text": f"{b.guest_name or getattr(getattr(b, 'user', None), 'full_name', 'User')} "
                        f"booked {b.playground.name} ({slot_text})",
                "time": b.date.isoformat(),
                "status": b.status,
            }
        )
    return Response(items, status=200)


# ============================================================================
# ViewSets + Payments list/detail
# ============================================================================
class BookingSeriesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BookingSeries.objects.all().order_by("-created_at")
    serializer_class = BookingSeriesSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        try:
            prof = user.profile  # type: ignore[attr-defined]
            return BookingSeries.objects.filter(
                models.Q(purchaser=prof) | models.Q(guest_email=user.email)
            ).order_by("-created_at")
        except Exception:
            return BookingSeries.objects.none()


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChapaPayment.objects.all().order_by("-created_at")
    serializer_class = ChapaPaymentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        try:
            prof = user.profile  # type: ignore[attr-defined]
            return ChapaPayment.objects.filter(series__purchaser=prof).order_by("-created_at")
        except Exception:
            return ChapaPayment.objects.none()


class PaymentListView(generics.ListAPIView):
    """
    GET /payments/?q=&status=&date=YYYY-MM-DD
    """
    serializer_class = ChapaPaymentSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = (
            ChapaPayment.objects
            .select_related("series", "series__playground", "series__time_slot")
            .order_by("-created_at")
        )
        q = (self.request.query_params.get("q") or "").strip()
        status_q = (self.request.query_params.get("status") or "").strip().lower()
        date = (self.request.query_params.get("date") or "").strip()

        if q:
            qs = qs.filter(
                models.Q(tx_ref__icontains=q) |
                models.Q(series__guest_name__icontains=q) |
                models.Q(series__guest_email__icontains=q) |
                models.Q(series__guest_phone__icontains=q) |
                models.Q(series__playground__name__icontains=q)
            )
        if status_q in {"initiated", "paid", "failed", "cancelled"}:
            qs = qs.filter(status=status_q)
        if date:
            qs = qs.filter(created_at__date=date)

        return qs


class PaymentDetailView(generics.RetrieveAPIView):
    """GET /payments/<id>/"""
    queryset = (
        ChapaPayment.objects
        .select_related("series", "series__playground", "series__time_slot")
        .all()
    )
    serializer_class = ChapaPaymentSerializer
    permission_classes = [permissions.AllowAny]
