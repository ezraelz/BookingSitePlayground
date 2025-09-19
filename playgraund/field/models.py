from django.db import models


class SportType(models.TextChoices):
    FOOTBALL = "football", "Football"
    TENNIS = "tennis", "Tennis"
    BASKETBALL = "basketball", "Basketball"


class Field(models.Model):
    """
    One row per playground (you said 3 total). Price is per 2-hour session.
    """
    name = models.CharField("Name", max_length=100, unique=True)
    type = models.CharField("Sport Type", max_length=20, choices=SportType.choices)
    price_per_session = models.DecimalField("Price per Session (ETB)", max_digits=12, decimal_places=2)

    # Optional display fields (keep for your UI)
    location = models.CharField("Location", max_length=100, blank=True, default="")
    image = models.ImageField("Image", upload_to="fields/", blank=True, null=True)

    is_active = models.BooleanField("Is Active", default=True)
    capacity = models.PositiveSmallIntegerField("Capacity", default=1)
    created_at = models.DateTimeField("Created At", auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["type", "is_active"]),
        ]
        ordering = ("name",)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
