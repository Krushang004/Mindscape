from django.contrib import admin
from django.urls import path, include
from .views import google_auth, google_oauth_redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/google', google_auth),
    path('auth/google/callback', google_oauth_redirect),
    path('api/', include('tracker.urls')),
]
