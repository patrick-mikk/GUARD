import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { personalInfoSchema } from '../utils/validationSchemas';
import { getNextStepUrl, getPrevStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const PersonalInfoPage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    age_group: '',
    school_level: '',
    school_board: '',
    gender_identity: '',
    sexual_orientation: '',
    cultural_background: '',
    contact_permission: false,
    contact_email: '',
    contact_phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        
        // Check if user has completed the previous step
        if (!reportData.reported_officially) {
          navigate(getPrevStepUrl('personal-info', responseId));
          return;
        }
        
        setInitialValues({
          age_group: reportData.age_group || '',
          school_level: reportData.school_level || '',
          school_board: reportData.school_board || '',
          gender_identity: reportData.gender_identity || '',
          sexual_orientation: reportData.sexual_orientation || '',
          cultural_background: reportData.cultural_background || '',
          contact_permission: reportData.contact_permission || false,
          contact_email: reportData.contact_email || '',
          contact_phone: reportData.contact_phone || ''
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
        await reportApi.updatePersonalInfo(responseId, values);
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
      await reportApi.updatePersonalInfo(responseId, values);
      navigate(getNextStepUrl('personal-info', responseId));
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
      <h1 className="section-title">Personal Information</h1>
      <ProgressBar currentStep="personal-info" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <p className="mb-4">
            This information helps us understand the demographics of individuals experiencing incidents.
            All information is kept confidential and is optional.
          </p>
          
          <Formik
            initialValues={initialValues}
            validationSchema={personalInfoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, isSubmitting, isValid, dirty, handleChange, setFieldValue }) => {
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
                        <BootstrapForm.Label>Age Group</BootstrapForm.Label>
                        <Field
                          as="select"
                          name="age_group"
                          className="form-select"
                        >
                          <option value="">Select your age group</option>
                          <option value="Under 13">Under 13</option>
                          <option value="13-15">13-15</option>
                          <option value="16-18">16-18</option>
                          <option value="19-24">19-24</option>
                          <option value="25+">25+</option>
                        </Field>
                        <ErrorMessage name="age_group">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </Col>
                    
                    <Col md={6}>
                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>School Level</BootstrapForm.Label>
                        <Field
                          as="select"
                          name="school_level"
                          className="form-select"
                        >
                          <option value="">Select school level</option>
                          <option value="Elementary">Elementary</option>
                          <option value="Middle School">Middle School</option>
                          <option value="High School">High School</option>
                          <option value="Post-Secondary">Post-Secondary</option>
                        </Field>
                        <ErrorMessage name="school_level">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </Col>
                  </Row>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>School Board</BootstrapForm.Label>
                    <Field
                      as="select"
                      name="school_board"
                      className="form-select"
                    >
                      <option value="">Select your school board</option>
                      <option value="Toronto District School Board">Toronto District School Board</option>
                      <option value="Toronto Catholic District School Board">Toronto Catholic District School Board</option>
                      <option value="Peel District School Board">Peel District School Board</option>
                      <option value="Dufferin-Peel Catholic District School Board">Dufferin-Peel Catholic District School Board</option>
                      <option value="York Region District School Board">York Region District School Board</option>
                      <option value="York Catholic District School Board">York Catholic District School Board</option>
                      <option value="Ottawa-Carleton District School Board">Ottawa-Carleton District School Board</option>
                      <option value="Ottawa Catholic School Board">Ottawa Catholic School Board</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="school_board">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <Row>
                    <Col md={6}>
                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>Gender Identity</BootstrapForm.Label>
                        <Field
                          as="select"
                          name="gender_identity"
                          className="form-select"
                        >
                          <option value="">Select your gender identity</option>
                          <option value="Woman">Woman</option>
                          <option value="Man">Man</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Two-Spirit">Two-Spirit</option>
                          <option value="Transgender">Transgender</option>
                          <option value="Gender fluid">Gender fluid</option>
                          <option value="Prefer to self-describe">Prefer to self-describe</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </Field>
                        <ErrorMessage name="gender_identity">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </Col>
                    
                    <Col md={6}>
                      <BootstrapForm.Group className="mb-3">
                        <BootstrapForm.Label>Sexual Orientation</BootstrapForm.Label>
                        <Field
                          as="select"
                          name="sexual_orientation"
                          className="form-select"
                        >
                          <option value="">Select your sexual orientation</option>
                          <option value="Straight/Heterosexual">Straight/Heterosexual</option>
                          <option value="Gay">Gay</option>
                          <option value="Lesbian">Lesbian</option>
                          <option value="Bisexual">Bisexual</option>
                          <option value="Pansexual">Pansexual</option>
                          <option value="Asexual">Asexual</option>
                          <option value="Queer">Queer</option>
                          <option value="Questioning">Questioning</option>
                          <option value="Prefer to self-describe">Prefer to self-describe</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </Field>
                        <ErrorMessage name="sexual_orientation">
                          {msg => <div className="error-message">{msg}</div>}
                        </ErrorMessage>
                      </BootstrapForm.Group>
                    </Col>
                  </Row>

                  <BootstrapForm.Group className="mb-3">
                    <BootstrapForm.Label>Cultural Background (Optional)</BootstrapForm.Label>
                    <Field
                      type="text"
                      name="cultural_background"
                      className="form-control"
                      placeholder="How would you describe your cultural background?"
                    />
                    <BootstrapForm.Text className="text-muted">
                      This information helps us understand intersectionality in reported incidents.
                    </BootstrapForm.Text>
                    <ErrorMessage name="cultural_background">
                      {msg => <div className="error-message">{msg}</div>}
                    </ErrorMessage>
                  </BootstrapForm.Group>

                  <div className="highlight-box mb-4">
                    <h2 className="h5 mb-3">Contact Information (Optional)</h2>
                    <p className="mb-3">
                      Providing contact information is optional. If you do provide it, we may contact you 
                      for follow-up questions or to provide additional resources.
                    </p>
                    
                    <BootstrapForm.Group className="mb-3">
                      <Field
                        type="checkbox"
                        name="contact_permission"
                        id="contact_permission"
                        checked={values.contact_permission}
                        onChange={() => {
                          setFieldValue('contact_permission', !values.contact_permission);
                          if (!values.contact_permission === false) {
                            setFieldValue('contact_email', '');
                            setFieldValue('contact_phone', '');
                          }
                        }}
                        className="form-check-input"
                      />
                      <BootstrapForm.Label htmlFor="contact_permission" className="form-check-label ms-2">
                        I give permission to be contacted about my report
                      </BootstrapForm.Label>
                    </BootstrapForm.Group>

                    {values.contact_permission && (
                      <>
                        <Row>
                          <Col md={6}>
                            <BootstrapForm.Group className="mb-3">
                              <BootstrapForm.Label>Email Address</BootstrapForm.Label>
                              <Field
                                type="email"
                                name="contact_email"
                                className="form-control"
                                placeholder="Your email address"
                              />
                              <ErrorMessage name="contact_email">
                                {msg => <div className="error-message">{msg}</div>}
                              </ErrorMessage>
                            </BootstrapForm.Group>
                          </Col>
                          <Col md={6}>
                            <BootstrapForm.Group className="mb-3">
                              <BootstrapForm.Label>Phone Number (Optional)</BootstrapForm.Label>
                              <Field
                                type="tel"
                                name="contact_phone"
                                className="form-control"
                                placeholder="Your phone number"
                              />
                              <ErrorMessage name="contact_phone">
                                {msg => <div className="error-message">{msg}</div>}
                              </ErrorMessage>
                            </BootstrapForm.Group>
                          </Col>
                        </Row>
                      </>
                    )}
                  </div>

                  <Row>
                    <Col>
                      <AutoSaveIndicator status={saveStatus} />
                    </Col>
                  </Row>

                  <FormNavigation
                    responseId={responseId}
                    currentStep="personal-info"
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

export default PersonalInfoPage; 