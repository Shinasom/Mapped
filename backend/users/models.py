from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Tier flags
    is_premium = models.BooleanField(default=False)
    
    # Storage Tracking (Bytes)
    storage_used_bytes = models.BigIntegerField(default=0)
    
    # Limits (in bytes)
    LIMIT_FREE = 200 * 1024 * 1024          # 200 MB
    LIMIT_PREMIUM = 5 * 1024 * 1024 * 1024  # 5 GB
    
    def __str__(self):
        return self.username

    @property
    def storage_limit(self):
        if self.is_superuser: return float('inf')
        if self.is_premium: return self.LIMIT_PREMIUM
        return self.LIMIT_FREE