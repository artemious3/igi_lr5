


from django.urls import path

from .views import OrderNewView, orders_view

urlpatterns = [
        path('orders/', orders_view, name='orders'),
        path('order-new/', OrderNewView.as_view(), name='order_new')
    ]
