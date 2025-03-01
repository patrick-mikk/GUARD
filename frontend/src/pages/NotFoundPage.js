import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="py-5 d-flex justify-content-center">
      <Card className="shadow-sm text-center" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-5">
          <div className="display-1 text-muted mb-4">404</div>
          <h1 className="h3 mb-3">Page Not Found</h1>
          <p className="mb-4">
            We couldn't find the page you're looking for. The page may have been moved,
            deleted, or is temporarily unavailable.
          </p>
          <Link to="/">
            <Button variant="primary">
              <i className="fas fa-home me-2"></i>
              Return to Home
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotFoundPage;
