from django.shortcuts import render
from django.views.generic import TemplateView
import os
from snowbound import settings

app_name = "gameapp"

# Create your views here.
class GameView(TemplateView):
    template_name = "gameapp/game.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # pick the folder in STATICFILES_DIRS you want
        folder = settings.BASE_DIR / "gameapp" / "static" / "gameapp" / "img"
        try:
            files_shirts = [f for f in os.listdir(folder / "clothes" / "shirts") if os.path.isfile(os.path.join(folder, f))]
        except FileNotFoundError:
            files_shirts = []

        try:
            files_pants = [f for f in os.listdir(folder / "clothes" / "pants") if os.path.isfile(os.path.join(folder, f))]
        except FileNotFoundError:
            files_pants = []

        try:
            files_glasses = [f for f in os.listdir(folder / "clothes" / "glasses") if os.path.isfile(os.path.join(folder, f))]
        except FileNotFoundError:
            files_glasses = []

        try:
            files_igloos = [f for f in os.listdir(folder / "igloos" / "igloos") if os.path.isfile(os.path.join(folder, f))]
        except FileNotFoundError:
            files_igloos = []

        try:
            files_furniture = [f for f in os.listdir(folder / "igloos" / "furniture") if os.path.isfile(os.path.join(folder, f))]
        except FileNotFoundError:
            files_furniture = []

        files = {
            "shirts":files_shirts,
            "pants":files_pants,
            "glasses":files_glasses,
            "igloos":files_igloos,
            "furniture":files_furniture
        }

        context['image_files'] = files
        return context