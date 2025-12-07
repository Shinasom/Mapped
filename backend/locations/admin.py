from django.contrib import admin
from .models import VisitedLocation

@admin.register(VisitedLocation)
class VisitedLocationAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'level', 'parent', 'marked_at')
    list_filter = ('level', 'user')
    search_fields = ('name', 'user__username')