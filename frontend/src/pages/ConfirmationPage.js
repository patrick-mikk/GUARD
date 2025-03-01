import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Alert } from 'react-bootstrap';
import { formatDateForDisplay } from '../utils/formUtils';
import reportApi from '../services/api';
import ResponseIdDisplay from '../components/ResponseIdDisplay';

const ConfirmationPage = () => {
  const { responseId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await reportApi.getReport(responseId);
        
        // Check if the report is submitted
        if (!data.is_submitted) {
          // Mark as submitted since the user has reached the confirmation page
          await reportApi.submitReport(responseId);
          data.is_submitted = true;
        }
        
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please check your Response ID and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (responseId) {
      fetchReportData();
    }
  }, [responseId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x"></i>
        <p className="mt-3">Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-3">
          <Link to="/">
            <Button variant="primary">Return to Home</Button>
          </Link>
        </div>
      </Alert>
    );
  }

  return (
    <div>
      <ResponseIdDisplay responseId={responseId} />
      
      <Card className="shadow-sm mb-4 text-center">
        <Card.Body className="p-5">
          <div className="mb-4 text-success">
            <i className="fas fa-check-circle fa-5x"></i>
          </div>
          
          <h1 className="section-title">Thank You for Your Report</h1>
          
          <p className="lead mb-4">
            Your report has been successfully submitted.
          </p>
          
          <div className="mb-4">
            <strong>Date Submitted:</strong> {formatDateForDisplay(reportData?.updated_at)}
          </div>
          
          <div className="highlight-box mb-4">
            <p className="mb-0">
              <strong>Important:</strong> Please keep your Response ID safe in case you need to 
              reference this report in the future.
            </p>
          </div>
          
          <div className="mb-4">
            <h5>What Happens Next?</h5>
            <p>
              Your report contributes to valuable research on 2SLGBTQIA+ experiences in Ontario 
              school systems. This information helps inform advocacy efforts and improvements to 
              make schools more inclusive and safe.
            </p>
            
            {reportData?.contact_permission && (
              <p>
                Since you've provided permission to be contacted, a representative may reach out 
                to you for follow-up using the contact information you provided.
              </p>
            )}
          </div>
          
          <Link to="/">
            <Button variant="primary" size="lg">
              Return to Home
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ConfirmationPage; 