from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Include pollution app URLs
    path('pollution/', include('pollution_data.urls')),
]
