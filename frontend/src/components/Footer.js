import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-light py-3 mt-4">
      <Container className="text-center">
        <p className="mb-0 text-muted">
          &copy; {currentYear} GUARD Reporting Platform. All rights reserved.
        </p>
        <p className="mb-0 text-muted small">
          <span className="me-2">
            <i className="fas fa-shield-alt"></i> Gather, Understand, Address, Report, Defend
          </span>
        </p>
      </Container>
    </footer>
  );
};

export default Footer; 