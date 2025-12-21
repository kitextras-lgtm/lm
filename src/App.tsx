import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const UserTypeSelectionPage = lazy(() => import('./pages/UserTypeSelectionPage').then(module => ({ default: module.UserTypeSelectionPage })));
const MakeProfilePage = lazy(() => import('./pages/MakeProfilePage').then(module => ({ default: module.MakeProfilePage })));
const TellUsAboutYourselfPage = lazy(() => import('./pages/TellUsAboutYourselfPage').then(module => ({ default: module.TellUsAboutYourselfPage })));
const ContactForm = lazy(() => import('./components/ContactForm').then(module => ({ default: module.ContactForm })));
const ArtistDashboard = lazy(() => import('./pages/ArtistDashboard').then(module => ({ default: module.ArtistDashboard })));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard').then(module => ({ default: module.CreatorDashboard })));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard').then(module => ({ default: module.BusinessDashboard })));
const MobileMenuPage = lazy(() => import('./pages/MobileMenuPage').then(module => ({ default: module.MobileMenuPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const VerifySetupPage = lazy(() => import('./pages/VerifySetupPage').then(module => ({ default: module.VerifySetupPage })));

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div style={{ backgroundColor: '#000', minHeight: '100vh' }} />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MobileMenuPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
          <Route path="/make-profile" element={<MakeProfilePage />} />
          <Route path="/tell-us-about-yourself" element={<TellUsAboutYourselfPage />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/dashboard/artist" element={<ArtistDashboard />} />
          <Route path="/dashboard/creator" element={<CreatorDashboard />} />
          <Route path="/dashboard/business" element={<BusinessDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/verify-setup" element={<VerifySetupPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;