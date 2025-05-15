from django.urls import path
from .views import *

urlpatterns = [
        path('', stats_view, name='stats'),
        path('img/most-popular-service', most_popular_service_stat, name='most_popular_service'),
        path('img/most-profitable-service', most_profitable_service_stat, name='most_profitable_service')

]
