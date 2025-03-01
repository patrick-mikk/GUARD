import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Card, Form as BootstrapForm, Row, Col, Alert } from 'react-bootstrap';
import { beforeYouBeginSchema } from '../utils/validationSchemas';
import { getNextStepUrl, debounce } from '../utils/formUtils';
import reportApi from '../services/api';

// Components
import ProgressBar from '../components/ProgressBar';
import FormNavigation from '../components/FormNavigation';
import ResponseIdDisplay from '../components/ResponseIdDisplay';
import AutoSaveIndicator from '../components/AutoSaveIndicator';

const BeforeYouBeginPage = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState(null);
  const [initialValues, setInitialValues] = useState({
    reported_officially: '',
    research_consent: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing data if resuming a report
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportData = await reportApi.getReport(responseId);
        setInitialValues({
          reported_officially: reportData.reported_officially || '',
          research_consent: reportData.research_consent || false
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
  }, [responseId]);

  // Handle auto-save with debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (values) => {
      try {
        setSaveStatus('saving');
        await reportApi.updateBeforeYouBegin(responseId, values);
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
      await reportApi.updateBeforeYouBegin(responseId, values);
      navigate(getNextStepUrl('before-you-begin', responseId));
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
      <h1 className="section-title">Before You Begin</h1>
      <ProgressBar currentStep="before-you-begin" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Formik
            initialValues={initialValues}
            validationSchema={beforeYouBeginSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, isSubmitting, isValid, dirty, handleChange }) => {
              // Trigger auto-save when values change
              useEffect(() => {
                if (dirty) {
                  debouncedSave(values);
                }
              }, [values, dirty]);

              return (
                <Form>
                  <div className="mb-4">
                    <h2 className="h5 mb-3">Official Reporting</h2>
                    <p>
                      This reporting platform is separate from your school's official reporting process. 
                      We encourage you to also report incidents through your school or school board's 
                      official channels, if you feel comfortable doing so.
                    </p>
                    
                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Label>
                        Have you already reported this incident through official school channels?
                      </BootstrapForm.Label>
                      <div>
                        <BootstrapForm.Check
                          type="radio"
                          id="reported-yes"
                          name="reported_officially"
                          value="Yes"
                          label="Yes, I have already reported this incident officially"
                          checked={values.reported_officially === 'Yes'}
                          onChange={handleChange}
                          className="mb-2"
                        />
                        <BootstrapForm.Check
                          type="radio"
                          id="reported-no"
                          name="reported_officially"
                          value="No"
                          label="No, I have not reported this incident officially"
                          checked={values.reported_officially === 'No'}
                          onChange={handleChange}
                          className="mb-2"
                        />
                        <BootstrapForm.Check
                          type="radio"
                          id="reported-unsure"
                          name="reported_officially"
                          value="Unsure"
                          label="I'm not sure if it was reported officially"
                          checked={values.reported_officially === 'Unsure'}
                          onChange={handleChange}
                        />
                      </div>
                      <ErrorMessage name="reported_officially">
                        {msg => <div className="error-message">{msg}</div>}
                      </ErrorMessage>
                    </BootstrapForm.Group>
                  </div>

                  <div className="mb-4">
                    <h2 className="h5 mb-3">Research Consent</h2>
                    <div className="highlight-box mb-3">
                      <p className="mb-2">
                        <strong>Why are we collecting this information?</strong>
                      </p>
                      <p className="mb-0">
                        The information you provide will be used to understand patterns and prevalence 
                        of bullying, harassment, and discrimination against 2SLGBTQIA+ individuals in 
                        Ontario schools. This data will help inform advocacy efforts, policy recommendations, 
                        and educational initiatives.
                      </p>
                    </div>
                    
                    <BootstrapForm.Group className="mb-3">
                      <BootstrapForm.Check
                        type="checkbox"
                        id="research-consent"
                        name="research_consent"
                        checked={values.research_consent}
                        onChange={handleChange}
                        label={
                          <span>
                            I consent to my anonymous report data being used for research purposes 
                            to understand patterns and improve support systems for 2SLGBTQIA+ students.
                          </span>
                        }
                      />
                      <ErrorMessage name="research_consent">
                        {msg => <div className="error-message">{msg}</div>}
                      </ErrorMessage>
                    </BootstrapForm.Group>
                  </div>

                  <Row>
                    <Col>
                      <AutoSaveIndicator status={saveStatus} />
                    </Col>
                  </Row>

                  <FormNavigation
                    responseId={responseId}
                    currentStep="before-you-begin"
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    dirty={dirty}
                    showPrevButton={false}
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

export default BeforeYouBeginPage; 