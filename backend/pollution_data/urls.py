from django.urls import path
from .views import PollutionDataView

urlpatterns = [
    path('data/', PollutionDataView.as_view(), name='pollution_data'),
]
