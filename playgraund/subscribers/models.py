from django.db import models

class Subscribers(models.Model):
    email = models.EmailField(("email"), max_length=254)
    created_at = models.DateField(("Created At"), auto_now=False, auto_now_add=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email
    
    
