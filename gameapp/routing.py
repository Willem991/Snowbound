# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path("main/game", consumers.ChatConsumer.as_asgi()),
]