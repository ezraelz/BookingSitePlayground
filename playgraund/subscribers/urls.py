from django.urls import path
from .views import SubscribersView, SubscribersDetailView, CheckSubscribtion

urlpatterns = [
    path('subscribers/', SubscribersView.as_view(), name='subscribers'),
    path('subscribers/<int:pk>/', SubscribersDetailView.as_view(), name='subscribers-detail'),
    path('subscribed/check/', CheckSubscribtion.as_view(), name='subscribed-check'),
]
