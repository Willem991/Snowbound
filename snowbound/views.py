from django.shortcuts import render
from django.views.generic import TemplateView

class HomeView(TemplateView):
    template_name = "index.html"

class AboutView(TemplateView):
    template_name = "about.html"

class SupportView(TemplateView):
    template_name = "support.html"

class NewsView(TemplateView):
    template_name = "whatsnew.html"