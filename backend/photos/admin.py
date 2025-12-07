from django.contrib import admin
from .models import DistrictPhoto

@admin.register(DistrictPhoto)
class DistrictPhotoAdmin(admin.ModelAdmin):
    list_display = ('district_name', 'user', 'file_size_bytes', 'uploaded_at')
    list_filter = ('country_name', 'user')