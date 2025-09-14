from django.contrib import admin
from field.models import Field

@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'location', 'price_per_hour', 'is_active', 'created_at']

