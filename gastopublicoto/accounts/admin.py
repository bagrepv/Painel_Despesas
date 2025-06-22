from django.contrib import admin
from .models import UserProfile, UserLoginHistory

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_admin', 'can_access_despesa_receita')  # Campos válidos do modelo
    list_filter = ('is_admin', 'can_access_despesa_receita')  # Filtros válidos com base nos campos do modelo

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserLoginHistory)
