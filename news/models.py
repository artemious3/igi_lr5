from django.conf import django
from django.db import models
from django.utils.timezone import now


class News(models.Model):
    head = models.CharField(max_length=255)
    brief_content = models.TextField()
    content = models.TextField()
    date = models.DateField(default=now)
    image = models.ImageField(upload_to='news/')

    def __str__(self):
        return self.head

# Create your models here.
