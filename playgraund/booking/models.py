from django.db import models
from field.models import Field
from users.models import Profile
from timeslot.models import Timeslot

class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]

    # Registered user (optional)
    user = models.ForeignKey(
        Profile,
        verbose_name=("User"),
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    # Guest details (only filled if user is NULL)
    guest_name = models.CharField(max_length=100, null=True, blank=True)
    guest_email = models.EmailField(null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)

    playground = models.ForeignKey(
        Field,
        verbose_name=("Playground"),
        on_delete=models.CASCADE
    )
    time_slot = models.ForeignKey(
        Timeslot,
        verbose_name=("Time Slot"),
        on_delete=models.CASCADE
    )
    duration = models.IntegerField(("Duration"), default=1)
    date = models.DateField(("Date"), auto_now=False, auto_now_add=True, null=True)
    status = models.CharField(
        ("Status"),
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(("Updated at"), auto_now=True)
    is_booked = models.BooleanField(("Is Booked"), default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.playground.name} {self.time_slot}"

    @property
    def is_guest(self):
        """Check if booking belongs to a guest."""
        return self.user is None



