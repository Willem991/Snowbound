from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.GameView.as_view(), name="game")
]
