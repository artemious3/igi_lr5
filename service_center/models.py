from os import name
from django.core import validators
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

User = get_user_model()
PhoneValidator = RegexValidator(r'\+375\s?\d{2}\s?\d{3}-?\d{2}-?\d{2}', message='Phone number should be +375 XX XXX-XX-XX')


class Device(models.Model):
    name =  models.CharField(max_length=64)

    def __str__(self):
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=128)
    price = models.IntegerField()
    device_type = models.ForeignKey(Device, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class SparePart(models.Model):
    name = models.CharField(max_length=128)
    price = models.IntegerField()
    device = models.ForeignKey(Device, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

def validate_age_18(birth_date):
    today = timezone.now().date()
    print(today.year - birth_date.year)
    if (today.year - birth_date.year) < 18 or \
       (today.year - birth_date.year == 18 and 
        (today.month, today.day) < (birth_date.month, birth_date.day)):
        raise ValidationError("Client must be at least 18 years old.")

class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=16, validators=[PhoneValidator])
    birth_date = models.DateField(validators=[validate_age_18])
    address = models.CharField(max_length=64)
    passport_id = models.CharField(max_length=10)


    def __str__(self):
        return " ".join([self.user.first_name, self.user.last_name])

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=16, validators=[PhoneValidator])

    def __str__(self):
        return " ".join([self.user.first_name, self.user.last_name])


class Order(models.Model):
    date_created = models.DateField(default=now)
    # TMP : null = true
    date_scheduled = models.DateField()
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=False)

    submitted = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    # services = models.ManyToManyField(Service, blank=False)
    # spare_parts = models.ManyToManyField(SparePart, null=True)


    class Meta:
        permissions = {
                ("client_perm", "Can create order (clients)"),
                ("employee_perm", "Can approve order (employees)")
            }

    def total_service_price(self):
        return sum([service.service.price * service.number for service in self.order_services.all()])

    def total_spare_parts_price(self):
        return sum([sp.spare_part.price * sp.number for sp in self.order_spare_parts.all()])

    def total_price(self):
        return self.total_spare_parts_price() + self.total_service_price()


    def __str__(self):
        return f"Order {self.id} from {self.client}"


class OrderService(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_services')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    number = models.IntegerField(validators=[MinValueValidator(1)])


class OrderSpareParts(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_spare_parts')
    spare_part = models.ForeignKey(Service, on_delete=models.CASCADE)
    number = models.IntegerField(validators=[MinValueValidator(1)])

