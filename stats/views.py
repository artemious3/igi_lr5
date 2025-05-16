import base64
from io import BytesIO
from django.core import validators
from django.http import HttpResponse, response
from django.shortcuts import render
from django.db.models import Sum
from django.db.models.functions import Now, ExtractYear
from datetime import date
import statistics

from matplotlib.backends.backend_agg import FigureCanvasAgg
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from service_center.models import Client, OrderService, Order, Service
from threading import Lock

import numpy as np


def calculate_client_age_stats():
    birth_dates = Client.objects.exclude(birth_date__isnull=True).values_list('birth_date', flat=True)
    
    if not birth_dates:
        return {"average_age": None, "median_age": None}
    
    today = date.today()
    ages = []
    
    for birth_date in birth_dates:
        age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1
        ages.append(age)
    
    average_age = sum(ages) / len(ages)
    median_age = statistics.median(ages)
    
    return {
        "average_age": round(average_age, 2),
        "median_age": median_age
    }


def stats_view(req):
    age_stats = calculate_client_age_stats()
    return render(req, 'stats/stats.html', {"age_median":age_stats['median_age'],
                                            "age_avg":age_stats['average_age']})


mtx = Lock()
def http_barh_plot(req, names, values):
    with mtx:
        fg,ax = plt.subplots()
        fg.gca().xaxis.set_major_locator(MaxNLocator(integer=True))
        bars = ax.barh(names,values)
        # ax.set(xlabel='Number of orders')
        

        for bar in bars:
            width = bar.get_width()
            ax.text(width, bar.get_y() + bar.get_height()/2, 
                     f'{width:.1f}', 
                     ha='left', va='center')
        

        plt.tight_layout()
        resp = HttpResponse(content_type='image/png')
        canvas = FigureCanvasAgg(fg)
        canvas.print_png(resp)
        return resp

def most_popular_service_stat(req):
    srv = dict()
    for service in Service.objects.all():
        srv[service.name] = OrderService.objects.filter(service=service).count()

    sorted_srv = sorted(srv.items(), key=lambda x : x[1], reverse=False)[:10]
    names = [item[0] for item in sorted_srv]
    values = [item[1] for item in sorted_srv]
    return http_barh_plot(req,names, values)

def most_profitable_service_stat(req):
    srv = dict()
    for service in Service.objects.all():
        sum = OrderService.objects.filter(service=service).aggregate(total=Sum('number'))['total']
        if sum is None:
            sum = 0
        srv[service.name] = sum * service.price
    sorted_srv = sorted(srv.items(), key=lambda x : x[1], reverse=False)[:10]
    names = [item[0] for item in sorted_srv]
    values = [item[1] for item in sorted_srv]
    return http_barh_plot(req,names, values)







