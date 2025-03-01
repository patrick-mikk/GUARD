import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { incidentDetailsSchema } from '../utils/validationSchemas';
import { getNextStepUrl, getPrevStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const IncidentDetailsPage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    incident_date: '',
    location_type: '',
    school_name: '',
    incident_type: [],
    other_incident_type: '',
    description: '',
    witnesses: '',
    reported_incident_date: '',
    reported_to: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        
        // Check if user has completed the previous step
        if (!reportData.age_group) {
          navigate(getPrevStepUrl('incident-details', responseId));
          return;
        }
        
        setInitialValues({
          incident_date: reportData.incident_date || '',
          location_type: reportData.location_type || '',
          school_name: reportData.school_name || '',
          incident_type: reportData.incident_type || [],
          other_incident_type: reportData.other_incident_type || '',
          description: reportData.description || '',
          witnesses: reportData.witnesses || '',
          reported_incident_date: reportData.reported_incident_date || '',
          reported_to: reportData.reported_to || []
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
        await reportApi.updateIncidentDetails(responseId, values);
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
      await reportApi.updateIncidentDetails(responseId, values);
      navigate(getNextStepUrl('incident-details', responseId));
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save your data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle incident type selection
  const handleIncidentTypeChange = (e, setFieldValue, values) => {
    const { value, checked } = e.target;
    const currentTypes = [...values.incident_type];
    
    if (checked) {
      if (!currentTypes.includes(value)) {
        setFieldValue('incident_type', [...currentTypes, value]);
      }
    } else {
      setFieldValue('incident_type', currentTypes.filter(type => type !== value));
    }
  };

  // Handle reported to selection
  const handleReportedToChange = (e, setFieldValue, values) => {
    const { value, checked } = e.target;
    const currentReportedTo = [...values.reported_to];
    
    if (checked) {
      if (!currentReportedTo.includes(value)) {
        setFieldValue('reported_to', [...currentReportedTo, value]);
      }
    } else {
      setFieldValue('reported_to', currentReportedTo.filter(person => person !== value));
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
      <h1 className="section-title">Incident Details</h1>
      <ProgressBar currentStep="incident-details" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <p className="mb-4">
            Please provide details about the incident you're reporting. The more information you can share,
            the better we can understand what happened.
          </p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={incidentDetailsSchema}
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
                  <Row>
                    <Col md={6}>
                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>When did the incident occur?</BootstrapForm.Label>
                        <Field
                          type="date"
                          name="incident_date"
                          className="form-control"
                        />
                        <ErrorMessage name="incident_date">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </Col>
                    
                    <Col md={6}>
                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>Location Type</BootstrapForm.Label>
                        <Field
                          as="select"
                          name="location_type"
                          className="form-select"
                        >
                          <option value="">Select location type</option>
                          <option value="Classroom">Classroom</option>
                          <option value="Hallway">Hallway</option>
                          <option value="Cafeteria">Cafeteria</option>
                          <option value="Washroom">Washroom</option>
                          <option value="Gym">Gym</option>
                          <option value="School Grounds">School Grounds</option>
                          <option value="School Bus">School Bus</option>
                          <option value="Online/Social Media">Online/Social Media</option>
                          <option value="Other">Other</option>
                        </Field>
                        <ErrorMessage name="location_type">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </Col>
                  </Row>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>School Name</BootstrapForm.Label>
                    <Field
                      type="text"
                      name="school_name"
                      className="form-control"
                      placeholder="Name of the school where the incident occurred"
                    />
                    <ErrorMessage name="school_name">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-4">
                    <BootstrapForm.Label>Type of Incident (select all that apply)</BootstrapForm.Label>
                    <div className="checkbox-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="verbal_harassment"
                          name="incident_type"
                          value="Verbal Harassment"
                          className="form-check-input"
                          checked={values.incident_type.includes('Verbal Harassment')}
                          onChange={(e) => handleIncidentTypeChange(e, setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="verbal_harassment">
                          Verbal Harassment (slurs, insults, threats)
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="physical_bullying"
                          name="incident_type"
                          value="Physical Bullying"
                          className="form-check-input"
                          checked={values.incident_type.includes('Physical Bullying')}
                          onChange={(e) => handleIncidentTypeChange(e, setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="physical_bullying">
                          Physical Bullying (pushing, hitting, damaging property)
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="social_exclusion"
                          name="incident_type"
                          value="Social Exclusion"
                          className="form-check-input"
                          checked={values.incident_type.includes('Social Exclusion')}
                          onChange={(e) => handleIncidentTypeChange(e, setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="social_exclusion">
                          Social Exclusion (deliberately excluding someone)
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="cyberbullying"
                          name="incident_type"
                          value="Cyberbullying"
                          className="form-check-input"
                          checked={values.incident_type.includes('Cyberbullying')}
                          onChange={(e) => handleIncidentTypeChange(e, setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="cyberbullying">
                          Cyberbullying (online harassment, spreading rumors)
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="discrimination"
                          name="incident_type"
                          value="Discrimination"
                          className="form-check-input"
                          checked={values.incident_type.includes('Discrimination')}
                          onChange={(e) => handleIncidentTypeChange(e, setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="discrimination">
                          Discrimination (unequal treatment based on identity)
                        </label>
                      </div>
                      
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="other"
                          name="incident_type"
                          value="Other"
                          className="form-check-input"
                          checked={values.incident_type.includes('Other')}
                          onChange={(e) => handleIncidentTypeChange(e, setFieldValue, values)}
                        />
                        <label className="form-check-label" htmlFor="other">
                          Other
                        </label>
                      </div>
                    </div>
                    <ErrorMessage name="incident_type">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                    
                    {values.incident_type.includes('Other') && (
                      <Field
                        type="text"
                        name="other_incident_type"
                        className="form-control mt-2"
                        placeholder="Please specify the type of incident"
                      />
                    )}
                    <ErrorMessage name="other_incident_type">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Description of the Incident</BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="description"
                      className="form-control"
                      rows={5}
                      placeholder="Please describe what happened in as much detail as you feel comfortable sharing."
                    />
                    <BootstrapForm.Text className="text-muted">
                      Include what happened, who was involved, and any other relevant details.
                    </BootstrapForm.Text>
                    <ErrorMessage name="description">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Were there any witnesses?</BootstrapForm.Label>
                    <Field
                      as="textarea"
                      name="witnesses"
                      className="form-control"
                      rows={3}
                      placeholder="Please describe who witnessed the incident (e.g., students, teachers, staff)."
                    />
                    <ErrorMessage name="witnesses">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  {values.reported_officially === 'Yes' && (
                    <>
                      <div className="highlight-box mb-4">
                        <h2 className="h5 mb-3">Official Reporting Details</h2>
                        <p className="mb-3">
                          You indicated that you reported this incident through official channels. 
                          Please provide more details about that report.
                        </p>
                        
                        <BootstrapForm.Group className="mb-3">
                          <BootstrapForm.Label>When did you report the incident?</BootstrapForm.Label>
                          <Field
                            type="date"
                            name="reported_incident_date"
                            className="form-control"
                          />
                          <ErrorMessage name="reported_incident_date">
                            {msg => <div className="error-message">{msg}</div>}
                          </ErrorMessage>
                        </BootstrapForm.Group>
                        
                        <BootstrapForm.Group className="mb-3">
                          <BootstrapForm.Label>Who did you report it to? (select all that apply)</BootstrapForm.Label>
                          <div className="checkbox-group">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="teacher"
                                name="reported_to"
                                value="Teacher"
                                className="form-check-input"
                                checked={values.reported_to.includes('Teacher')}
                                onChange={(e) => handleReportedToChange(e, setFieldValue, values)}
                              />
                              <label className="form-check-label" htmlFor="teacher">
                                Teacher
                              </label>
                            </div>
                            
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="principal"
                                name="reported_to"
                                value="Principal/Vice-Principal"
                                className="form-check-input"
                                checked={values.reported_to.includes('Principal/Vice-Principal')}
                                onChange={(e) => handleReportedToChange(e, setFieldValue, values)}
                              />
                              <label className="form-check-label" htmlFor="principal">
                                Principal/Vice-Principal
                              </label>
                            </div>
                            
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="guidance_counselor"
                                name="reported_to"
                                value="Guidance Counselor"
                                className="form-check-input"
                                checked={values.reported_to.includes('Guidance Counselor')}
                                onChange={(e) => handleReportedToChange(e, setFieldValue, values)}
                              />
                              <label className="form-check-label" htmlFor="guidance_counselor">
                                Guidance Counselor
                              </label>
                            </div>
                            
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="school_staff"
                                name="reported_to"
                                value="Other School Staff"
                                className="form-check-input"
                                checked={values.reported_to.includes('Other School Staff')}
                                onChange={(e) => handleReportedToChange(e, setFieldValue, values)}
                              />
                              <label className="form-check-label" htmlFor="school_staff">
                                Other School Staff
                              </label>
                            </div>
                            
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="school_board"
                                name="reported_to"
                                value="School Board"
                                className="form-check-input"
                                checked={values.reported_to.includes('School Board')}
                                onChange={(e) => handleReportedToChange(e, setFieldValue, values)}
                              />
                              <label className="form-check-label" htmlFor="school_board">
                                School Board
                              </label>
                            </div>
                            
                            <div className="form-check">
                              <input
                                type="checkbox"
                                id="police"
                                name="reported_to"
                                value="Police"
                                className="form-check-input"
                                checked={values.reported_to.includes('Police')}
                                onChange={(e) => handleReportedToChange(e, setFieldValue, values)}
                              />
                              <label className="form-check-label" htmlFor="police">
                                Police
                              </label>
                            </div>
                          </div>
                          <ErrorMessage name="reported_to">
                            {msg => <div className="error-message">{msg}</div>}
                          </ErrorMessage>
                        </BootstrapForm.Group>
                      </div>
                    </>
                  )}

                  <Row>
                    <Col>
                      <AutoSaveIndicator status={saveStatus} />
                    </Col>
                  </Row>

                  <FormNavigation
                    responseId={responseId}
                    currentStep="incident-details"
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

export default IncidentDetailsPage; 