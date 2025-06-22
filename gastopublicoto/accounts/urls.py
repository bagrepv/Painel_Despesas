from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('', views.home, name='home'),
    path('termos_condicoes/', views.termos_condicoes, name='termos_condicoes'),
    path('login/', views.login, name='login'),
    path('cadastrar/', views.register, name='register'),
    path('perfil/', views.profile, name='profile'),
    path('sair/', views.logout, name='logout'),
    path('admin_panel/', views.admin_panel, name='admin_panel'),
    path('delete_user/<int:user_id>/', views.delete_user, name='delete_user'),
    path('esqueci_senha/', views.forgot_password, name='forgot_password'),
    path('reset_senha/<uidb64>/<token>/', views.reset_password, name='reset_password'),
    path('permission_denied_view/', views.permission_denied_view, name='permission_denied_view'),
]
