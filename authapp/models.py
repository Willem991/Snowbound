from django.db import models
from django.contrib.auth.models import User

class Penguin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='penguin')
    color = models.CharField(max_length=50)
    name = models.CharField(max_length=15)
    age = models.IntegerField()


