from django.urls import path
from .views import UsersView, UserDetailView, LoginView, logout_view, CheckLogin

urlpatterns = [
    path('users/', UsersView.as_view(), name='users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    path('signin/', LoginView.as_view(), name='signin'),
    path('logout/', logout_view, name='logout'),

    path('login/check/', CheckLogin.as_view(), name='login-check'),

]
