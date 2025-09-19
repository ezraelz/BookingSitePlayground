from django.db import models

class Timeslot(models.Model):
    start_time = models.TimeField()
    end_time   = models.TimeField()
    is_active  = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["start_time", "end_time"], name="uniq_timeslot_start_end"
            )
        ]
        ordering = ["start_time", "end_time"]

    def __str__(self):
        return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
