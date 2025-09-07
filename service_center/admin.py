from django.db.models import Model
from django.contrib import admin
from . import models

admin.site.register(models.Client)
admin.site.register(models.Employee)

admin.site.register(models.Service)
admin.site.register(models.Device)
admin.site.register(models.SparePart)
admin.site.register(models.PromoCodes)
admin.site.register(models.About)


@admin.register(models.Order)
class OrderAdmin(admin.ModelAdmin):
    list_display=["__str__", "client", "total_service_price", "total_spare_parts_price", "total_price"]
    readonly_fields = ["total_service_price", "total_spare_parts_price", "total_price"]
    list_filter=["client"]


# admin.site.register(models.Order)
