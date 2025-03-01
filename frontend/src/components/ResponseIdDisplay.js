import React from 'react';

const ResponseIdDisplay = ({ responseId }) => {
  return (
    <div className="response-id">
      <small>
        <i className="fas fa-key me-1"></i>
        Response ID: <span className="fw-bold">{responseId}</span>
        <span className="ms-2 text-muted">(Save this ID to resume your report later)</span>
      </small>
    </div>
  );
};

export default ResponseIdDisplay; 