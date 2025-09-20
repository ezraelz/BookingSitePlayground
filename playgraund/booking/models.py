from __future__ import annotations

import uuid
from decimal import Decimal

from django.db import models
from django.utils import timezone

# Use your existing user profile (adjust if you switch to a custom User)
from users.models import Profile

# IMPORTANT: import Field/Timeslot from their dedicated apps
from field.models import Field
from timeslot.models import Timeslot


# =========================
# Choices
# =========================

class BookingStatus(models.TextChoices):
    PENDING = "pending", "Pending"         # hold during Chapa checkout
    APPROVED = "approved", "Approved"      # paid & confirmed
    CANCELLED = "cancelled", "Cancelled"   # admin-only (policy says: no refunds)


class SeriesStatus(models.TextChoices):
    DRAFT = "draft", "Draft"               # created, before checkout
    PENDING = "pending", "Pending Payment" # checkout started (hold)
    APPROVED = "approved", "Approved"      # paid
    CANCELLED = "cancelled", "Cancelled"   # admin-only


class PaymentStatus(models.TextChoices):
    INITIATED = "initiated", "Initiated"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"


class EthiopianWeekday(models.IntegerChoices):
    MONDAY = 0, "Monday"
    TUESDAY = 1, "Tuesday"
    WEDNESDAY = 2, "Wednesday"
    THURSDAY = 3, "Thursday"
    FRIDAY = 4, "Friday"
    SATURDAY = 5, "Saturday"
    SUNDAY = 6, "Sunday"


# =========================
# Flexibility controls
# =========================

class FieldWeeklySlot(models.Model):
    """
    Weekly open/close toggle per field/day/slot.
    Gives you the 'open every day' default and the ability to close certain
    days/slots manually without editing inventory.
    """
    playground = models.ForeignKey(
        Field, on_delete=models.CASCADE, related_name="weekly_slots"
    )
    day_of_week = models.IntegerField(choices=EthiopianWeekday.choices)
    time_slot = models.ForeignKey(Timeslot, on_delete=models.CASCADE)
    is_open = models.BooleanField(default=True)

    class Meta:
        unique_together = [("playground", "day_of_week", "time_slot")]
        indexes = [
            models.Index(fields=["playground", "day_of_week"]),
            models.Index(fields=["is_open"]),
        ]

    def __str__(self):
        return f"{self.playground} / {self.get_day_of_week_display()} / {self.time_slot} ({'Open' if self.is_open else 'Closed'})"


class FieldBlackout(models.Model):
    """
    Manual blackout for maintenance/events.
    If time_slot is NULL => whole day blocked.
    """
    playground = models.ForeignKey(
        Field, on_delete=models.CASCADE, related_name="blackouts"
    )
    date = models.DateField()
    time_slot = models.ForeignKey(
        Timeslot, on_delete=models.CASCADE, null=True, blank=True
    )
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = [("playground", "date", "time_slot")]
        indexes = [
            models.Index(fields=["playground", "date"]),
        ]

    def __str__(self):
        scope = "ALL DAY" if self.time_slot is None else str(self.time_slot)
        return f"Blackout {self.playground} on {self.date} ({scope})"


# =========================
# Purchases (Series) + Occurrences (Booking)
# =========================

class BookingSeries(models.Model):
    """
    One purchase covering weekly occurrences for 1/3/6 months
    at the same weekday+timeslot for a single field.
    """
    SERIES_MONTHS_CHOICES = (
        (1, "1 month"),
        (3, "3 months"),
        (6, "6 months"),
    )

    group_key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(
        max_length=20, choices=SeriesStatus.choices, default=SeriesStatus.DRAFT
    )

    # Buyer (guest or user)
    purchaser = models.ForeignKey(
        Profile, null=True, blank=True, on_delete=models.SET_NULL, related_name="field_series"
    )
    guest_name = models.CharField(max_length=100, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)

    # What is reserved
    playground = models.ForeignKey(
        Field, on_delete=models.PROTECT, related_name="series"
    )
    time_slot = models.ForeignKey(
        Timeslot, on_delete=models.PROTECT, related_name="series"
    )
    weekday = models.IntegerField(choices=EthiopianWeekday.choices)

    # Package
    months = models.PositiveSmallIntegerField(choices=SERIES_MONTHS_CHOICES)
    start_date = models.DateField(
        help_text="First booked date chosen by user (must match the same weekday)."
    )

    # Chapa (init -> redirect -> callback)
    chapa_tx_ref = models.CharField(max_length=128, blank=True, default="", unique=True)
    chapa_checkout_url = models.URLField(blank=True, default="")

    amount_etb = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=10, default="ETB")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["playground", "weekday"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        who = self.purchaser or self.guest_name or "Guest"
        return f"Series {self.group_key} ({self.months}m) [{self.playground} / {self.get_weekday_display()} / {self.time_slot}] by {who}"

    @property
    def is_guest(self) -> bool:
        return self.purchaser is None


class Booking(models.Model):
    """
    A single 2-hour booking occurrence (generated for each week).
    Unique per (playground, date, time_slot).
    """
    series = models.ForeignKey(
        BookingSeries, null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings"
    )

    # Registered user (optional) or guest
    user = models.ForeignKey(
        Profile, null=True, blank=True, on_delete=models.SET_NULL, related_name="field_bookings"
    )
    guest_name = models.CharField(max_length=100, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)

    playground = models.ForeignKey(
        Field, on_delete=models.PROTECT, related_name="bookings"
    )
    time_slot = models.ForeignKey(
        Timeslot, on_delete=models.PROTECT, related_name="bookings"
    )
    # IMPORTANT: client provides the date (no auto_now / auto_now_add)
    date = models.DateField()

    status = models.CharField(
        max_length=20, choices=BookingStatus.choices, default=BookingStatus.PENDING
    )
    is_booked = models.BooleanField(default=False)
    is_paid = models.BooleanField(default=False)

    # Link to Chapa (filled if created directly via occurrence – normally series drives payment)
    chapa_tx_ref = models.CharField(max_length=128, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("playground", "date", "time_slot")]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["status"]),
            models.Index(fields=["playground", "date"]),
        ]

    def __str__(self):
        who = self.user or self.guest_name or "Guest"
        return f"{self.playground} @ {self.date} {self.time_slot} [{self.get_status_display()}] by {who}"

    @property
    def price_etb(self) -> Decimal:
        """
        Prefer a per-session price if your Field has it; otherwise
        fall back to price_per_hour (2 hours/session) if present.
        """
        # If your field.Field has price_per_session:
        if hasattr(self.playground, "price_per_session") and self.playground.price_per_session is not None:
            return Decimal(self.playground.price_per_session)

        # Fallback to price_per_hour if that's what your Field exposes
        if hasattr(self.playground, "price_per_hour") and self.playground.price_per_hour is not None:
            try:
                return Decimal(str(self.playground.price_per_hour)) * Decimal("2")
            except Exception:
                return Decimal("0.00")

        return Decimal("0.00")

    @property
    def is_guest(self) -> bool:
        return self.user is None


class ChapaPayment(models.Model):
    """
    Single payment per series (no refunds per policy).
    """
    series = models.OneToOneField(
        BookingSeries, on_delete=models.CASCADE, related_name="payment"
    )
    tx_ref = models.CharField(max_length=128, unique=True)
    amount_etb = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="ETB")
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED
    )
    checkout_url = models.URLField(blank=True, default="")
    paid_at = models.DateTimeField(null=True, blank=True)

    payload = models.JSONField(null=True, blank=True)  # optional audit

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"ChapaPayment {self.tx_ref} [{self.get_status_display()}] {self.amount_etb} {self.currency}"

    def mark_paid(self, payload: dict | None = None):
        self.status = PaymentStatus.PAID
        self.paid_at = timezone.now()
        if payload:
            self.payload = payload
        self.save(update_fields=["status", "paid_at", "payload", "updated_at"])


# =========================
# Signals: keep flags aligned
# =========================

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Booking)
def _sync_flags_on_approved(sender, instance: Booking, **kwargs):
    """
    If a booking becomes APPROVED, ensure flags are true.
    """
    if instance.status == BookingStatus.APPROVED:
        updates = []
        if not instance.is_paid:
            instance.is_paid = True; updates.append("is_paid")
        if not instance.is_booked:
            instance.is_booked = True; updates.append("is_booked")
        if updates:
            # Avoid recursion: update only the fields we changed
            Booking.objects.filter(pk=instance.pk).update(**{k: getattr(instance, k) for k in updates})
