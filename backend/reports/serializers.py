from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """
    Serializer for the Report model - handles all fields.
    """
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['response_id', 'created_at', 'updated_at']


class ReportResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for resuming a report - only returns minimal info.
    """
    class Meta:
        model = Report
        fields = ['response_id', 'current_step', 'is_submitted', 'created_at', 'updated_at']
        read_only_fields = ['response_id', 'created_at', 'updated_at']


class ReportStepSerializer(serializers.ModelSerializer):
    """
    Base serializer for individual report steps.
    Subclasses will define specific fields for each step.
    """
    class Meta:
        model = Report
        fields = ['response_id', 'current_step']
        read_only_fields = ['response_id']


class BeforeYouBeginSerializer(ReportStepSerializer):
    """
    Serializer for the "Before You Begin" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + ['reported_officially', 'research_consent']


class PersonalInfoSerializer(ReportStepSerializer):
    """
    Serializer for the "Personal & Contact Information" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + [
            'name', 'anonymous', 'role', 'student_grade', 'staff_role',
            'child_grade', 'role_other', 'school_board', 'board_other', 'school_name'
        ]


class IncidentDetailsSerializer(ReportStepSerializer):
    """
    Serializer for the "Incident Details" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + [
            'incident_description', 'incident_types', 'incident_date'
        ]


class ReportingResponseSerializer(ReportStepSerializer):
    """
    Serializer for the "Reporting & Response" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + [
            'reported', 'reporting_barriers', 'reported_to', 'report_reason'
        ]


class SchoolResponseSerializer(ReportStepSerializer):
    """
    Serializer for the "School Response" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + [
            'school_response', 'response_satisfaction', 'response_satisfaction_reason'
        ]


class ImpactSupportSerializer(ReportStepSerializer):
    """
    Serializer for the "Impact & Support" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + [
            'impact_description', 'support_received', 'support_types', 'additional_support_needed'
        ]


class AdditionalInfoSerializer(ReportStepSerializer):
    """
    Serializer for the "Additional Information" step.
    """
    class Meta(ReportStepSerializer.Meta):
        fields = ReportStepSerializer.Meta.fields + [
            'additional_info', 'contact_permission', 'contact_email', 'contact_phone'
        ]


class SubmitReportSerializer(serializers.ModelSerializer):
    """
    Serializer for submitting the final report.
    """
    class Meta:
        model = Report
        fields = ['response_id', 'is_submitted']
        read_only_fields = ['response_id'] 