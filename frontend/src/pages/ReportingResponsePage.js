import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { reportingResponseSchema } from '../utils/validationSchemas';
import { getNextStepUrl, getPrevStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const ReportingResponsePage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    barriers_to_reporting: [],
    other_barrier: '',
    reporting_experience: '',
    reporting_timeline: '',
    reporting_followup: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        
        // Check if user has completed the previous step
        if (!reportData.description) {
          navigate(getPrevStepUrl('reporting-response', responseId));
          return;
        }
        
        setInitialValues({
          barriers_to_reporting: reportData.barriers_to_reporting || [],
          other_barrier: reportData.other_barrier || '',
          reporting_experience: reportData.reporting_experience || '',
          reporting_timeline: reportData.reporting_timeline || '',
          reporting_followup: reportData.reporting_followup || ''
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
        await reportApi.updateReportingResponse(responseId, values);
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
      await reportApi.updateReportingResponse(responseId, values);
      navigate(getNextStepUrl('reporting-response', responseId));
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save your data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle barriers to reporting selection
  const handleBarrierChange = (e, setFieldValue, values) => {
    const { value, checked } = e.target;
    const currentBarriers = [...values.barriers_to_reporting];
    
    if (checked) {
      if (!currentBarriers.includes(value)) {
        setFieldValue('barriers_to_reporting', [...currentBarriers, value]);
      }
    } else {
      setFieldValue('barriers_to_reporting', currentBarriers.filter(barrier => barrier !== value));
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
      <h1 className="section-title">Reporting & Response</h1>
      <ProgressBar currentStep="reporting-response" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <p className="mb-4">
            This section is about your experience reporting the incident and the response you received.
            Your insights help us understand potential barriers to reporting and how school authorities respond.
          </p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={reportingResponseSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, isSubmitting, isValid, dirty, setFieldValue }) => {
              // Trigger auto-save when values change
              useEffect(() => {
                if (dirty) {
                  debouncedSave(values);
                }
              }, [values, dirty]);

              return (
                <Form>
                  {values.reported_officially !== 'Yes' && (
                    <BootstrapForm.Group className="mb-4">
                      <BootstrapForm.Label>
                        What barriers prevented you from reporting the incident officially? (select all that apply)
                      </BootstrapForm.Label>
                      <div className="checkbox-group">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="fear_retaliation"
                            name="barriers_to_reporting"
                            value="Fear of retaliation"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes('Fear of retaliation')}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="fear_retaliation">
                            Fear of retaliation or making the situation worse
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="not_serious"
                            name="barriers_to_reporting"
                            value="Didn't think it was serious enough"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes("Didn't think it was serious enough")}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="not_serious">
                            Didn't think it was serious enough to report
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="no_trust"
                            name="barriers_to_reporting"
                            value="No trust in the reporting system"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes('No trust in the reporting system')}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="no_trust">
                            No trust in the school's reporting system
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="not_know_how"
                            name="barriers_to_reporting"
                            value="Didn't know how to report"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes("Didn't know how to report")}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="not_know_how">
                            Didn't know how to report or who to report to
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="previous_negative"
                            name="barriers_to_reporting"
                            value="Previous negative experience"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes('Previous negative experience')}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="previous_negative">
                            Previous negative experience when reporting
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="fear_outing"
                            name="barriers_to_reporting"
                            value="Fear of being outed"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes('Fear of being outed')}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="fear_outing">
                            Fear of being outed or having to disclose identity
                          </label>
                        </div>
                        
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id="other_barrier"
                            name="barriers_to_reporting"
                            value="Other"
                            className="form-check-input"
                            checked={values.barriers_to_reporting.includes('Other')}
                            onChange={(e) => handleBarrierChange(e, setFieldValue, values)}
                          />
                          <label className="form-check-label" htmlFor="other_barrier">
                            Other
                          </label>
                        </div>
                      </div>
                      <ErrorMessage name="barriers_to_reporting">
                        {msg => <div className="error-message">{msg}</div>}
                      </ErrorMessage>
                      
                      {values.barriers_to_reporting.includes('Other') && (
                        <Field
                          type="text"
                          name="other_barrier"
                          className="form-control mt-2"
                          placeholder="Please specify the barrier to reporting"
                        />
                      )}
                      <ErrorMessage name="other_barrier">
                        {msg => <div className="error-message">{msg}</div>}
                      </ErrorMessage>
                    </BootstrapForm.Group>
                  )}

                  {values.reported_officially === 'Yes' && (
                    <>
                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          How would you describe your experience reporting the incident?
                        </BootstrapForm.Label>
                        <Field
                          as="textarea"
                          name="reporting_experience"
                          className="form-control"
                          rows={4}
                          placeholder="Please describe how you were treated during the reporting process, any challenges you faced, and whether you felt your concerns were taken seriously."
                        />
                        <ErrorMessage name="reporting_experience">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          How long did it take for the school to respond after you reported?
                        </BootstrapForm.Label>
                        <Field
                          as="select"
                          name="reporting_timeline"
                          className="form-select"
                        >
                          <option value="">Select response time</option>
                          <option value="Same day">Same day</option>
                          <option value="Within 1-2 days">Within 1-2 days</option>
                          <option value="Within a week">Within a week</option>
                          <option value="Within a month">Within a month</option>
                          <option value="More than a month">More than a month</option>
                          <option value="Never received a response">Never received a response</option>
                        </Field>
                        <ErrorMessage name="reporting_timeline">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          Was there any follow-up after your initial report?
                        </BootstrapForm.Label>
                        <Field
                          as="textarea"
                          name="reporting_followup"
                          className="form-control"
                          rows={4}
                          placeholder="Please describe any follow-up actions taken by the school, meetings you attended, or communication you received after your report."
                        />
                        <ErrorMessage name="reporting_followup">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </>
                  )}

                  <Row>
                    <Col>
                      <AutoSaveIndicator status={saveStatus} />
                    </Col>
                  </Row>

                  <FormNavigation
                    responseId={responseId}
                    currentStep="reporting-response"
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    dirty={dirty}
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

export default ReportingResponsePage; 