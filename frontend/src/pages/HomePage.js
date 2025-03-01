import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import reportApi from '../services/api';

const HomePage = () => {
  const [responseId, setResponseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Start a new report
  const handleStartNewReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await reportApi.createReport();
      navigate(`/report/${response.response_id}/before-you-begin`);
    } catch (err) {
      setError('Failed to create a new report. Please try again.');
      console.error('Error creating report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resume an existing report
  const handleResumeReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!responseId || responseId.trim() === '') {
      setError('Please enter a valid Response ID');
      setLoading(false);
      return;
    }
    
    try {
      const response = await reportApi.resumeReport(responseId);
      
      // Check if the report is already submitted
      if (response.is_submitted) {
        navigate(`/report/${responseId}/confirmation`);
      } else {
        // Determine which step to navigate to based on the current_step
        const steps = [
          'before-you-begin',
          'personal-info',
          'incident-details',
          'reporting-response',
          'school-response',
          'impact-support',
          'additional-info',
          'confirmation'
        ];
        
        const currentStep = response.current_step > 0 && response.current_step <= steps.length
          ? steps[response.current_step - 1]
          : 'before-you-begin';
        
        navigate(`/report/${responseId}/${currentStep}`);
      }
    } catch (err) {
      setError('Unable to find a report with that Response ID. Please check and try again.');
      console.error('Error resuming report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5">
      <div className="welcome-container mb-5">
        <div className="shield-logo">🛡️</div>
        <h1 className="app-title">GUARD Reporting Platform</h1>
        <p className="lead">
          Gather, Understand, Address, Report, Defend
        </p>
        <p className="mb-4">
          A safe space to report incidents related to bullying, discrimination, 
          harassment, or any other concerning behaviors experienced by 2SLGBTQIA+ 
          individuals within Ontario's publicly funded Catholic and public school boards.
        </p>
      </div>

      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4">
              <h2 className="h4 mb-3">Start a New Report</h2>
              <p>Begin a new incident report. You will be guided through a step-by-step process.</p>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100" 
                onClick={handleStartNewReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i> Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-2"></i> Start New Report
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h4 mb-3">Resume Existing Report</h2>
              <p>Continue a report you've already started using your Response ID.</p>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleResumeReport}>
                <Form.Group className="mb-3">
                  <Form.Label>Response ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your Response ID"
                    value={responseId}
                    onChange={(e) => setResponseId(e.target.value)}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    This is the ID you received when you started your report.
                  </Form.Text>
                </Form.Group>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-100" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i> Resuming...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-history me-2"></i> Resume Report
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage; 