from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# We extend the default UserAdmin to show our custom fields
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Storage & Tier', {'fields': ('is_premium', 'storage_used_bytes')}),
    )
    list_display = ('username', 'email', 'is_premium', 'storage_used_bytes')

admin.site.register(User, CustomUserAdmin)