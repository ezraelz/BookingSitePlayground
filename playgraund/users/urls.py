from django.urls import path
from .views import UsersView, UserDetailView

urlpatterns = [
    path('users/', UsersView.as_view(), name='users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
