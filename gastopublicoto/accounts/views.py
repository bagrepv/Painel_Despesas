import bcrypt
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import UserProfile
import re

from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_str, force_bytes
from django.template.loader import render_to_string


# Função da página inicial
def home(request):
    # Obtém o ID do usuário a partir da sessão
    user_id = request.session.get('user_id')

    if user_id:
        # Recupera o objeto UserProfile com base no ID
        user = UserProfile.objects.get(id=user_id)
        is_admin = user.is_admin  # Obtém o valor de is_admin
        # Renderiza a página inicial com informações do usuário e se é um administrador
        return render(request, 'index.html', {'user': user, 'is_admin': is_admin})
    else:
        # Redireciona para a página de login se o usuário não estiver autenticado
        return redirect('accounts:login')


# Função para exibir os termos e condições
def termos_condicoes(request):
    # Renderiza a página de termos e condições
    return render(request, 'termos_condicoes.html')


# Função para o registro de usuários
def register(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        cpf = request.POST.get('cpf')
        sector = request.POST.get('sector')
        orgao = request.POST.get('orgao')
        phone = request.POST.get('phone')
        password = request.POST.get('password')
        password_confirmation = request.POST.get('password_confirmation')

        if password == password_confirmation:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            cpf_sem_mascara = re.sub(r'\D', '', cpf)
            telefone_sem_mascara = re.sub(r'[^0-9]', '', phone)

            user = UserProfile.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                cpf=cpf_sem_mascara,
                sector=sector,
                orgao=orgao,
                phone=telefone_sem_mascara,
                password=hashed_password.decode('utf-8'),
                is_admin=sector == "DGGP"
            )

            return redirect('accounts:login')
        else:
            messages.error(request, 'As senhas não coincidem. Tente novamente.')

    return render(request, 'register.html')


# Função para o login
def login(request):
    user = None

    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        # Filtra os usuários com base no email fornecido
        user = UserProfile.objects.filter(email=email).first()

        # Verifica se o usuário existe
        if user:
            # Garante que a senha não seja None ou vazia, e verifica se a senha está correta usando bcrypt
            if password and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                # Armazena o ID do usuário na sessão e redireciona para a página inicial
                request.session['user_id'] = user.id
                return redirect('accounts:home')
            else:
                # Exibe uma mensagem de erro se as credenciais são inválidas
                messages.error(request, 'Credenciais inválidas. Tente novamente.')
        else:
            # Exibe uma mensagem de erro se o usuário não for encontrado
            messages.error(request, 'Usuário não encontrado.')

        # Se o login falhar, renderiza a página de login com o email e senha preservados
        return render(request, 'login.html', {
            'email': email,
            'password': password  # Preserva a senha, mas não é recomendado em produção
        })

    return render(request, 'login.html')


# Função para exibir e atualizar o perfil do usuário
def profile(request):
    # Verificar se o usuário está autenticado
    user_id = request.session.get('user_id')

    if user_id:
        # Recuperar o objeto UserProfile com base no ID
        user = UserProfile.objects.get(id=user_id)

        if request.method == 'POST':
            # Se o formulário de atualização do perfil for submetido
            if 'first_name' in request.POST and 'last_name' in request.POST and 'email' in request.POST and 'cpf' in request.POST and 'orgao' in request.POST and 'sector' in request.POST and 'phone' in request.POST:
                user.first_name = request.POST['first_name']
                user.last_name = request.POST['last_name']
                user.email = request.POST['email']
                user.cpf = request.POST['cpf']
                user.orgao = request.POST['orgao']
                user.sector = request.POST['sector']
                user.phone = request.POST['phone']
                user.save()
                # Redirecionar para a página de perfil após a atualização
                return redirect('accounts:profile')

            # Se o formulário de troca de senha for submetido
            elif 'current_password' in request.POST and 'new_password' in request.POST and 'confirm_password' in request.POST:
                current_password = request.POST['current_password']
                new_password = request.POST['new_password']
                confirm_password = request.POST['confirm_password']

                # Verificar se a senha atual está correta
                if bcrypt.checkpw(current_password.encode('utf-8'), user.password.encode('utf-8')):
                    # Verificar se a nova senha e a confirmação de senha coincidem
                    if new_password == confirm_password:
                        # Hash da nova senha
                        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

                        # Atualizar a senha do usuário no banco de dados
                        user.password = hashed_password.decode('utf-8')
                        user.save()

                        # Redirecionar para a página de perfil após a troca de senha
                        return redirect('accounts:profile')
                    else:
                        # Senhas não coincidem, exibir mensagem de erro
                        return render(request, 'profile.html',
                                      {'user': user, 'error_message': 'As novas senhas não coincidem.'})
                else:
                    # Senha atual incorreta, exibir mensagem de erro
                    return render(request, 'profile.html', {'user': user, 'error_message': 'Senha atual incorreta.'})

        # Renderizar a página de perfil com as informações do usuário
        return render(request, 'profile.html', {'user': user})
    else:
        # Redirecionar para a página de login se o usuário não estiver autenticado
        return redirect('accounts:login')


# Função para exibir o painel de administração
def admin_panel(request):
    # Obtém o ID do usuário a partir da sessão
    user_id = request.session.get('user_id')
    if request.method == 'GET':
        # Verifica se o usuário atual tem acesso administrativo
        user_id = request.session.get('user_id')
        if user_id:
            # Recupera o objeto UserProfile com base no ID
            user = UserProfile.objects.get(id=user_id)
            is_admin = user.is_admin  # Obtém o valor de is_admin
            if user.is_admin:
                # Recupera todos os usuários que não são administradores
                users = UserProfile.objects.filter(is_admin=False)
                # Renderiza o painel de administração com a lista de usuários
                return render(request, 'admin_painel.html', {'user': user, 'is_admin': is_admin, 'users': users})
            else:
                # Redireciona para a página de perfil se o usuário não for um administrador
                return redirect('accounts:login')
        else:
            # Redireciona para a página de login se o usuário não estiver autenticado
            return redirect('accounts:login')


# Função para excluir um usuário (disponível apenas para administradores)
def delete_user(request, user_id):
    # Verifica se o usuário atual tem acesso administrativo
    admin_id = request.session.get('user_id')
    if admin_id:
        # Recupera o objeto UserProfile do administrador
        admin_user = UserProfile.objects.get(id=admin_id)
        if admin_user.is_admin:
            try:
                # Tenta recuperar o usuário a ser excluído
                user_to_delete = UserProfile.objects.get(id=user_id)
                # Verifica se o usuário a ser excluído não é o próprio administrador
                if user_to_delete != admin_user:
                    # Exclui o usuário do banco de dados
                    user_to_delete.delete()
                # Redireciona de volta para o painel de administração
                return redirect('accounts:admin_panel')
            except UserProfile.DoesNotExist:
                pass  # O usuário a ser excluído não existe
        # Redireciona de volta para o painel de administração
        return redirect('accounts:admin_panel')
    else:
        # Redireciona para a página de login se o usuário não estiver autenticado
        return redirect('accounts:login')


# Função para realizar o logout
def logout(request):
    # Remove o ID do usuário da sessão
    if 'user_id' in request.session:
        del request.session['user_id']
    # Redireciona para a página de login
    return redirect('accounts:login')




# Função para solicitar a redefinição de senha
def forgot_password(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        user = UserProfile.objects.filter(email=email).first()

        if user:
            # Gerar o token para redefinição de senha
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Criar o link de redefinição de senha
            reset_link = request.build_absolute_uri(
                f"/accounts/reset_senha/{uid}/{token}/"
            )

            # Enviar email com o link de redefinição
            mail_subject = 'Redefinição de senha'
            message = render_to_string('reset_password/reset_password_email.html', {
                'user': user,
                'reset_link': reset_link,
            })
            send_mail(mail_subject, message, 'gastopublicoto@gastopublicoto.com.br', [email])

            messages.success(request, 'Um email foi enviado para redefinição de senha.')
        else:
            messages.error(request, 'Este email não está registrado.')

        return redirect('accounts:login')

    return render(request, 'reset_password/forgot_password.html')


# Função para redefinir a senha
def reset_password(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = UserProfile.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, UserProfile.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            new_password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            if new_password == confirm_password:
                user.set_password(new_password)
                user.save()
                messages.success(request, 'Sua senha foi redefinida com sucesso. Você pode fazer login agora.')
                return redirect('accounts:login')
            else:
                messages.error(request, 'As senhas não coincidem.')
        return render(request, 'reset_password/reset_password.html')
    else:
        messages.error(request, 'O link de redefinição de senha é inválido ou expirou.')
        return redirect('accounts:forgot_password')

def check_permission(user):
    if not user.can_access_despesa_receita:
        return False
    return True

def permission_denied_view(request):
    return render(request, 'errors/403.html')  # Crie um template 403.html
