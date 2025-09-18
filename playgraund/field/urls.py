from django.urls import path
from .views import FieldDetailView, FieldView

urlpatterns = [
    path('fields/', FieldView.as_view(), name='field'),
    path('field/<int:pk>/', FieldDetailView.as_view(), name='field-detail'),
]
