from django.contrib import admin
from django.urls import path, include
from .views import google_auth

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/google', google_auth),
    path('api/', include('tracker.urls')),
]
