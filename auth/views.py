from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import CreateView
from .forms import SignUpForm
from django.contrib.auth import logout

from django.shortcuts import get_object_or_404, render


def logout_v(req):
    if req.method == "GET":
        return render(req, 'registration/logout.html')
    else:
        logout(req)
        return HttpResponseRedirect('/')


class SignUpView(CreateView):
    form_class = SignUpForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

