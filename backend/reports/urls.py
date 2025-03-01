from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ReportViewSet, ResumeReportView

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'reports', ReportViewSet)

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('resume/<str:response_id>/', ResumeReportView.as_view(), name='resume-report'),
] 