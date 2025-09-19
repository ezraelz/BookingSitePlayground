from django.contrib import admin
from .models import Booking, BookingSeries, ChapaPayment

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "playground", "date", "time_slot", "status", "is_paid")
    list_filter = ("status", "is_paid", "playground")
    search_fields = ("guest_name", "guest_email", "playground__name")
    ordering = ("-created_at",)

@admin.register(BookingSeries)
class BookingSeriesAdmin(admin.ModelAdmin):
    list_display = ("id", "playground", "weekday", "time_slot", "months", "status")
    list_filter = ("status", "weekday", "months")
    ordering = ("-created_at",)

@admin.register(ChapaPayment)
class ChapaPaymentAdmin(admin.ModelAdmin):
    list_display = ("tx_ref", "series", "amount_etb", "status", "paid_at")
    list_filter = ("status",)
    ordering = ("-created_at",)
