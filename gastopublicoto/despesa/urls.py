from django.urls import path
from . import views

app_name = 'despesa'

urlpatterns = [
    path('', views.despesa, name='despesa'),
    path('despesa2023/', views.despesa2023, name='despesa2023'),
]