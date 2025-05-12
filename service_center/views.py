import django
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, permission_required


@login_required
@permission_required('can_create')
def orders_view(req):
    pass


