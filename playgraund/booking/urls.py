from django.urls import path
from .views import (
    BookingDetailView,
    BookingView, 
    BookingAvailabilityView,
    Revenue, bookings_stats, recent_activities,
    BookingsPermonth, RevenuePerPlayground,
    BookingsPerUser
    )

urlpatterns = [
    path('booking/', BookingView.as_view(), name='booking'),
    path('booking/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    path('availability/', BookingAvailabilityView.as_view(), name='availability'),

    path("revenue/", Revenue.as_view(), name="revenue"),
    path("bookings/stats/", bookings_stats, name="bookings-stats"),
    path("bookings/per_month/", BookingsPermonth.as_view(), name="bookings-per_month"),
    path("bookings/per_user/", BookingsPerUser.as_view(), name="bookings-per-user"),
    path("revenue/per_playground/", RevenuePerPlayground.as_view(), name="revenue-per-playground"),

    path("activities/", recent_activities, name="recent-activities"),
]
