from django.urls import path
from .views import PollutionDataView, save_status

urlpatterns = [
    path('data/', PollutionDataView.as_view(), name='pollution_data'),
    path("api/save-status/", save_status, name="save_status"),


]
