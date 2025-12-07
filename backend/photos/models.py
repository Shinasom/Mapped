from django.db import models
from django.conf import settings

class DistrictPhoto(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='photos')
    
    # Location
    district_name = models.CharField(max_length=255)
    state_name = models.CharField(max_length=255)
    country_name = models.CharField(max_length=255)
    
    # Cloudinary Data
    photo_url = models.URLField()
    cloudinary_public_id = models.CharField(max_length=255)
    
    # Metadata for Storage Caps
    file_size_bytes = models.IntegerField()
    caption = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo by {self.user.username} in {self.district_name}"