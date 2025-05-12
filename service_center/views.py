from django.shortcuts import render
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import CreateView, FormView

from service_center.forms import OrderForm
from .models import Client, Order


@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def orders_view(req):
   user = req.user 
   client = Client.objects.get(user=user)
   orders = Order.objects.filter(client=client)
   return render(req, 'service_center/orders.html', {"order_list":orders})




class OrderNewView(CreateView, LoginRequiredMixin, PermissionRequiredMixin):
    form_class = OrderForm
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/order_create.html'
    success_url = "/service/orders/"

    def get_form_kwargs(self):
        kwargs = super(OrderNewView, self).get_form_kwargs()
        kwargs['client'] = Client.objects.get(user=self.request.user)
        return kwargs


# def create_order_view(req):


