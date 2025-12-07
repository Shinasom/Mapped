from django.urls import path
from .views import MarkLocationView, UserMapDataView # <--- Make sure this is MarkLocationView

urlpatterns = [
    # We use the new view here
    path('mark/', MarkLocationView.as_view(), name='mark-location'), 
    path('my-map/', UserMapDataView.as_view(), name='user-map'),
]