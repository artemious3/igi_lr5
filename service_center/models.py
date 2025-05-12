from os import name
from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model

User = get_user_model()


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

    # def __str__(self):I
    #     return self.name



class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=16)
    address = models.CharField(max_length=64)
    passport_id = models.CharField(max_length=10)

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=16)
    services = models.ManyToManyField(Service)


class Order(models.Model):
    date_created = models.DateField(default=now)
    date_scheduled = models.DateField()
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    employee = models.ForeignKey(User, on_delete=models.CASCADE)

    approved = models.BooleanField(default=False)
    services = models.ManyToManyField(Service)
    spare_parts = models.ManyToManyField(SparePart)


    class Meta:
        permissions = {
                ("client_perm", "Can create order (clients)"),
                ("employee_perm", "Can approve order (employees)")
            }





    
