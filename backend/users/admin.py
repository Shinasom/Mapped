 #============================================
# 6. backend/users/admin.py (UPDATE)
# ============================================
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Storage & Tier', {'fields': ('is_premium', 'storage_used_bytes', 'phone', 'email_verified')}),
    )
    list_display = ('username', 'email', 'phone', 'is_premium', 'email_verified', 'storage_used_bytes')
    list_filter = ('is_premium', 'email_verified', 'is_staff', 'is_active')

admin.site.register(User, CustomUserAdmin)

