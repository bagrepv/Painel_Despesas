from django.shortcuts import render, redirect
from accounts.models import UserProfile
from accounts.views import check_permission


# View para Receita 2024
def receita(request):
    user_id = request.session.get('user_id')

    if user_id:
        user = UserProfile.objects.get(id=user_id)
        is_admin = user.is_admin  # Obtenha o valor de is_admin
        if not user.can_access_receita_2024:  # Verificar permissão para Receita 2024
            return redirect('accounts:permission_denied')
        return render(request, 'receita.html', {'user': user, 'is_admin': is_admin})
    else:
        return redirect('accounts:login')


# View para Receita 2023
def receita2023(request):
    user_id = request.session.get('user_id')

    if user_id:
        user = UserProfile.objects.get(id=user_id)
        is_admin = user.is_admin  # Obtenha o valor de is_admin
        if not user.can_access_receita_2023:  # Verificar permissão para Receita 2023
            return redirect('accounts:permission_denied')
        return render(request, 'receita2023.html', {'user': user, 'is_admin': is_admin})
    else:
        return redirect('accounts:login')


# View para FPE / Fundeb
def fpefundeb(request):
    user_id = request.session.get('user_id')

    if user_id:
        user = UserProfile.objects.get(id=user_id)
        is_admin = user.is_admin  # Obtenha o valor de is_admin
        if not user.can_access_fpefundeb:  # Verificar permissão para FPE / Fundeb
            return redirect('accounts:permission_denied')
        return render(request, 'fpefundeb.html', {'user': user, 'is_admin': is_admin})
    else:
        return redirect('accounts:login')
