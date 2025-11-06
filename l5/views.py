
from django.http import HttpResponseRedirect
from news import models
from django.shortcuts import render


def index(req):
   recent_news = models.News.objects.order_by('-date').first()
   return render(req, "index.html", {"news":recent_news})

def bamboleo(req):
    return render(req, "video.html")

def forms_demo(req):
    if req.method=="POST":
        return HttpResponseRedirect("service/index/")
    else:
        return render(req, "form.html")

def interactive_input(req):
    return render(req, "jstest/interactive_input.html")
