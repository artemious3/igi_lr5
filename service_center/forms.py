
import datetime
from tkinter import Widget
from turtle import width
from typing import Required
import django
from django import forms
from django.forms import ModelForm, ValidationError
from django import forms
from django.utils.timezone import now
from django.contrib.auth import get_user_model

from news import models
from .models import Employee, Order, OrderService, OrderSpareParts



class AddServiceForm(ModelForm):
    """Add service to an order"""

    def __init__(self, *args, **kvargs):
        self.order = kvargs.pop('order', None)
        super(ModelForm, self).__init__(*args, **kvargs)

    class Meta:
        model = OrderService
        fields = ("service", "number")

    def clean_service(self):
        service = self.cleaned_data['service']
        if OrderService.objects.filter(order=self.order).filter(service=service).exists():
            raise ValidationError("This service is already added for order")
        return service

    def save(self, commit=True):
        order_to_service = super().save(commit=False)
        order_to_service.order = self.order

        if commit:
            order_to_service.save()
        return order_to_service



class AddSpecificServiceForm(ModelForm):
    """Add service to an order"""

    def __init__(self, *args, **kvargs):
        self.service = kvargs.pop('service', None)
        self.client = kvargs.pop('client', None)


        super(ModelForm, self).__init__(*args, **kvargs)

        if self.client:
            self.fields['order'].queryset = self.fields['order'].queryset.filter(client=self.client).filter(submitted=False)
        else:
            self.fields['order'].queryset = self.fields['order'].queryset.none()

    class Meta:
        model = OrderService
        fields = ("order", "number")

    def clean_order(self):
        order = self.cleaned_data['order']
        if OrderService.objects.filter(order=order).filter(service=self.service).exists():
            raise ValidationError("This service is already added for order")
        return order

    def save(self, commit=True):
        order_to_service = super().save(commit=False)
        order_to_service.service = self.service

        if commit:
            order_to_service.save()
        return order_to_service

class AddSparePartForm(ModelForm):
    """Add spare part to an order"""

    def __init__(self, *args, **kvargs):
        self.order = kvargs.pop('order', None)
        super(ModelForm, self).__init__(*args, **kvargs)

    class Meta:
        model = OrderSpareParts
        fields = ("spare_part", "number")

    def clean_service(self):
        spare_part = self.cleaned_data['spare_part']
        if OrderSpareParts.objects.filter(order=self.order).filter(spare_part=spare_part).exists():
            raise ValidationError("This spare part is already added for order")
        return spare_part

    def save(self, commit=True):
        order_to_sp = super().save(commit=False)
        order_to_sp.order = self.order

        if commit:
            order_to_sp.save()
        return order_to_sp



class NewOrderForm(ModelForm):
    """Create blank order"""
    date_scheduled = forms.DateField(initial = datetime.date.today() + datetime.timedelta(days=1))

    def __init__(self, *args, **kvargs):
        self.client = kvargs.pop('client', None)
        super(ModelForm, self).__init__(*args, **kvargs)


    class Meta:
        model = Order
        fields = ("employee", "date_scheduled")

    def clean_date_scheduled(self):
        date = self.cleaned_data['date_scheduled']
        if date <= datetime.date.today():
            raise ValidationError("Date can't be in the past")
        if date > datetime.date.today() + datetime.timedelta(days=180):
            raise ValidationError("Date can't be later than 180 days after today")
        return date


    def save(self, commit=True):
        order = super().save(commit=False)
        order.approved = False
        order.client = self.client

        if commit:
            order.save()
        return order



class NewEmployeeForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput(), label='Password')
    first_name = forms.CharField(required=True,max_length=30,label='First Name')
    last_name = forms.CharField(required=True, max_length=30,label='Last Name')

    email = forms.EmailField(required=True, label='Email')
    image = forms.ImageField(required=True)
    phone_number = forms.CharField(max_length=19)
    specification = forms.CharField(widget=forms.Textarea)

    def save(self, commit=True):
        User = get_user_model()
        user = User.objects.create_user(
            username=self.cleaned_data['username'],
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name']
        )

        employee = Employee(
            user=user,
            image=self.cleaned_data['image'],
            phone_number=self.cleaned_data['phone_number'],
            specification=self.cleaned_data['specification']
        )

        if commit:
            employee.save()
        return employee
