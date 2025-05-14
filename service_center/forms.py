
from django.forms import ModelForm, ValidationError

from news import models
from .models import Order, OrderService



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




class NewOrderForm(ModelForm):
    """Create blank order"""

    def __init__(self, *args, **kvargs):
        self.client = kvargs.pop('client', None)
        super(ModelForm, self).__init__(*args, **kvargs)


    class Meta:
        model = Order
        fields = ()


    def save(self, commit=True):
        order = super().save(commit=False)
        order.approved = False
        order.date_scheduled = None
        order.client = self.client

        if commit:
            order.save()
        return order

