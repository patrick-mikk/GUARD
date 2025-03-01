import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { schoolResponseSchema } from '../utils/validationSchemas';
import { getNextStepUrl, getPrevStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const SchoolResponsePage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    actions_taken: [],
    other_action: '',
    action_effectiveness: '',
    followup_provided: '',
    perpetrator_consequences: '',
    satisfied_with_response: '',
    satisfaction_rating: '',
    improvement_suggestions: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        
        // Check if user has completed the previous step
        if (!reportData.barriers_to_reporting && !reportData.reporting_experience) {
          navigate(getPrevStepUrl('school-response', responseId));
          return;
        }
        
        setInitialValues({
          actions_taken: reportData.actions_taken || [],
          other_action: reportData.other_action || '',
          action_effectiveness: reportData.action_effectiveness || '',
          followup_provided: reportData.followup_provided || '',
          perpetrator_consequences: reportData.perpetrator_consequences || '',
          satisfied_with_response: reportData.satisfied_with_response || '',
          satisfaction_rating: reportData.satisfaction_rating || '',
          improvement_suggestions: reportData.improvement_suggestions || ''
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
        await reportApi.updateSchoolResponse(responseId, values);
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
      await reportApi.updateSchoolResponse(responseId, values);
      navigate(getNextStepUrl('school-response', responseId));
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save your data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle actions taken selection
  const handleActionChange = (e, setFieldValue, values) => {
    const { value, checked } = e.target;
    const currentActions = [...values.actions_taken];
    
    if (checked) {
      if (!currentActions.includes(value)) {
        setFieldValue('actions_taken', [...currentActions, value]);
      }
    } else {
      setFieldValue('actions_taken', currentActions.filter(action => action !== value));
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
      <h1 className="section-title">School Response</h1>
      <ProgressBar currentStep="school-response" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <p className="mb-4">
            This section focuses on how the school responded to the incident and your satisfaction
            with their response. Your feedback helps us understand what approaches are effective.
          </p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={schoolResponseSchema}
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
                  {values.reported_officially === 'Yes' && (
                    <>
                      <BootstrapForm.Group className="mb-4">
                        <BootstrapForm.Label>
                          What actions did the school take in response to the incident? (select all that apply)
                        </BootstrapForm.Label>
                        <div className="checkbox-group">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="disciplinary_action"
                              name="actions_taken"
                              value="Disciplinary action against perpetrator"
                              className="form-check-input"
                              checked={values.actions_taken.includes('Disciplinary action against perpetrator')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="disciplinary_action">
                              Disciplinary action against perpetrator(s)
                            </label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="mediation"
                              name="actions_taken"
                              value="Mediation"
                              className="form-check-input"
                              checked={values.actions_taken.includes('Mediation')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="mediation">
                              Mediation between involved parties
                            </label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="counseling"
                              name="actions_taken"
                              value="Counseling or support services"
                              className="form-check-input"
                              checked={values.actions_taken.includes('Counseling or support services')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="counseling">
                              Counseling or support services offered
                            </label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="education"
                              name="actions_taken"
                              value="Educational intervention"
                              className="form-check-input"
                              checked={values.actions_taken.includes('Educational intervention')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="education">
                              Educational intervention (e.g., classroom discussions, assemblies)
                            </label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="policy_change"
                              name="actions_taken"
                              value="Policy changes"
                              className="form-check-input"
                              checked={values.actions_taken.includes('Policy changes')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="policy_change">
                              Policy changes or implementation
                            </label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="no_action"
                              name="actions_taken"
                              value="No action taken"
                              className="form-check-input"
                              checked={values.actions_taken.includes('No action taken')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="no_action">
                              No action taken
                            </label>
                          </div>
                          
                          <div className="form-check">
                            <input
                              type="checkbox"
                              id="other_action"
                              name="actions_taken"
                              value="Other"
                              className="form-check-input"
                              checked={values.actions_taken.includes('Other')}
                              onChange={(e) => handleActionChange(e, setFieldValue, values)}
                            />
                            <label className="form-check-label" htmlFor="other_action">
                              Other
                            </label>
                          </div>
                        </div>
                        <ErrorMessage name="actions_taken">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                        
                        {values.actions_taken.includes('Other') && (
                          <Field
                            type="text"
                            name="other_action"
                            className="form-control mt-2"
                            placeholder="Please specify what action was taken"
                          />
                        )}
                        <ErrorMessage name="other_action">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          How effective were these actions in addressing the incident?
                        </BootstrapForm.Label>
                        <Field
                          as="textarea"
                          name="action_effectiveness"
                          className="form-control"
                          rows={3}
                          placeholder="Please describe how effective you felt the school's response was in addressing the situation."
                        />
                        <ErrorMessage name="action_effectiveness">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          Was any follow-up provided to ensure the situation was resolved?
                        </BootstrapForm.Label>
                        <Field
                          as="textarea"
                          name="followup_provided"
                          className="form-control"
                          rows={3}
                          placeholder="Please describe any follow-up actions taken by the school to ensure the situation was resolved and to prevent recurrence."
                        />
                        <ErrorMessage name="followup_provided">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          Were there any consequences for the perpetrator(s)?
                        </BootstrapForm.Label>
                        <Field
                          as="textarea"
                          name="perpetrator_consequences"
                          className="form-control"
                          rows={3}
                          placeholder="If you know, please describe any consequences or disciplinary actions that were taken against the perpetrator(s)."
                        />
                        <ErrorMessage name="perpetrator_consequences">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          Were you satisfied with the school's response?
                        </BootstrapForm.Label>
                        <Field
                          as="select"
                          name="satisfied_with_response"
                          className="form-select"
                        >
                          <option value="">Select an option</option>
                          <option value="Yes">Yes</option>
                          <option value="Somewhat">Somewhat</option>
                          <option value="No">No</option>
                        </Field>
                        <ErrorMessage name="satisfied_with_response">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>

                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>
                          On a scale of 1-5, how would you rate the school's response?
                        </BootstrapForm.Label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <Field
                              type="radio"
                              name="satisfaction_rating"
                              id="rating1"
                              value="1"
                              className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor="rating1">
                              1 (Very Poor)
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <Field
                              type="radio"
                              name="satisfaction_rating"
                              id="rating2"
                              value="2"
                              className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor="rating2">
                              2 (Poor)
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <Field
                              type="radio"
                              name="satisfaction_rating"
                              id="rating3"
                              value="3"
                              className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor="rating3">
                              3 (Acceptable)
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <Field
                              type="radio"
                              name="satisfaction_rating"
                              id="rating4"
                              value="4"
                              className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor="rating4">
                              4 (Good)
                            </label>
                          </div>
                          <div className="form-check">
                            <Field
                              type="radio"
                              name="satisfaction_rating"
                              id="rating5"
                              value="5"
                              className="form-check-input"
                            />
                            <label className="form-check-label" htmlFor="rating5">
                              5 (Excellent)
                            </label>
                          </div>
                        </div>
                        <ErrorMessage name="satisfaction_rating">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </>
                  )}

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      What suggestions do you have for how schools could better address these types of incidents?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="improvement_suggestions"
                      className="form-control"
                      rows={4}
                      placeholder="Please share any suggestions for how schools could improve their responses to bullying, harassment, or discrimination against 2SLGBTQIA+ students."
                    />
                    <ErrorMessage name="improvement_suggestions">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <Row>
                    <Col>
                      <AutoSaveIndicator status={saveStatus} />
                    </Col>
                  </Row>

                  <FormNavigation
                    responseId={responseId}
                    currentStep="school-response"
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

export default SchoolResponsePage; 