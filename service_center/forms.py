
from django.forms import ModelForm, ValidationError
from .models import Order


class OrderForm(ModelForm):
    class Meta:
        model = Order
        fields = ["services"]

    def clean_services(self):
        services = self.cleaned_data.get("services")
        if services == []:
            raise ValidationError(_("Order must have services"))
        return services

    def save(self, commit=True):
        return super().save(commit)

