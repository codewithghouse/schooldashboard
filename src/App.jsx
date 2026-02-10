import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import SchoolDashboard from './pages/school/SchoolDashboard';
import ClassesModule from './pages/school/ClassesModule';
import TeachersModule from './pages/school/TeachersModule';
import StudentsModule from './pages/school/StudentsModule';
import SyllabusModule from './pages/school/SyllabusModule';
import MonitoringModule from './pages/school/MonitoringModule';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherTests from './pages/teacher/TeacherTests';
import ParentDashboard from './pages/parent/ParentDashboard';
import SchoolOnboarding from './pages/school/SchoolOnboarding';
import CoTeacherHub from './pages/teacher/CoTeacherHub';
import DailyCommand from './pages/teacher/DailyCommand';
import ClassIntelligence from './pages/teacher/ClassIntelligence';
import SyllabusTracking from './pages/teacher/SyllabusTracking';
import WeeklyNotes from './pages/teacher/WeeklyNotes';
import CommunicationControl from './pages/teacher/CommunicationControl';
import ProfessionalProof from './pages/teacher/ProfessionalProof';
import SupportModule from './pages/common/SupportModule';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

import AcceptInvite from './pages/auth/AcceptInvite';

// Centralized Routing Orchestrator
const AppRoutes = () => {
  const { user, role, userData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (user) {
      if (role) {
        if (location.pathname === '/login' || location.pathname === '/') {
          if (role === 'admin') {
            if (!userData?.schoolId) navigate('/school-onboarding');
            else navigate('/school/dashboard');
          }
          else if (role === 'teacher') {
            navigate('/teacher/dashboard');
          }
          else if (role === 'parent') {
            navigate('/parent/dashboard');
          }
        }
      } else {
        // Logged in but no role in /users/{uid}
        if (location.pathname !== '/school-onboarding') {
          navigate('/school-onboarding');
        }
      }
    }
    else if (!isPublicPath && location.pathname !== '/school-onboarding') {
      navigate('/login');
    }
  }, [user, role, userData, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Restoring Session...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/school-onboarding" element={<SchoolOnboarding />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* School Admin Routes */}
      <Route path="/school" element={<DashboardLayout role="admin" />}>
        <Route index element={<Navigate to="/school/dashboard" replace />} />
        <Route path="dashboard" element={<SchoolDashboard />} />
        <Route path="classes" element={<ClassesModule />} />
        <Route path="teachers" element={<TeachersModule />} />
        <Route path="students" element={<StudentsModule />} />
        <Route path="syllabus" element={<SyllabusModule />} />
        <Route path="monitoring" element={<MonitoringModule />} />
        <Route path="support" element={<SupportModule />} />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="command" element={<DailyCommand />} />
        <Route path="intelligence" element={<ClassIntelligence />} />
        <Route path="syllabus" element={<SyllabusTracking />} />
        <Route path="notes" element={<WeeklyNotes />} />
        <Route path="communication" element={<CommunicationControl />} />
        <Route path="performance" element={<ProfessionalProof />} />
        <Route path="hub" element={<CoTeacherHub />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="tests" element={<TeacherTests />} />
        <Route path="support" element={<SupportModule />} />
      </Route>

      {/* Parent Routes */}
      <Route path="/parent" element={<DashboardLayout role="parent" />}>
        <Route index element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="support" element={<SupportModule />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;

