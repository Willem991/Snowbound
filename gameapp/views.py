from django.shortcuts import render
from django.views.generic import TemplateView

app_name = "gameapp"

# Create your views here.
class GameView(TemplateView):
    template_name = "gameapp/game.html"