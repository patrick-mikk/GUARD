from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from .models import Report
from .serializers import (
    ReportSerializer, ReportResumeSerializer, BeforeYouBeginSerializer,
    PersonalInfoSerializer, IncidentDetailsSerializer, ReportingResponseSerializer,
    SchoolResponseSerializer, ImpactSupportSerializer, AdditionalInfoSerializer,
    SubmitReportSerializer
)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Report model.
    Provides CRUD operations and custom actions for the multi-step form.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    lookup_field = 'response_id'
    
    def get_serializer_class(self):
        """
        Return the appropriate serializer based on the action.
        """
        if self.action == 'create':
            return ReportSerializer
        elif self.action == 'retrieve':
            return ReportSerializer
        elif self.action == 'resume':
            return ReportResumeSerializer
        elif self.action == 'before_you_begin':
            return BeforeYouBeginSerializer
        elif self.action == 'personal_info':
            return PersonalInfoSerializer
        elif self.action == 'incident_details':
            return IncidentDetailsSerializer
        elif self.action == 'reporting_response':
            return ReportingResponseSerializer
        elif self.action == 'school_response':
            return SchoolResponseSerializer
        elif self.action == 'impact_support':
            return ImpactSupportSerializer
        elif self.action == 'additional_info':
            return AdditionalInfoSerializer
        elif self.action == 'submit':
            return SubmitReportSerializer
        return self.serializer_class
    
    def create(self, request, *args, **kwargs):
        """
        Create a new report with a unique response_id.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        
        # Return the response_id for the client to use in subsequent requests
        return Response({
            'response_id': report.response_id,
            'message': 'Report created successfully'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def resume(self, request, response_id=None):
        """
        Resume a report by its response_id.
        """
        try:
            report = self.get_object()
            serializer = self.get_serializer(report)
            return Response(serializer.data)
        except Report.DoesNotExist:
            raise NotFound(detail="Report not found")
    
    @action(detail=True, methods=['patch'])
    def before_you_begin(self, request, response_id=None):
        """
        Update the "Before You Begin" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 1
        if report.current_step == 1:
            serializer.validated_data['current_step'] = 2
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def personal_info(self, request, response_id=None):
        """
        Update the "Personal & Contact Information" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 2
        if report.current_step == 2:
            serializer.validated_data['current_step'] = 3
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def incident_details(self, request, response_id=None):
        """
        Update the "Incident Details" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 3
        if report.current_step == 3:
            serializer.validated_data['current_step'] = 4
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def reporting_response(self, request, response_id=None):
        """
        Update the "Reporting & Response" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 4
        if report.current_step == 4:
            serializer.validated_data['current_step'] = 5
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def school_response(self, request, response_id=None):
        """
        Update the "School Response" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 5
        if report.current_step == 5:
            serializer.validated_data['current_step'] = 6
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def impact_support(self, request, response_id=None):
        """
        Update the "Impact & Support" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 6
        if report.current_step == 6:
            serializer.validated_data['current_step'] = 7
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def additional_info(self, request, response_id=None):
        """
        Update the "Additional Information" step of a report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update current_step if it's still at step 7
        if report.current_step == 7:
            serializer.validated_data['current_step'] = 8
        
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def submit(self, request, response_id=None):
        """
        Submit the final report.
        """
        report = self.get_object()
        serializer = self.get_serializer(report, data={'is_submitted': True}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Report submitted successfully',
            'response_id': report.response_id
        })


class ResumeReportView(generics.RetrieveAPIView):
    """
    View to resume a report by its response_id.
    """
    queryset = Report.objects.all()
    serializer_class = ReportResumeSerializer
    lookup_field = 'response_id' 