from urllib import request
from django.db.models.base import pre_init
from django.middleware import csrf
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect, JsonResponse
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.urls import reverse, reverse_lazy
from django.views.generic import CreateView, DeleteView, UpdateView
from django.views.decorators.csrf import requires_csrf_token
from django.core.exceptions import PermissionDenied

from django.utils.html import escape

from service_center.forms import AddServiceForm, AddSparePartForm, NewOrderForm, AddSpecificServiceForm
from .models import Client, Employee, Order, OrderService, OrderSpareParts, Service, PromoCodes, About

import datetime
import calendar
import requests


###################################################################
####################  NO AUTH REQUIRED  ###########################
###################################################################

def service_index(req, orderby):
    services = []
    if orderby == '':
        services = Service.objects.all()
    else:
        services = Service.objects.order_by(orderby)

    return render(req, 'service_center/client/services_index.html', {"services":services})


def contacts_view(req):
    employees = Employee.objects.all()
    return render(req, 'service_center/client/contacts.html', {"employees":employees})

def contacts_table_view(req):
    return render(req, 'service_center/client/contacts_table.html')

def contacts_json_view(req):
    employees = Employee.objects.select_related('user').all()
    employees_data = []
    for employee in employees:
        employees_data.append({
            'user': {
                'first_name': employee.user.first_name,
                'last_name': employee.user.last_name,
                'email': employee.user.email
            },
            'phone_number': employee.phone_number,
            'image': employee.image.url if employee.image else None,
            'specification': employee.specification
        })

    return JsonResponse({
        'employees': employees_data,
    })


def conf_policy_view(req):
    return render(req, 'service_center/conf_policy.html')

from constance import config

def about_view(req):

    #resp = requests.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
    #img_url = []
    #if resp.status_code == 200:
    #    img_url = resp.json()["url"]
    #else:
    #    img_url = ""

    about = About.objects.first()

    return render(req, 'service_center/about.html', {"about":about, "config":config})


def service_json_index(req):
    services_list = Service.objects.all().order_by('id')

    services_data = list(services_list.values('id', 'name', 'price'))

    return JsonResponse({
        'services': services_data,
    })



from django.views.generic import ListView

class PromocodesView(ListView):
    model = PromoCodes
    template_name = 'service_center/client/promocodes.html'


###################################################################
####################  COMMON ######################################
###################################################################


def redirect_to_user_index(req):
    if req.user.groups.filter(name='Employee').exists():
        return HttpResponseRedirect(reverse_lazy('staff_index'))
    elif req.user.groups.filter(name='Client').exists():
        return HttpResponseRedirect(reverse_lazy('client_index'))
    else:
        return HttpResponseRedirect(reverse_lazy('login'))




###################################################################
####################  CLIENT STUFF  ###############################
###################################################################

@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def client_index(req):
    client = req.user.client
    now = datetime.datetime.now()
    year = now.year
    month = now.month

    # Generate and print the calendar
    cal = calendar.month(year, month)
    timezone = ''
    try:
        timezone = req.COOKIES['django_timezone']
    except KeyError:
        timezone = 'Unknown'

    dt_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M:%S")

    # resp = requests.get('https://catfact.ninja/fact')
    # cat_fact = []
    # if resp.status_code == 200:
    #     cat_fact = resp.json()["fact"]
    # else:
    #     cat_fact = ""


    return render(req, 'service_center/client/client_index.html', {"client":client,
                                                                   "timezone":timezone,
                                                                   "dt_utc":dt_utc,
                                                                   "calendar":cal, })



@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def orders_unapproved_view(req):
   user = req.user
   client = Client.objects.get(user=user)
   orders = Order.objects.filter(client=client)
   submitted_orders = orders.filter(submitted=True, approved=False)
   unsubmitted_orders = orders.filter(submitted=False)
   return render(req, 'service_center/client/orders_unapproved.html', {"submitted_orders":submitted_orders,
                                                         "unsubmitted_orders":unsubmitted_orders})


@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def orders_approved_view(req):
   user = req.user
   client = Client.objects.get(user=user)
   orders = Order.objects.filter(client=client).filter(approved=True)
   return render(req, 'service_center/client/orders_approved.html', {"orders":orders})


# @requires_csrf_token
@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def order_submit_view(req, order_id):
    order = get_object_or_404(Order,pk=order_id)
    client = Client.objects.get(user=req.user)
    if order.client != client:
        return HttpResponseForbidden();

    if req.method=="POST":
        if not order.order_services.exists():
            return render(req, 'service_center/client/order_cant_submit.html')
        order.submitted = True
        order.save()
        return HttpResponseRedirect(reverse_lazy('orders_unapproved'))
    else:
        return render(req, 'service_center/client/order_submit.html', {"order": order,
                                                                "csrf_token":csrf.get_token(req)})

class OrderDeleteView( LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
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

@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def order_pay_post(req, order_id):
    if req.method == "POST":
        # TODO : check for user belonging
        order = get_object_or_404(Order, id=order_id)
        order.paid = True
        order.save()
        return HttpResponseRedirect(reverse_lazy('orders_unapproved'))
    else:
        return render(req, 'service_center/client/order_pay.html')



class OrderNewView(LoginRequiredMixin, PermissionRequiredMixin, CreateView) :
    form_class = NewOrderForm
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/order_create.html'
    success_url = reverse_lazy('orders_unapproved')

    def get_form_kwargs(self):
        kwargs = super(OrderNewView, self).get_form_kwargs()
        kwargs['client'] = Client.objects.get(user=self.request.user)
        return kwargs


class OrderServiceUpdateView( LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    model = OrderService
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/services_update.html'
    fields = ["number"]
    success_url = reverse_lazy('orders_unapproved')

    # TODO : check if order belongs to user

class OrderServiceDeleteView( LoginRequiredMixin, PermissionRequiredMixin, DeleteView):
    model = OrderService
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/services_delete.html'
    success_url = reverse_lazy('orders_unapproved')

    # TODO : check if order belongs to user



class AddServiceView(LoginRequiredMixin, PermissionRequiredMixin, CreateView):
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


class AddSpecificServiceView(LoginRequiredMixin, PermissionRequiredMixin, CreateView):
    form_class = AddSpecificServiceForm
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/client/add_to_cart.html'
    success_url = reverse_lazy('orders_unapproved')

    def dispatch(self, request, *args, **kwargs):
        service_id = self.kwargs.get('service_id')
        self.service = get_object_or_404(Service, id=service_id)

        return super(AddSpecificServiceView, self).dispatch(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super(AddSpecificServiceView, self).get_form_kwargs()
        kwargs['service'] = self.service
        kwargs['client'] = self.request.user.client
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['service'] = self.service
        return context


def service_info_view(req, service_id):
    service = get_object_or_404(Service, id=service_id)
    return render(req, 'service_center/client/service_info.html', {'object':service})


@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def incr_service_in_order(req, order_id, service_id):
    if req.method == "POST":
        order_service = get_object_or_404(OrderService, order = order_id, service = service_id)
        number = order_service.number
        order_service.number = number + 1
        order_service.save()
        return HttpResponseRedirect(reverse_lazy('orders_unapproved'))

@login_required
@permission_required('service_center.client_perm', raise_exception=True)
def decr_service_in_order(req, order_id, service_id):
    if req.method == "POST":
        order_service = get_object_or_404(OrderService, order = order_id, service = service_id)
        number = order_service.number
        if number > 0:
            order_service.number = number - 1
        order_service.save()
        return HttpResponseRedirect(reverse_lazy('orders_unapproved'))


###################################################################
####################  STAFF STUFF  ################################
###################################################################

@login_required
@permission_required('service_center.employee_perm', raise_exception=True)
def staff_orders_unapproved_view(req):
    employee = Employee.objects.get(user=req.user)
    orders_subm = Order.objects.filter(submitted=True, approved=False, employee=employee).order_by('date_scheduled')
    return render(req, 'service_center/staff/orders_unapproved_view.html', {"orders":orders_subm})

@login_required
@permission_required('service_center.employee_perm', raise_exception=True)
def staff_orders_approved_view(req):
    employee = Employee.objects.get(user=req.user)
    orders_subm = Order.objects.filter(submitted=True, approved=True, employee=employee).order_by('-date_scheduled')
    return render(req, 'service_center/staff/orders_approved_view.html', {"orders":orders_subm})

@login_required
@permission_required('service_center.employee_perm', raise_exception=True)
def staff_index(req):
    return render(req, 'service_center/staff/index.html')


@login_required
@permission_required('service_center.employee_perm', raise_exception=True)
def order_complete_view(req, pk):
    order = get_object_or_404(Order,pk=pk)
    employee = Employee.objects.get(user=req.user)
    if order.employee != employee:
        return HttpResponseForbidden();

    if req.method=="POST":
        order.approved = True
        order.save()
        return HttpResponseRedirect(reverse_lazy('staff_orders_unappr'))
    else:
        return render(req, 'service_center/staff/order_complete.html', {"order": order,
                                                                    "csrf_token":csrf.get_token(req)})

class SparePartUpdateView(UpdateView, LoginRequiredMixin, PermissionRequiredMixin):
    model = OrderSpareParts
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/staff/order_spare_part_change.html'
    fields = ["number"]
    success_url = reverse_lazy('staff_orders_unappr')

    # TODO : check if order belongs to user

class SparePartDeleteView(DeleteView, LoginRequiredMixin, PermissionRequiredMixin):
    model = OrderSpareParts
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/staff/order_spare_part_delete.html'
    success_url = reverse_lazy('staff_orders_unappr')

    # TODO : check if order belongs to user


class AddSparePartView(CreateView, LoginRequiredMixin, PermissionRequiredMixin):
    form_class = AddSparePartForm
    permission_required = 'service_center.client_perm'
    template_name = 'service_center/staff/order_spare_part_add.html'
    success_url = reverse_lazy('staff_orders_unappr')

    def dispatch(self, request, *args, **kwargs):
        order_id = self.kwargs.get('pk')
        self.order = get_object_or_404(Order, id=order_id)
        if self.order.employee != self.request.user.employee:
            raise PermissionDenied("You have no access to this order")
        if self.order.approved:
            raise PermissionDenied("Approved orders can not be changed")

        return super(AddSparePartView, self).dispatch(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super(AddSparePartView, self).get_form_kwargs()
        kwargs['order'] = self.order
        return kwargs


def client_info_view(req, pk):
    client = Client.objects.get(pk=pk)
    return render(req, 'service_center/staff/client_info.html', {"client":client})







# def create_order_view(req):
