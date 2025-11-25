from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Penguin

class PenguinForm(forms.ModelForm):
    class Meta:
        model = Penguin
        fields = ['name', 'color', 'age']