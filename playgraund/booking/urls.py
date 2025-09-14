from django.urls import path
from .views import BookingDetailView, BookingView

urlpatterns = [
    path('booking/', BookingView.as_view(), name='booking'),
    path('booking/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
]
