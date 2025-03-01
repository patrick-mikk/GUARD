/**
 * Utility functions for the multi-step form
 */

// Define the steps and their order
const STEPS = [
  'before-you-begin',
  'personal-info',
  'incident-details',
  'reporting-response',
  'school-response',
  'impact-support',
  'additional-info',
  'confirmation'
];

/**
 * Returns the next step URL based on the current step
 * @param {string} currentStep - The current step
 * @param {string} responseId - The response ID
 * @returns {string} The URL for the next step
 */
export const getNextStepUrl = (currentStep, responseId) => {
  const currentIndex = STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
    return `/report/${responseId}/confirmation`;
  }
  
  const nextStep = STEPS[currentIndex + 1];
  return `/report/${responseId}/${nextStep}`;
};

/**
 * Returns the previous step URL based on the current step
 * @param {string} currentStep - The current step
 * @param {string} responseId - The response ID
 * @returns {string} The URL for the previous step
 */
export const getPrevStepUrl = (currentStep, responseId) => {
  const currentIndex = STEPS.indexOf(currentStep);
  if (currentIndex <= 0) {
    return '/'; // Return to home page if at first step
  }
  
  const prevStep = STEPS[currentIndex - 1];
  return `/report/${responseId}/${prevStep}`;
};

/**
 * Calculates the progress percentage based on the current step
 * @param {string} currentStep - The current step
 * @returns {number} The progress percentage (0-100)
 */
export const calculateProgress = (currentStep) => {
  const currentIndex = STEPS.indexOf(currentStep);
  if (currentIndex === -1) return 0;
  
  // Don't include confirmation in the progress calculation
  const totalSteps = STEPS.length - 1;
  const progress = Math.round((currentIndex / (totalSteps - 1)) * 100);
  
  return Math.min(progress, 100); // Cap at 100%
};

/**
 * Returns the current step number (1-indexed)
 * @param {string} currentStep - The current step
 * @returns {number} The step number
 */
export const getStepNumber = (currentStep) => {
  const currentIndex = STEPS.indexOf(currentStep);
  if (currentIndex === -1) return 1;
  
  // Don't include confirmation in the numbering
  return currentIndex === STEPS.length - 1 ? STEPS.length - 1 : currentIndex + 1;
};

/**
 * Returns the total number of steps (excluding confirmation)
 * @returns {number} The total number of steps
 */
export const getTotalSteps = () => {
  return STEPS.length - 1; // Don't include confirmation in the count
};

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed
 * @param {Function} func - The function to debounce
 * @param {number} wait - The wait time in milliseconds
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Formats a date string for display
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return as is if invalid
  
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Truncates text to a specified length and adds an ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}; 