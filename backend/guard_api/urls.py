"""
URL configuration for the guard_api project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('reports.urls')),
    
    # Serve React app - this should be last
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
] 