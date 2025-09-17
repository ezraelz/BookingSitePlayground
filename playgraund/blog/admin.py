from django.contrib import admin
from .models import Blog

@admin.register(Blog)
class AdminBlog(admin.ModelAdmin):
    list_display = ['id', 'title','description', 'image', 'created_at']
