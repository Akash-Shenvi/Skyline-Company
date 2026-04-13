import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ScrollToTop from './components/layout/ScrollToTop';
import ProfileCompletionModal from './components/auth/ProfileCompletionModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import LanguageDashboard from './pages/Admin/LanguageDashboard';
import LanguageEnrollmentDetails from './pages/Admin/LanguageEnrollmentDetails';
import LanguageBatches from './pages/Admin/LanguageBatches';
import LanguageBatchDetails from './pages/LanguageBatchDetails';
import BatchAssessmentPage from './pages/BatchAssessmentPage';
import LanguageTraining from './pages/LanguageTraining';
import CourseEnglishPage from './pages/CourseEnglishPage';
import CourseGermanPage from './pages/CourseGermanPage';
import CourseJapanesePage from './pages/CourseJapanesePage';
import InternshipApplicationPage from './pages/InternshipApplicationPage';
import NotFound404 from './pages/NotFound404';
import AboutPage from './pages/About';
import GoogleCallback from './pages/GoogleCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ContactPage from './pages/ContactPage';
import AdminContactMessages from './pages/Admin/AdminContactMessages';
import AdminBookingRequests from './pages/Admin/AdminBookingRequests';
import AdminInternshipApplications from './pages/Admin/AdminInternshipApplications';
import AdminInternshipCatalog from './pages/Admin/AdminInternshipCatalog';
import ManageTrainers from './pages/Admin/ManageTrainers';
import FeedbackPage from './pages/FeedbackPage';
import AdminFeedback from './pages/Admin/AdminFeedback';
import AdminFileLinks from './pages/Admin/AdminFileLinks';
import AdminInstitutionRequests from './pages/Admin/AdminInstitutionRequests';
import ManageStudents from './pages/Admin/ManageStudents';
import ChatPage from './pages/ChatPage';
import VerificationPage from './pages/VerificationPage';
import CareersPage from './pages/CareersPage';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InstitutionLoginPage from './pages/InstitutionLoginPage';
import InstitutionRegisterPage from './pages/InstitutionRegisterPage';
import PaymentResultPage from './pages/PaymentResultPage';
import { getDashboardPathForRole } from './lib/authRouting';
import { isInstitutionStudentRole } from './lib/roles';



// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-off-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-brand-olive-dark">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        const redirectTo = `${location.pathname}${location.search}${location.hash}`;
        return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace state={{ from: location }} />;
    }

    return <>{children}</>;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-off-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-brand-olive-dark">Loading...</p>
                </div>
            </div>
        );
    }

    if (user) {
        const redirectTarget = new URLSearchParams(location.search).get('redirect');
        if (redirectTarget && redirectTarget.startsWith('/')) {
            return <Navigate to={redirectTarget} replace />;
        }
        return <Navigate to={getDashboardPathForRole(user.role)} replace />;
    }

    return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const TrainerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user || user.role !== 'trainer') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const InstitutionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user || user.role !== 'institution') {
        const redirectTo = `${location.pathname}${location.search}${location.hash}`;
        return <Navigate to={`/institution/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
    }

    return <>{children}</>;
};

const AppContent = () => {
    const { user } = useAuth();

    const isProfileIncomplete = user
        && user.role !== 'institution'
        && !isInstitutionStudentRole(user.role)
        && user.isProfileComplete === false;

    return (
        <>
            <ScrollToTop />
            <ProfileCompletionModal isOpen={!!isProfileIncomplete} />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/language-training" element={<LanguageTraining />} />
                <Route path="/training/english" element={<CourseEnglishPage />} />
                <Route path="/training/german" element={<CourseGermanPage />} />
                <Route path="/training/japanese" element={<CourseJapanesePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/payment-result" element={<PaymentResultPage />} />

                <Route
                    path="/internship-application"
                    element={
                        <ProtectedRoute>
                            <InternshipApplicationPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/institution/login"
                    element={
                        <PublicRoute>
                            <InstitutionLoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/institution/register"
                    element={
                        <PublicRoute>
                            <InstitutionRegisterPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <PublicRoute>
                            <ForgotPasswordPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/reset-password"
                    element={
                        <PublicRoute>
                            <ResetPasswordPage />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/student-dashboard"
                    element={
                        <ProtectedRoute>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trainer-dashboard"
                    element={
                        <TrainerRoute>
                            <TrainerDashboard />
                        </TrainerRoute>
                    }
                />
                <Route
                    path="/institution-dashboard"
                    element={
                        <InstitutionRoute>
                            <InstitutionDashboard />
                        </InstitutionRoute>
                    }
                />

                {/* Admin Routes */}
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                {/* Webinar admin routes are intentionally disabled for now. */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/languages"
                    element={
                        <AdminRoute>
                            <LanguageDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/language-enrollment-details"
                    element={
                        <AdminRoute>
                            <LanguageEnrollmentDetails />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/language-batches"
                    element={
                        <AdminRoute>
                            <LanguageBatches />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/language-batch/:batchId"
                    element={
                        <ProtectedRoute>
                            <LanguageBatchDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/language-batch/:batchId/assessments/new"
                    element={
                        <ProtectedRoute>
                            <BatchAssessmentPage trainingType="language" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/language-batch/:batchId/assessments/:assessmentId"
                    element={
                        <ProtectedRoute>
                            <BatchAssessmentPage trainingType="language" />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/messages"
                    element={
                        <AdminRoute>
                            <AdminContactMessages />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/booking-requests"
                    element={
                        <AdminRoute>
                            <AdminBookingRequests />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/internship-applications"
                    element={
                        <AdminRoute>
                            <AdminInternshipApplications />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/internships"
                    element={
                        <AdminRoute>
                            <AdminInternshipCatalog />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/trainers"
                    element={
                        <AdminRoute>
                            <ManageTrainers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <ManageStudents />
                        </AdminRoute>
                    }
                />
                <Route path="/admin/students" element={<Navigate to="/admin/users" replace />} />
                <Route
                    path="/admin/feedback"
                    element={
                        <AdminRoute>
                            <AdminFeedback />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/file-links"
                    element={
                        <AdminRoute>
                            <AdminFileLinks />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/institutions"
                    element={
                        <AdminRoute>
                            <AdminInstitutionRequests />
                        </AdminRoute>
                    }
                />
                {/*
                Webinar admin routes are intentionally disabled for now.
                <Route
                    path="/admin/webinars"
                    element={
                        <AdminRoute>
                            <AdminWebinars />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/webinar-registrations"
                    element={
                        <AdminRoute>
                            <AdminWebinarRegistrations />
                        </AdminRoute>
                    }
                />
                */}

                <Route
                    path="/chat/:studentId"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound404 />} />
            </Routes >
        </>
    );
};

const App = () => {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
            <AuthProvider>
                <BrowserRouter>
                    <NotificationProvider>
                        <AppContent />
                    </NotificationProvider>
                </BrowserRouter>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
};

export default App;
