


from django.urls import path

from .views import AddServiceView, OrderServiceDeleteView, OrderNewView, OrderServiceUpdateView, client_index, orders_approved_view, orders_unapproved_view, order_submit_view, OrderDeleteView

urlpatterns = [
        path('profile/', client_index, name='client_index'),
        path('orders/approved', orders_approved_view, name='orders_approved'),
        path('orders/unapproved', orders_unapproved_view, name='orders_unapproved'),
        path('orders/<int:order_id>/submit/', order_submit_view, name='order_submit'),
        path('orders/<int:pk>/delete/', OrderDeleteView.as_view(), name='order_delete'),
        path('order/new/', OrderNewView.as_view(), name='order_new'),
        path('order/<int:order_id>/add-service/', AddServiceView.as_view(), name='order_service_add'),
        path('orders/<int:pk>/update-service/', OrderServiceUpdateView.as_view(), name='order_service_update'),
        path('orders/<int:pk>/delete-service/', OrderServiceDeleteView.as_view(), name='order_service_delete'),
    ]
