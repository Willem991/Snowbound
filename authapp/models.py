from django.db import models
from django.contrib.auth.models import User

class Penguin(models.Model):

    colour_choices = [
        ("red", "red"), ("blue", "blue"), ("green","green"), 
        ("purple", "purple"), ("pink","pink"), ("orange","orange"),
        ("yellow","yellow")
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='penguin')
    color = models.CharField(max_length=50, choices=colour_choices, default="red")
    name = models.CharField(max_length=15)
    created_date = models.DateField(auto_now=True)
    
    clothes = models.ManyToManyField(
        "gameapp.Clothes",
        through="gameapp.PenguinClothes",
        related_name="penguins"
    )

    def __str__(self):
        return self.name
