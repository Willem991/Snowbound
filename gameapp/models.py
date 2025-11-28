from django.db import models

class Clothes(models.Model):
    name = models.CharField(max_length=50)
    price = models.IntegerField()
    url_name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class PenguinClothes(models.Model):
    penguin = models.ForeignKey("authapp.Penguin", on_delete=models.CASCADE)
    clothes = models.ForeignKey("gameapp.Clothes", on_delete=models.CASCADE)
    bought_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('penguin', 'clothes')

    def __str__(self):
        return f"{self.penguin} owns {self.clothes}"
