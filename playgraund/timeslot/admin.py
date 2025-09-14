from django.contrib import admin
from .models import Timeslot

@admin.register(Timeslot)
class TimeslotAdmin(admin.ModelAdmin):
    list_display = ['id', 'field', 'start_time', 'end_time', 'date', 'is_booked']
    
