from django.db import models
from django.conf import settings

class VisitedLocation(models.Model):
    LEVEL_CHOICES = (
        (0, 'Country'),
        (1, 'State'),
        (2, 'District'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visited_locations')
    
    name = models.CharField(max_length=255)
    level = models.IntegerField(choices=LEVEL_CHOICES)
    
    # Hierarchy
    parent = models.CharField(max_length=255, null=True, blank=True)
    grandparent = models.CharField(max_length=255, null=True, blank=True)
    
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'name', 'level', 'parent']
        indexes = [
            models.Index(fields=['user', 'level']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"