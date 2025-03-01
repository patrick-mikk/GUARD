import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProgressBar from './components/ProgressBar';

// Pages
import HomePage from './pages/HomePage';
import BeforeYouBeginPage from './pages/BeforeYouBeginPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import ReportingResponsePage from './pages/ReportingResponsePage';
import SchoolResponsePage from './pages/SchoolResponsePage';
import ImpactSupportPage from './pages/ImpactSupportPage';
import AdditionalInfoPage from './pages/AdditionalInfoPage';
import ConfirmationPage from './pages/ConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<Navigate to="/report/before-you-begin" replace />} />
            <Route path="/report/:responseId/before-you-begin" element={<BeforeYouBeginPage />} />
            <Route path="/report/:responseId/personal-info" element={<PersonalInfoPage />} />
            <Route path="/report/:responseId/incident-details" element={<IncidentDetailsPage />} />
            <Route path="/report/:responseId/reporting-response" element={<ReportingResponsePage />} />
            <Route path="/report/:responseId/school-response" element={<SchoolResponsePage />} />
            <Route path="/report/:responseId/impact-support" element={<ImpactSupportPage />} />
            <Route path="/report/:responseId/additional-info" element={<AdditionalInfoPage />} />
            <Route path="/report/:responseId/confirmation" element={<ConfirmationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default App; 