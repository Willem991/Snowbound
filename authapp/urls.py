from django.contrib.auth import views as auth_views
from . import views
from django.urls import path

app_name = 'authapp'

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='authapp/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register')
]
