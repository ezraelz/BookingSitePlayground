# field/urls.py
from django.urls import path
from .views import FieldView, FieldDetailView

urlpatterns = [
    path("fields/", FieldView.as_view(), name="fields-list-create"),
    path("fields/<int:pk>/", FieldDetailView.as_view(), name="fields-detail"),
]
