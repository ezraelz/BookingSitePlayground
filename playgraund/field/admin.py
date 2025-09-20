from django.contrib import admin
from .models import Field


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "type", "location", "price_per_session", "is_active", "created_at")
    search_fields = ("name", "location")
    list_filter = ("type", "is_active")
    ordering = ("name",)
