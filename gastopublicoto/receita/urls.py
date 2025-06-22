from django.urls import path
from . import views

app_name = 'receita'

urlpatterns = [
    path('', views.receita, name='receita'),
    path('receita2023/', views.receita2023, name='receita2023'),
    path('fpefundeb/', views.fpefundeb, name='fpefundeb'),
]