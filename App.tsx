import React from 'react';
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

// Admin Imports
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminMessages from './pages/admin/AdminMessages';
import AdminFiles from './pages/admin/AdminFiles';
import AdminForms from './pages/admin/AdminForms';
import AdminMembers from './pages/admin/AdminMembers';
import PublicFormPage from './pages/PublicFormPage';

const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>
      <Footer />
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
          <Route path="/form/:id" element={<PublicFormPage />} />
          <Route path="/porsline/:id" element={<PublicFormPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="files" element={<AdminFiles />} />
            <Route path="forms" element={<AdminForms />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
