import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { additionalInfoSchema } from '../utils/validationSchemas';
import { getNextStepUrl, getPrevStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const AdditionalInfoPage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    systemic_changes: '',
    resources_needed: '',
    anything_else: '',
    report_value: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        
        // Check if user has completed the previous step
        if (!reportData.additional_support_needed) {
          navigate(getPrevStepUrl('additional-info', responseId));
          return;
        }
        
        setInitialValues({
          systemic_changes: reportData.systemic_changes || '',
          resources_needed: reportData.resources_needed || '',
          anything_else: reportData.anything_else || '',
          report_value: reportData.report_value || ''
        });
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please check your Response ID and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (responseId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [responseId, navigate]);

  // Handle auto-save with debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (values) => {
      try {
        setSaveStatus('saving');
        await reportApi.updateAdditionalInfo(responseId, values);
        setSaveStatus('success');
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    }, 1000),
    [responseId]
  );

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await reportApi.updateAdditionalInfo(responseId, values);
      navigate(getNextStepUrl('additional-info', responseId));
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save your data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-spinner fa-spin fa-3x"></i>
        <p className="mt-3">Loading report data...</p>
      </div>
    );
  }

  return (
    <div>
      <ResponseIdDisplay responseId={responseId} />
      <h1 className="section-title">Additional Information</h1>
      <ProgressBar currentStep="additional-info" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <p className="mb-4">
            This final section is an opportunity to share any additional thoughts or suggestions
            that could help improve school environments for 2SLGBTQIA+ students.
          </p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={additionalInfoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, isSubmitting, isValid, dirty }) => {
              // Trigger auto-save when values change
              useEffect(() => {
                if (dirty) {
                  debouncedSave(values);
                }
              }, [values, dirty]);

              return (
                <Form>
                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      What systemic changes do you think schools should make to better support 2SLGBTQIA+ students?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="systemic_changes"
                      className="form-control"
                      rows={4}
                      placeholder="Please share your thoughts on policy changes, training programs, curriculum adjustments, etc."
                    />
                    <ErrorMessage name="systemic_changes">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      What resources do you think would be most helpful for 2SLGBTQIA+ students in schools?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="resources_needed"
                      className="form-control"
                      rows={4}
                      placeholder="For example: GSA clubs, designated safe spaces, access to counselors with 2SLGBTQIA+ expertise, etc."
                    />
                    <ErrorMessage name="resources_needed">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      Is there anything else you would like to share about your experience?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="anything_else"
                      className="form-control"
                      rows={4}
                      placeholder="Please share any additional information or thoughts that you feel are important but haven't been covered in the previous sections."
                    />
                    <ErrorMessage name="anything_else">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      How valuable do you think this reporting platform is for addressing issues facing 2SLGBTQIA+ students?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="report_value"
                      className="form-control"
                      rows={4}
                      placeholder="Your feedback helps us improve this platform and better advocate for 2SLGBTQIA+ students."
                    />
                    <ErrorMessage name="report_value">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <div className="highlight-box mb-4">
                    <h3 className="h5 mb-3">You're Almost Done!</h3>
                    <p className="mb-0">
                      Thank you for taking the time to share your experiences. Your report will help us better
                      understand and address the challenges facing 2SLGBTQIA+ students in Ontario schools.
                      Click "Submit Report" to complete your submission.
                    </p>
                  </div>

                  <Row>
                    <Col>
                      <AutoSaveIndicator status={saveStatus} />
                    </Col>
                  </Row>

                  <FormNavigation
                    responseId={responseId}
                    currentStep="additional-info"
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    dirty={dirty}
                    nextButtonText="Submit Report"
                  />
                </Form>
              );
            }}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdditionalInfoPage; 