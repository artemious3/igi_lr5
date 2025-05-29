from math import log
import django
from django.contrib.auth import logout
from django.urls import path
from .views import SignUpView, logout_v

from django.contrib.auth.views import LoginView

urlpatterns = [
   path('login/', LoginView.as_view(), name='login'),
   path('signup/', SignUpView.as_view(), name='signup'),
    path('logout/', logout_v, name='logout')
]
