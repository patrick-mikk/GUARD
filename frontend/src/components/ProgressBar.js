import React from 'react';
import { ProgressBar as BootstrapProgressBar } from 'react-bootstrap';
import { calculateProgress, getStepNumber, getTotalSteps } from '../utils/formUtils';

const ProgressBar = ({ currentStep }) => {
  const progress = calculateProgress(currentStep);
  const stepNumber = getStepNumber(currentStep);
  const totalSteps = getTotalSteps();
  
  // Don't show progress bar on confirmation page
  if (currentStep === 'confirmation') {
    return null;
  }
  
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted">
          Step {stepNumber} of {totalSteps}
        </span>
        <span className="text-muted">{progress}% Complete</span>
      </div>
      <BootstrapProgressBar 
        now={progress} 
        variant="success" 
        animated={progress < 100} 
        style={{ height: '12px', borderRadius: '10px' }}
      />
    </div>
  );
};

export default ProgressBar; 