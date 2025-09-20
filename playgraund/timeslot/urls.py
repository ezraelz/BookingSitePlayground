from django.urls import path
from .views import TimeslotView, TimeslotDetailView

urlpatterns = [
    path("timeslot/", TimeslotView.as_view(), name="timeslot-list"),
    path("timeslot/<int:pk>/", TimeslotDetailView.as_view(), name="timeslot-detail"),
]
