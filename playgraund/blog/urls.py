from django.urls import path
from .views import BlogDetailView, BlogView

urlpatterns = [
    path('blog/', BlogView.as_view(), name='blog'),
    path('blog/<int:pk>/', BlogDetailView.as_view(), name='blogdetail'),
]
