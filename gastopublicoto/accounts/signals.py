from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import UserProfile, UserLoginHistory
from django.utils import timezone


# Função para pegar o IP do usuário
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]  # Em casos de proxies, pode haver uma lista de IPs
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@receiver(user_logged_in)
def track_user_login(sender, request, user, **kwargs):
    current_ip = get_client_ip(request)

    # Verifica se o IP mudou e envia um e-mail
    if user.last_login_ip != current_ip:
        user.send_email_ip_change(current_ip)

    # Atualiza o campo last_login_ip
    user.last_login_ip = current_ip
    user.save()

    # Registra o login no histórico
    UserLoginHistory.objects.create(user=user, login_ip=current_ip, login_time=timezone.now())
