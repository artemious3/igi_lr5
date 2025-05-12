
from django.forms import ModelForm, ValidationError

from news import models
from .models import Order


class OrderForm(ModelForm):
    def __init__(self, *args, **kvargs):
        self.client = kvargs.pop('client', None)
        super(ModelForm, self).__init__(*args, **kvargs)



    class Meta:
        model = Order
        fields = ("services",)

    def clean_services(self):
        services = self.cleaned_data.get("services")
        if services == []:
            raise ValidationError(_("Order must have services"))
        return services


    def save(self, commit=True):
        order = super().save(commit=False)
        order.approved = False
        order.date_scheduled = None
        order.client = self.client

        if commit:
            order.save()
        return order

