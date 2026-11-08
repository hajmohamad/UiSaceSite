import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProgramsListPage from './pages/ProgramsListPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import MembersPage from './pages/MembersPage';
import RegistrationPage from './pages/RegistrationPage';
import MemberDetailPage from './pages/MemberDetailPage';
import JobsPage from './pages/JobsPage';
import ContactPage from './pages/ContactPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import PublicFormPage from './pages/PublicFormPage';
import CustomHtmlRenderer from './pages/CustomHtmlRenderer';
import CertificatesVerifyPage from './pages/CertificatesVerifyPage';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';

// Admin Protected & Layout
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPrograms = lazy(() => import('./pages/admin/AdminPrograms'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates'));
const AdminPromoCodes = lazy(() => import('./pages/admin/AdminPromoCodes'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'));
const AdminForms = lazy(() => import('./pages/admin/AdminForms'));
const AdminMembers = lazy(() => import('./pages/admin/AdminMembers'));
const AdminCustomPages = lazy(() => import('./pages/admin/AdminCustomPages'));
const AdminMediaLinks = lazy(() => import('./pages/admin/AdminMediaLinks'));

const AdminLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px] text-slate-400">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>
      <Footer />
      <PwaInstallPrompt />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Site Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsListPage />} />
          <Route path="/programs/:id" element={<ProgramDetailPage />} />
          <Route path="/programs/:id/register" element={<RegistrationPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/certificates" element={<CertificatesVerifyPage />} />
          <Route path="/certificates/:id" element={<CertificatesVerifyPage />} />
          <Route path="/form/:id" element={<PublicFormPage />} />
          <Route path="/porsline/:id" element={<PublicFormPage />} />
          <Route path="*" element={<CustomHtmlRenderer />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="programs"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminPrograms />
                </Suspense>
              }
            />
            <Route
              path="jobs"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminJobs />
                </Suspense>
              }
            />
            <Route
              path="members"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminMembers />
                </Suspense>
              }
            />
            <Route
              path="files"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminFiles />
                </Suspense>
              }
            />
            <Route
              path="custom-pages"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminCustomPages />
                </Suspense>
              }
            />
            <Route
              path="media-links"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminMediaLinks />
                </Suspense>
              }
            />
            <Route
              path="forms"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminForms />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminUsers />
                </Suspense>
              }
            />
            <Route
              path="registrations"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminRegistrations />
                </Suspense>
              }
            />
            <Route
              path="certificates"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminCertificates />
                </Suspense>
              }
            />
            <Route
              path="promo-codes"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminPromoCodes />
                </Suspense>
              }
            />
            <Route
              path="messages"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminMessages />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
