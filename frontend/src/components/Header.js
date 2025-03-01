import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>🛡️</span>
            <span className="fw-bold">GUARD Reporting Platform</span>
          </div>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header; 