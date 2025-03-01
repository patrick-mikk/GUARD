from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """
    Admin interface for the Report model.
    """
    list_display = ('response_id', 'created_at', 'updated_at', 'is_submitted', 'current_step')
    list_filter = ('is_submitted', 'current_step', 'created_at')
    search_fields = ('response_id', 'name', 'school_name', 'incident_description')
    readonly_fields = ('response_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Metadata', {
            'fields': ('response_id', 'created_at', 'updated_at', 'is_submitted', 'current_step')
        }),
        ('Before You Begin', {
            'fields': ('reported_officially', 'research_consent')
        }),
        ('Personal & Contact Information', {
            'fields': ('name', 'anonymous', 'role', 'student_grade', 'staff_role', 
                      'child_grade', 'role_other', 'school_board', 'board_other', 'school_name')
        }),
        ('Incident Details', {
            'fields': ('incident_description', 'incident_types', 'incident_date')
        }),
        ('Reporting & Response', {
            'fields': ('reported', 'reporting_barriers', 'reported_to', 'report_reason')
        }),
        ('School Response', {
            'fields': ('school_response', 'response_satisfaction', 'response_satisfaction_reason')
        }),
        ('Impact & Support', {
            'fields': ('impact_description', 'support_received', 'support_types', 'additional_support_needed')
        }),
        ('Additional Information', {
            'fields': ('additional_info', 'contact_permission', 'contact_email', 'contact_phone')
        }),
    ) 