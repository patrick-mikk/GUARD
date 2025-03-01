import React from 'react';

const AutoSaveIndicator = ({ status }) => {
  let message = '';
  let icon = '';
  
  switch (status) {
    case 'saving':
      message = 'Saving...';
      icon = 'fas fa-spinner fa-spin';
      break;
    case 'success':
      message = 'All changes saved';
      icon = 'fas fa-check';
      break;
    case 'error':
      message = 'Failed to save changes';
      icon = 'fas fa-exclamation-triangle';
      break;
    default:
      return null;
  }
  
  return (
    <div className="autosave-indicator">
      <i className={`${icon} me-1`}></i> {message}
    </div>
  );
};

export default AutoSaveIndicator; 