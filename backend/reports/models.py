from django.db import models
import shortuuid
import datetime


def generate_response_id():
    """Generate a short unique ID for the report"""
    return shortuuid.ShortUUID().random(length=8)


class Report(models.Model):
    """
    Model to store report data from the GUARD reporting platform.
    """
    # Unique identifier for resuming reports
    response_id = models.CharField(max_length=8, default=generate_response_id, unique=True, editable=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_submitted = models.BooleanField(default=False)
    current_step = models.IntegerField(default=1)
    
    # Before You Begin section
    reported_officially = models.CharField(max_length=100, blank=True, null=True)
    research_consent = models.BooleanField(default=False)
    
    # Personal & Contact Information
    name = models.CharField(max_length=255, blank=True, null=True)
    anonymous = models.BooleanField(default=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    
    # Additional fields based on role
    student_grade = models.CharField(max_length=50, blank=True, null=True)
    staff_role = models.CharField(max_length=50, blank=True, null=True)
    child_grade = models.CharField(max_length=50, blank=True, null=True)
    role_other = models.CharField(max_length=255, blank=True, null=True)
    
    # School information
    school_board = models.CharField(max_length=255, blank=True, null=True)
    board_other = models.CharField(max_length=255, blank=True, null=True)
    school_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Incident Details
    incident_description = models.TextField(blank=True, null=True)
    incident_date = models.DateField(blank=True, null=True)
    
    # Incident types (stored as JSON)
    incident_types = models.JSONField(blank=True, null=True)
    
    # Reporting & Response
    reported = models.CharField(max_length=10, blank=True, null=True)
    reporting_barriers = models.JSONField(blank=True, null=True)
    reported_to = models.JSONField(blank=True, null=True)
    report_reason = models.TextField(blank=True, null=True)
    
    # School Response
    school_response = models.TextField(blank=True, null=True)
    response_satisfaction = models.CharField(max_length=50, blank=True, null=True)
    response_satisfaction_reason = models.TextField(blank=True, null=True)
    
    # Impact & Support
    impact_description = models.TextField(blank=True, null=True)
    support_received = models.CharField(max_length=10, blank=True, null=True)
    support_types = models.JSONField(blank=True, null=True)
    additional_support_needed = models.TextField(blank=True, null=True)
    
    # Additional Information
    additional_info = models.TextField(blank=True, null=True)
    
    # Contact Preferences
    contact_permission = models.BooleanField(default=False)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"Report {self.response_id}"
    
    class Meta:
        ordering = ['-created_at'] 