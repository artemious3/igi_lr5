"""
URL configuration for l5 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django import urls
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from . import views
from . import settings
import auth

urlpatterns = [
    path('', views.index, name='index'),
    path('bamboleo/', views.bamboleo, name='bamboleo'),
    path('forms/', views.forms_demo, name='forms_demo'),
    # path('auth/', include("django.contrib.auth.urls")),
    path('auth/', include("auth.urls")),
    path('service/', include("service_center.urls")),
    path('admin/', admin.site.urls),
    path('news/', include('news.urls'), name='news'),
    path('vacancies/', include('vacancies.urls'), name='vacancies'),
    path('faq/', include('faq.urls')),
    path('reviews/', include('reviews.urls')),
    path('stats/', include('stats.urls')),
    path('jstest/int', views.interactive_input),
    path('jstest/chart', views.charts),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
