from django.contrib import admin
from booking.models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'playground', 'user', 'guest_name', 'guest_email', 'guest_phone', 'time_slot', 'created_at', 'duration', 'date']
    
