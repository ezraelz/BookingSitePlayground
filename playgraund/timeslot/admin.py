# timeslot/admin.py
from django.contrib import admin
from .models import Timeslot
from datetime import datetime, date, timedelta


@admin.register(Timeslot)
class TimeslotAdmin(admin.ModelAdmin):
    # Computed helpers
    def label(self, obj: Timeslot) -> str:
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"
    label.short_description = "Label"

    def duration(self, obj: Timeslot) -> str:
        # show duration in HH:MM for convenience
        dt = datetime
        start = dt.combine(date(2000, 1, 1), obj.start_time)
        end = dt.combine(date(2000, 1, 1), obj.end_time)
        if end < start:
            end += timedelta(days=1)  # in case someone creates a wrap-around slot
        minutes = int((end - start).total_seconds() // 60)
        return f"{minutes // 60:02d}:{minutes % 60:02d}"
    duration.short_description = "Duration"

    list_display = (
        "id",
        "label",
        "start_time",
        "end_time",
        "duration",
        "is_active",
    )
    list_display_links = ("id", "label")
    list_editable = ("is_active",)
    list_filter = ("is_active",)
    search_fields = ("start_time", "end_time")
    ordering = ("start_time", "end_time")
