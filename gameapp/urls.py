from django.contrib import admin
from django.urls import path, include
from . import views

app_name = "gameapp"

urlpatterns = [
    path('game', views.GameView.as_view(), name="game")
]
