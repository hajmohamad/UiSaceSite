
import React from 'react';
import { HashRouter, Routes, Route, BrowserRouter } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProgramsListPage from './pages/ProgramsListPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import MembersPage from './pages/MembersPage';
import RegistrationPage from './pages/RegistrationPage';
import MemberDetailPage from './pages/MemberDetailPage';
import JobsPage from './pages/JobsPage'; // Import the JobsPage component
import ContactPage from './pages/ContactPage'; // Import the new ContactPage component
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen text-gray-800 bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
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


          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
