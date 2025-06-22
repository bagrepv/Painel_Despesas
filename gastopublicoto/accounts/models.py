from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext as _
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

class UserProfileManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O campo de Email deve ser preenchido')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('O superusuário deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('O superusuário deve ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class UserProfile(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True, blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)
    orgao = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    can_access_despesa_receita = models.BooleanField(default=False)
    can_access_receita_2023 = models.BooleanField(default=False)
    can_access_receita_2024 = models.BooleanField(default=False)
    can_access_fpefundeb = models.BooleanField(default=False)
    can_access_despesa_2023 = models.BooleanField(default=False)
    can_access_despesa_2024 = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)  # Novo campo para armazenar o último IP de login

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    is_staff = models.BooleanField(
        _('status de staff'),
        default=False,
        help_text=_('Indica se o usuário pode acessar este site de administração.'),
    )
    is_superuser = models.BooleanField(
        _('status de superusuário'),
        default=False,
        help_text=_('Indica que este usuário possui todas as permissões sem atribuí-las explicitamente.'),
    )

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    def get_short_name(self):
        return self.first_name

    def send_email_ip_change(self, new_ip):
        """
        Método para enviar um e-mail notificando a mudança de IP.
        """
        if self.last_login_ip and self.last_login_ip != new_ip:
            send_mail(
                subject='Login detectado de um novo IP',
                message=f'Um login foi feito a partir de um novo IP: {new_ip}. O último IP utilizado foi: {self.last_login_ip}.',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[self.email],
                fail_silently=False,
            )

# Novo modelo para registrar cada login
class UserLoginHistory(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='login_history')
    login_ip = models.GenericIPAddressField()
    login_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Login de {self.user.email} em {self.login_time} do IP {self.login_ip}"
