from django.db import models
from field.models import Field

class Timeslot(models.Model):
    field = models.ForeignKey(Field, verbose_name=("Field"), on_delete=models.CASCADE)
    start_time = models.TimeField(("Start Time"), auto_now=False, auto_now_add=False)
    end_time = models.TimeField(("End Time"), auto_now=False, auto_now_add=False)
    is_booked = models.BooleanField(("Is Booked"))

    def __str__(self):
        return f"{self.start_time} {self.end_time}"
    