from django.urls import path
from .views import TimeslotDetailView, TimeslotView

urlpatterns = [
    path('timeslot/', TimeslotView.as_view(), name='timeslot'),
    path('timeslot/<int:pk>/', TimeslotDetailView.as_view(), name='timeslotdetail'),
]
