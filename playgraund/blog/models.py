from django.db import models

class Blog(models.Model):
    title = models.CharField(("Title"), max_length=50)
    image = models.ImageField(("Image"), upload_to='blog/', height_field=None, width_field=None, max_length=None)
    description = models.TextField(("Description"))
    created_at = models.DateField(("Created at"), auto_now=False, auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
