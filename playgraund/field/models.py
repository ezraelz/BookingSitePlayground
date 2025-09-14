from django.db import models

class Field(models.Model):
    name = models.CharField(("Name"), max_length=50)
    location = models.CharField(("Location"), max_length=50)
    price_per_hour = models.DecimalField(("Price Per Hour"), max_digits=5, decimal_places=2)
    is_active = models.BooleanField(("Is Active"), default=False)
    created_at = models.DateField(("Created At"), auto_now=False, auto_now_add=True)

    def __str__(self):
        return f"{self.name} {self.location}"
    
