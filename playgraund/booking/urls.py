from django.urls import path
from .views import (
    StartCheckoutSeriesView, chapa_callback,
    booked_map, available_map, available_by_type,
    BookingView, BookingDetailView, BookingAvailabilityView,
    bookings_stats, revenue, recent_activities,
    PaymentListView, PaymentDetailView,
)

urlpatterns = [
    path("series/start-checkout/", StartCheckoutSeriesView.as_view(), name="start-checkout-series"),
    path("payments/chapa/callback/", chapa_callback, name="chapa-callback"),

    # Payments (read-only)
    path("payments/", PaymentListView.as_view(), name="payments-list"),
    path("payments/<int:pk>/", PaymentDetailView.as_view(), name="payments-detail"),

    path("availability/booked-map/", booked_map, name="booked-map"),
    path("availability/available-map/", available_map, name="available-map"),
    path("availability/by-type/", available_by_type, name="available-by-type"),
    path("availability/", BookingAvailabilityView.as_view(), name="availability-by-date"),

    path("booking/", BookingView.as_view(), name="booking"),
    path("booking/<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),

    path("bookings/stats/", bookings_stats, name="bookings-stats"),
    path("revenue/", revenue, name="revenue"),
    path("activities/", recent_activities, name="recent-activities"),
]
