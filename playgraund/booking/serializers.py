# booking/serializers.py
from __future__ import annotations

from datetime import date as date_cls

from django.conf import settings
from django.db import models
from django.utils import timezone
from rest_framework import serializers

# Import Field/Timeslot from their dedicated apps
from field.models import Field
from timeslot.models import Timeslot

# Import booking app models
from .models import (
    FieldWeeklySlot,
    FieldBlackout,
    BookingSeries,
    Booking,
    ChapaPayment,
)

# =========================
# Timeslot
# =========================

class TimeslotSerializer(serializers.ModelSerializer):
    """
    Timeslot has only: id, start_time, end_time.
    We compute 'label' and 'sequence' for convenience.
    """
    label = serializers.SerializerMethodField()
    sequence = serializers.SerializerMethodField()

    class Meta:
        model = Timeslot
        fields = ["id", "label", "start_time", "end_time", "sequence"]
        read_only_fields = ["label", "sequence"]

    def get_label(self, obj: Timeslot) -> str:
        # "HH:MM–HH:MM" (en dash, no seconds)
        return f"{obj.start_time.strftime('%H:%M')}–{obj.end_time.strftime('%H:%M')}"

    def get_sequence(self, obj: Timeslot) -> int:
        # minutes since midnight (useful for ordering client-side)
        return obj.start_time.hour * 60 + obj.start_time.minute


# =========================
# Field / Playground
# =========================

class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        # Keep fields that exist on your Field model used by booking
        fields = ["id", "name", "type", "price_per_session", "is_active", "capacity"]


# =========================
# Weekly open/close + Blackouts
# =========================

class FieldWeeklySlotSerializer(serializers.ModelSerializer):
    playground = FieldSerializer(read_only=True)
    time_slot = TimeslotSerializer(read_only=True)

    playground_id = serializers.PrimaryKeyRelatedField(
        source="playground", queryset=Field.objects.all(), write_only=True
    )
    time_slot_id = serializers.PrimaryKeyRelatedField(
        source="time_slot", queryset=Timeslot.objects.all(), write_only=True
    )

    class Meta:
        model = FieldWeeklySlot
        fields = [
            "id",
            "playground", "time_slot", "day_of_week", "is_open",
            "playground_id", "time_slot_id",
        ]


class FieldBlackoutSerializer(serializers.ModelSerializer):
    playground = FieldSerializer(read_only=True)
    time_slot = TimeslotSerializer(read_only=True)

    playground_id = serializers.PrimaryKeyRelatedField(
        source="playground", queryset=Field.objects.all(), write_only=True
    )
    time_slot_id = serializers.PrimaryKeyRelatedField(
        source="time_slot", queryset=Timeslot.objects.all(),
        write_only=True, allow_null=True, required=False
    )

    class Meta:
        model = FieldBlackout
        fields = [
            "id",
            "playground", "date", "time_slot", "reason",
            "playground_id", "time_slot_id",
        ]


# =========================
# Booking (single occurrence)
# =========================

class BookingSerializer(serializers.ModelSerializer):
    playground = FieldSerializer(read_only=True)
    time_slot = TimeslotSerializer(read_only=True)
    # Comes from Booking.price_etb property; DRF will render as string
    price_etb = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "series",
            "user",
            "guest_name", "guest_email", "guest_phone",
            "playground", "time_slot", "date",
            "status", "is_booked", "is_paid",
            "chapa_tx_ref",
            "price_etb",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "status", "is_booked", "is_paid",
            "chapa_tx_ref", "price_etb",
            "created_at", "updated_at",
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    playground = serializers.PrimaryKeyRelatedField(queryset=Field.objects.all())
    time_slot = serializers.PrimaryKeyRelatedField(queryset=Timeslot.objects.all())

    class Meta:
        model = Booking
        fields = [
            "user", "guest_name", "guest_email", "guest_phone",
            "playground", "time_slot", "date",
        ]

    def validate(self, data):
        d: date_cls = data["date"]
        if d < timezone.localdate():
            raise serializers.ValidationError({"date": "Cannot book in the past."})

        # Weekly open/close (OPEN BY DEFAULT, and allow global bypass)
        dow = d.weekday()
        if not getattr(settings, "ALWAYS_OPEN_SLOTS", False):
            weekly_qs = FieldWeeklySlot.objects.filter(
                playground=data["playground"],
                day_of_week=dow,
                time_slot=data["time_slot"],
            )
            # If there are weekly rows and none is open -> closed
            if weekly_qs.exists() and not weekly_qs.filter(is_open=True).exists():
                raise serializers.ValidationError("This field/weekday/timeslot is currently closed weekly.")

        # Blackout check (still enforced)
        blocked = FieldBlackout.objects.filter(
            playground=data["playground"], date=d
        ).filter(
            models.Q(time_slot__isnull=True) | models.Q(time_slot=data["time_slot"])
        ).exists()
        if blocked:
            raise serializers.ValidationError("This date/slot is blacked out.")

        return data


# =========================
# Series (package purchase)
# =========================

class BookingSeriesSerializer(serializers.ModelSerializer):
    playground = FieldSerializer(read_only=True)
    time_slot = TimeslotSerializer(read_only=True)

    class Meta:
        model = BookingSeries
        fields = [
            "id", "group_key", "status",
            "purchaser", "guest_name", "guest_email", "guest_phone",
            "playground", "time_slot", "weekday",
            "months", "start_date",
            "chapa_tx_ref", "chapa_checkout_url",
            "amount_etb", "currency",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "group_key", "status",
            "chapa_tx_ref", "chapa_checkout_url",
            "amount_etb", "currency",
            "created_at", "updated_at",
        ]


class BookingSeriesCreateSerializer(serializers.ModelSerializer):
    playground = serializers.PrimaryKeyRelatedField(queryset=Field.objects.all())
    time_slot = serializers.PrimaryKeyRelatedField(queryset=Timeslot.objects.all())

    class Meta:
        model = BookingSeries
        fields = [
            "purchaser", "guest_name", "guest_email", "guest_phone",
            "playground", "time_slot", "weekday",
            "months", "start_date",
        ]

    def validate(self, data):
        if data["months"] not in {1, 3, 6}:
            raise serializers.ValidationError({"months": "Only 1, 3, or 6 months are allowed."})

        start: date_cls = data["start_date"]
        if start.weekday() != data["weekday"]:
            raise serializers.ValidationError({"start_date": "Start date must match the chosen weekday."})
        if start < timezone.localdate():
            raise serializers.ValidationError({"start_date": "Start date cannot be in the past."})

        # Weekly open/close (OPEN BY DEFAULT, and allow global bypass)
        if not getattr(settings, "ALWAYS_OPEN_SLOTS", False):
            weekly_qs = FieldWeeklySlot.objects.filter(
                playground=data["playground"],
                day_of_week=data["weekday"],
                time_slot=data["time_slot"],
            )
            if weekly_qs.exists() and not weekly_qs.filter(is_open=True).exists():
                raise serializers.ValidationError("This field/weekday/timeslot is currently closed weekly.")

        # Blackout check (still enforced for the start date)
        blocked = FieldBlackout.objects.filter(
            playground=data["playground"], date=start
        ).filter(
            models.Q(time_slot__isnull=True) | models.Q(time_slot=data["time_slot"])
        ).exists()
        if blocked:
            raise serializers.ValidationError("The start date is blacked out.")

        return data

    def create(self, validated_data):
        return BookingSeries.objects.create(**validated_data)


# =========================
# Payment
# =========================

class ChapaPaymentSerializer(serializers.ModelSerializer):
    series = BookingSeriesSerializer(read_only=True)
    # helper for creating via API if you ever need it
    series_id = serializers.PrimaryKeyRelatedField(
        source="series", queryset=BookingSeries.objects.all(), write_only=True
    )

    class Meta:
        model = ChapaPayment
        fields = [
            "id",
            "series", "series_id",
            "tx_ref", "amount_etb", "currency",
            "status", "checkout_url", "paid_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "status", "checkout_url", "paid_at",
            "created_at", "updated_at",
        ]
