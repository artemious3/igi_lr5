
from news import models
from django.shortcuts import render


def index(req):
   recent_news = models.News.objects.order_by('-date').first()
   return render(req, "index.html", {"news":recent_news})
