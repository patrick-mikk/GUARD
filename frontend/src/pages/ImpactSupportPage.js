import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { impactSupportSchema } from '../utils/validationSchemas';
import { getNextStepUrl, getPrevStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const ImpactSupportPage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    emotional_impact: [],
    other_emotional_impact: '',
    academic_impact: [],
    other_academic_impact: '',
    physical_impact: '',
    long_term_impact: '',
    support_received: [],
    other_support: '',
    additional_support_needed: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        
        // Check if user has completed the previous step
        if (!reportData.improvement_suggestions) {
          navigate(getPrevStepUrl('impact-support', responseId));
          return;
        }
        
        setInitialValues({
          emotional_impact: reportData.emotional_impact || [],
          other_emotional_impact: reportData.other_emotional_impact || '',
          academic_impact: reportData.academic_impact || [],
          other_academic_impact: reportData.other_academic_impact || '',
          physical_impact: reportData.physical_impact || '',
          long_term_impact: reportData.long_term_impact || '',
          support_received: reportData.support_received || [],
          other_support: reportData.other_support || '',
          additional_support_needed: reportData.additional_support_needed || ''
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
        await reportApi.updateImpactSupport(responseId, values);
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
      await reportApi.updateImpactSupport(responseId, values);
      navigate(getNextStepUrl('impact-support', responseId));
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save your data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle checkbox selection for arrays
  const handleArraySelection = (e, fieldName, setFieldValue, values) => {
    const { value, checked } = e.target;
    const currentValues = [...values[fieldName]];
    
    if (checked) {
      if (!currentValues.includes(value)) {
        setFieldValue(fieldName, [...currentValues, value]);
      }
    } else {
      setFieldValue(fieldName, currentValues.filter(item => item !== value));
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
      <h1 className="section-title">Impact & Support</h1>
      <ProgressBar currentStep="impact-support" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <p className="mb-4">
            This section helps us understand how the incident has affected you and what support
            you've received or still need. This information helps us advocate for better resources.
          </p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={impactSupportSchema}
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
                  <BootstrapForm.Group className="mb-4">
                    <BootstrapForm.Label>
                      What emotional impact did the incident have on you? (select all that apply)
                    </BootstrapForm.Label>
                    <div className="checkbox-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="anxiety"
                          name="emotional_impact"
                          value="Anxiety"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Anxiety')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="anxiety">
                          Anxiety
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="depression"
                          name="emotional_impact"
                          value="Depression"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Depression')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="depression">
                          Depression
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="fear"
                          name="emotional_impact"
                          value="Fear"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Fear')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="fear">
                          Fear
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="isolation"
                          name="emotional_impact"
                          value="Isolation"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Isolation')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="isolation">
                          Isolation/Loneliness
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="anger"
                          name="emotional_impact"
                          value="Anger"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Anger')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="anger">
                          Anger
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="shame"
                          name="emotional_impact"
                          value="Shame"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Shame')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="shame">
                          Shame
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="loss_confidence"
                          name="emotional_impact"
                          value="Loss of confidence"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Loss of confidence')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="loss_confidence">
                          Loss of confidence
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="no_emotional_impact"
                          name="emotional_impact"
                          value="No significant emotional impact"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('No significant emotional impact')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="no_emotional_impact">
                          No significant emotional impact
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="other_emotional"
                          name="emotional_impact"
                          value="Other"
                          className="form-check-input"
                          checked={values.emotional_impact.includes('Other')}
                          onChange={(e) => handleArraySelection(e, 'emotional_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="other_emotional">
                          Other
                        </label>
                      </div>
                    </div>
                    <ErrorMessage name="emotional_impact">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                    
                    {values.emotional_impact.includes('Other') && (
                      <Field
                        type="text"
                        name="other_emotional_impact"
                        className="form-control mt-2"
                        placeholder="Please specify other emotional impacts"
                      />
                    )}
                    <ErrorMessage name="other_emotional_impact">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-4">
                    <BootstrapForm.Label>
                      What impact did the incident have on your academics? (select all that apply)
                    </BootstrapForm.Label>
                    <div className="checkbox-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="attendance"
                          name="academic_impact"
                          value="Decreased attendance"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Decreased attendance')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="attendance">
                          Decreased attendance
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="grades"
                          name="academic_impact"
                          value="Lower grades"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Lower grades')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="grades">
                          Lower grades
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="concentration"
                          name="academic_impact"
                          value="Difficulty concentrating"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Difficulty concentrating')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="concentration">
                          Difficulty concentrating
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="participation"
                          name="academic_impact"
                          value="Reduced participation"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Reduced participation')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="participation">
                          Reduced participation in class
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="school_change"
                          name="academic_impact"
                          value="Changed schools"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Changed schools')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="school_change">
                          Changed schools
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="dropped_out"
                          name="academic_impact"
                          value="Dropped out"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Dropped out')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="dropped_out">
                          Dropped out
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="no_academic_impact"
                          name="academic_impact"
                          value="No significant academic impact"
                          className="form-check-input"
                          checked={values.academic_impact.includes('No significant academic impact')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="no_academic_impact">
                          No significant academic impact
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="other_academic"
                          name="academic_impact"
                          value="Other"
                          className="form-check-input"
                          checked={values.academic_impact.includes('Other')}
                          onChange={(e) => handleArraySelection(e, 'academic_impact', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="other_academic">
                          Other
                        </label>
                      </div>
                    </div>
                    <ErrorMessage name="academic_impact">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                    
                    {values.academic_impact.includes('Other') && (
                      <Field
                        type="text"
                        name="other_academic_impact"
                        className="form-control mt-2"
                        placeholder="Please specify other academic impacts"
                      />
                    )}
                    <ErrorMessage name="other_academic_impact">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      Did the incident have any physical impact on you?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="physical_impact"
                      className="form-control"
                      rows={3}
                      placeholder="Please describe any physical impacts such as injuries, sleep issues, appetite changes, etc."
                    />
                    <ErrorMessage name="physical_impact">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      Has this incident had any long-term impact on you?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="long_term_impact"
                      className="form-control"
                      rows={3}
                      placeholder="Please describe any long-term impacts on your education, mental health, relationships, etc."
                    />
                    <ErrorMessage name="long_term_impact">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-4">
                    <BootstrapForm.Label>
                      What support have you received to help you cope? (select all that apply)
                    </BootstrapForm.Label>
                    <div className="checkbox-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="school_counseling"
                          name="support_received"
                          value="School counseling"
                          className="form-check-input"
                          checked={values.support_received.includes('School counseling')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="school_counseling">
                          School counseling services
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="external_therapy"
                          name="support_received"
                          value="External therapy/counseling"
                          className="form-check-input"
                          checked={values.support_received.includes('External therapy/counseling')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="external_therapy">
                          External therapy/counseling
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="peer_support"
                          name="support_received"
                          value="Peer support"
                          className="form-check-input"
                          checked={values.support_received.includes('Peer support')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="peer_support">
                          Peer support
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="family_support"
                          name="support_received"
                          value="Family support"
                          className="form-check-input"
                          checked={values.support_received.includes('Family support')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="family_support">
                          Family support
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="lgbtq_org"
                          name="support_received"
                          value="2SLGBTQIA+ organization support"
                          className="form-check-input"
                          checked={values.support_received.includes('2SLGBTQIA+ organization support')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="lgbtq_org">
                          2SLGBTQIA+ organization support
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="teacher_support"
                          name="support_received"
                          value="Teacher support"
                          className="form-check-input"
                          checked={values.support_received.includes('Teacher support')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="teacher_support">
                          Teacher support
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="online_resources"
                          name="support_received"
                          value="Online resources"
                          className="form-check-input"
                          checked={values.support_received.includes('Online resources')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="online_resources">
                          Online resources or communities
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="no_support"
                          name="support_received"
                          value="No support received"
                          className="form-check-input"
                          checked={values.support_received.includes('No support received')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="no_support">
                          No support received
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="other_support"
                          name="support_received"
                          value="Other"
                          className="form-check-input"
                          checked={values.support_received.includes('Other')}
                          onChange={(e) => handleArraySelection(e, 'support_received', setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="other_support">
                          Other
                        </label>
                      </div>
                    </div>
                    <ErrorMessage name="support_received">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                    
                    {values.support_received.includes('Other') && (
                      <Field
                        type="text"
                        name="other_support"
                        className="form-control mt-2"
                        placeholder="Please specify other support received"
                      />
                    )}
                    <ErrorMessage name="other_support">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>
                      What additional support would have been helpful?
                    </BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="additional_support_needed"
                      className="form-control"
                      rows={3}
                      placeholder="Please describe any additional support you wish had been available to you."
                    />
                    <ErrorMessage name="additional_support_needed">
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
                    currentStep="impact-support"
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

export default ImpactSupportPage; 