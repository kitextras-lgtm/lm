import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { ProfileCreationProvider } from './contexts/ProfileCreationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const UserTypeSelectionPage = lazy(() => import('./pages/UserTypeSelectionPage').then(module => ({ default: module.UserTypeSelectionPage })));
const MakeProfilePage = lazy(() => import('./pages/MakeProfilePage').then(module => ({ default: module.MakeProfilePage })));
const TellUsAboutYourselfPage = lazy(() => import('./pages/TellUsAboutYourselfPage').then(module => ({ default: module.TellUsAboutYourselfPage })));
const ContactForm = lazy(() => import('./components/ContactForm').then(module => ({ default: module.ContactForm })));
const ArtistDashboard = lazy(() => import('./pages/ArtistDashboard').then(module => ({ default: module.ArtistDashboard })));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard').then(module => ({ default: module.CreatorDashboard })));
const FreelancerDashboard = lazy(() => import('./pages/FreelancerDashboard').then(module => ({ default: module.FreelancerDashboard })));
const FreelancerOnboarding = lazy(() => import('./pages/FreelancerOnboarding').then(module => ({ default: module.FreelancerOnboarding })));
const FreelancerProfileCreation = lazy(() => import('./pages/FreelancerProfileCreation').then(module => ({ default: module.FreelancerProfileCreation })));
const FreelancerCategorySelection = lazy(() => import('./pages/FreelancerCategorySelection'));
const FreelancerSkillsSelection = lazy(() => import('./pages/FreelancerSkillsSelection'));
const FreelancerProfileTitle = lazy(() => import('./pages/FreelancerProfileTitle'));
const FreelancerExperience = lazy(() => import('./pages/FreelancerExperience'));
const FreelancerEducation = lazy(() => import('./pages/FreelancerEducation'));
const FreelancerLanguages = lazy(() => import('./pages/FreelancerLanguages'));
const FreelancerPortfolio = lazy(() => import('./pages/FreelancerPortfolio'));
const FreelancerBio = lazy(() => import('./pages/FreelancerBio'));
const FreelancerSetRate = lazy(() => import('./pages/FreelancerSetRate'));
const FreelancerPhotoLocation = lazy(() => import('./pages/FreelancerPhotoLocation'));
const FreelancerReviewProfile = lazy(() => import('./pages/FreelancerReviewProfile'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard').then(module => ({ default: module.BusinessDashboard })));
const MobileMenuPage = lazy(() => import('./pages/MobileMenuPage').then(module => ({ default: module.MobileMenuPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const VerifySetupPage = lazy(() => import('./pages/VerifySetupPage').then(module => ({ default: module.VerifySetupPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const LearnArtist = lazy(() => import('./pages/LearnArtist'));
const LearnFreelancer = lazy(() => import('./pages/LearnFreelancer'));
const LearnBrands = lazy(() => import('./pages/LearnBrands').then(module => ({ default: module.LearnBrands })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then(module => ({ default: module.TermsOfServicePage })));

function App() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <ProfileCreationProvider>
          <AdminAuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<div />}>
                <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MobileMenuPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/artist" element={<SignupPage />} />
          <Route path="/signup/freelancer" element={<SignupPage />} />
          <Route path="/signup/brands" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/artist" element={<LoginPage forceArtist={true} />} />
          <Route path="/login/freelancer" element={<LoginPage forceSource="freelancer" />} />
          <Route path="/login/brands" element={<LoginPage forceSource="brand" />} />
          <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
          <Route path="/make-profile" element={<MakeProfilePage />} />
          <Route path="/tell-us-about-yourself" element={<TellUsAboutYourselfPage />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route 
            path="/dashboard/artist" 
            element={
              <ProtectedRoute>
                <ArtistDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/creator" 
            element={
              <ProtectedRoute>
                <CreatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-onboarding" 
            element={
              <ProtectedRoute>
                <FreelancerOnboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-profile-creation" 
            element={
              <ProtectedRoute>
                <FreelancerProfileCreation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-category-selection" 
            element={
              <ProtectedRoute>
                <FreelancerCategorySelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-skills-selection" 
            element={
              <ProtectedRoute>
                <FreelancerSkillsSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-profile-title" 
            element={
              <ProtectedRoute>
                <FreelancerProfileTitle />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-experience" 
            element={
              <ProtectedRoute>
                <FreelancerExperience />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-education" 
            element={
              <ProtectedRoute>
                <FreelancerEducation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-languages" 
            element={
              <ProtectedRoute>
                <FreelancerLanguages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-portfolio" 
            element={
              <ProtectedRoute>
                <FreelancerPortfolio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-bio" 
            element={
              <ProtectedRoute>
                <FreelancerBio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-set-rate" 
            element={
              <ProtectedRoute>
                <FreelancerSetRate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-photo-location" 
            element={
              <ProtectedRoute>
                <FreelancerPhotoLocation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/freelancer-review-profile" 
            element={
              <ProtectedRoute>
                <FreelancerReviewProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/freelancer" 
            element={
              <ProtectedRoute>
                <FreelancerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/business" 
            element={
              <ProtectedRoute>
                <BusinessDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/verify-setup" element={<VerifySetupPage />} />
          <Route path="/learn/artist" element={<LearnArtist />} />
          <Route path="/learn/freelancer" element={<LearnFreelancer />} />
          <Route path="/learn/brands" element={<LearnBrands />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
                </Routes>
              </Suspense>
            </Router>
          </AdminAuthProvider>
        </ProfileCreationProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;
