from django.middleware import csrf
from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.urls import reverse, reverse_lazy
from django.views.generic import CreateView, DeleteView, UpdateView
from django.views.decorators.csrf import requires_csrf_token
from django.core.exceptions import PermissionDenied

from service_center.forms import AddServiceForm, NewOrderForm
from .models import Client, Order, OrderService


@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def client_index(req):
    return render(req, 'service_center/client/client_index.html')



@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def orders_unapproved_view(req):
   user = req.user 
   client = Client.objects.get(user=user)
   orders = Order.objects.filter(client=client)
   submitted_orders = orders.filter(submitted=True)
   unsubmitted_orders = orders.filter(submitted=False)
   return render(req, 'service_center/client/orders_unapproved.html', {"submitted_orders":submitted_orders, 
                                                         "unsubmitted_orders":unsubmitted_orders})


@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def orders_approved_view(req):
   user = req.user 
   client = Client.objects.get(user=user)
   orders = Order.objects.filter(client=client)
   submitted_orders = orders.filter(submitted=True)
   unsubmitted_orders = orders.filter(submitted=False)
   return render(req, 'service_center/client/orders_approved.html', {"submitted_orders":submitted_orders, 
                                                     "unsubmitted_orders":unsubmitted_orders})


# @requires_csrf_token
@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def order_submit_view(req, order_id):
    order = get_object_or_404(Order,pk=order_id)
    client = Client.objects.get(user=req.user)
    if order.client != client:
        return HttpResponseForbidden();

    if req.method=="POST":
        order.submitted = True
        order.save()
        return HttpResponseRedirect(reverse_lazy('orders_unapproved'))
    else:
        return render(req, 'service_center/client/order_submit.html', {"order": order,
                                                                "csrf_token":csrf.get_token(req)})


class OrderDeleteView(DeleteView, LoginRequiredMixin, PermissionRequiredMixin):
    model = Order
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/order_delete.html'
    success_url = reverse_lazy('orders_unapproved')

    def dispatch(self, request, *args, **kwargs):
        order_id = self.kwargs.get('pk')
        self.order = get_object_or_404(Order, id=order_id)
        if self.order.client != self.request.user.client:
            raise PermissionDenied("You have no access to this order")
        return super().dispatch(request, *args, **kwargs)


class OrderNewView(CreateView, LoginRequiredMixin, PermissionRequiredMixin):
    form_class = NewOrderForm
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/order_create.html'
    success_url = reverse_lazy('orders_unapproved')

    def get_form_kwargs(self):
        kwargs = super(OrderNewView, self).get_form_kwargs()
        kwargs['client'] = Client.objects.get(user=self.request.user)
        return kwargs


class OrderServiceUpdateView(UpdateView, LoginRequiredMixin, PermissionRequiredMixin):
    model = OrderService
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/services_update.html'
    fields = ["number"]
    success_url = reverse_lazy('orders_unapproved')

    # TODO : check if order belongs to user

class OrderServiceDeleteView(DeleteView, LoginRequiredMixin, PermissionRequiredMixin):
    model = OrderService
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/services_delete.html'
    success_url = reverse_lazy('orders_unapproved')

    # TODO : check if order belongs to user



class AddServiceView(CreateView, LoginRequiredMixin, PermissionRequiredMixin):
    form_class = AddServiceForm
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/service_add.html'
    success_url = reverse_lazy('orders_unapproved')

    def dispatch(self, request, *args, **kwargs):
        order_id = self.kwargs.get('order_id')
        self.order = get_object_or_404(Order, id=order_id)
        if self.order.client != self.request.user.client:
            raise PermissionDenied("You have no access to this order")
        if self.order.approved:
            raise PermissionDenied("Approved orders can not be changed")
        
        return super(AddServiceView, self).dispatch(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super(AddServiceView, self).get_form_kwargs()
        kwargs['order'] = self.order 
        return kwargs




# def create_order_view(req):


