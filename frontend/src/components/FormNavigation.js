import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPrevStepUrl } from '../utils/formUtils';

const FormNavigation = ({ 
  responseId, 
  currentStep, 
  isSubmitting, 
  isValid, 
  dirty,
  nextButtonText = 'Next',
  showPrevButton = true
}) => {
  return (
    <Row className="mt-4">
      <Col>
        {showPrevButton && (
          <Link to={getPrevStepUrl(currentStep, responseId)}>
            <Button 
              variant="outline-secondary" 
              type="button"
              className="me-2"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Previous
            </Button>
          </Link>
        )}
      </Col>
      <Col className="text-end">
        <Button 
          variant="primary" 
          type="submit"
          disabled={isSubmitting || (!isValid && dirty)}
        >
          {nextButtonText}
          {nextButtonText === 'Next' && <i className="fas fa-arrow-right ms-2"></i>}
        </Button>
      </Col>
    </Row>
  );
};

export default FormNavigation; 