from django.urls import path
from .views import SubscribersView, SubscribersDetailView

urlpatterns = [
    path('subscribers/', SubscribersView.as_view(), name='subscribers'),
    path('subscribers/<int:pk>/', SubscribersDetailView.as_view(), name='subscribers-detail'),
]
