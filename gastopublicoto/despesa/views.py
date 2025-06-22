from django.shortcuts import render, redirect
from accounts.models import UserProfile
from accounts.views import check_permission


# View para Despesa 2024
def despesa(request):
    user_id = request.session.get('user_id')

    if user_id:
        user = UserProfile.objects.get(id=user_id)
        is_admin = user.is_admin  # Obtenha o valor de is_admin
        if not user.can_access_despesa_2024:  # Verificar permissão para Despesa 2024
            return redirect('accounts:permission_denied')
        return render(request, 'despesa.html', {'user': user, 'is_admin': is_admin})
    else:
        return redirect('accounts:login')


# View para Despesa 2023
def despesa2023(request):
    user_id = request.session.get('user_id')

    if user_id:
        user = UserProfile.objects.get(id=user_id)
        is_admin = user.is_admin  # Obtenha o valor de is_admin
        if not user.can_access_despesa_2023:  # Verificar permissão para Despesa 2023
            return redirect('accounts:permission_denied')
        return render(request, 'despesa2023.html', {'user': user, 'is_admin': is_admin})
    else:
        return redirect('accounts:login')
