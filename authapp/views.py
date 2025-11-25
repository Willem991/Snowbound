from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .forms import PenguinForm

class RegisterView(View):
    template_name = "authapp/register.html"

    def get(self, request):
        return render(request, self.template_name, {
            "user_form": UserCreationForm(),
            "penguin_form": PenguinForm(),
        })

    def post(self, request):
        user_form = UserCreationForm(request.POST)
        penguin_form = PenguinForm(request.POST)

        if user_form.is_valid() and penguin_form.is_valid():
            user = user_form.save()
            penguin = penguin_form.save(commit=False)
            penguin.user = user
            penguin.save()
            return redirect("login")

        return render(request, self.template_name, {
            "user_form": user_form,
            "penguin_form": penguin_form,
        })