import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import useAuthStore from '../store/authStore';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';

// Protected Pages
import Profile from '../pages/Profile';
import ProfileView from '../pages/ProfileView';
import StudentDashboard from '../pages/StudentDashboard';
import AlumniDashboard from '../pages/AlumniDashboard';
import MentorDashboard from '../pages/MentorDashboard';
import MentorSearch from '../pages/MentorSearch';
import Connections from '../pages/Connections';
import Messages from '../pages/Messages';
import Events from '../pages/Events';
import CreateEvent from '../pages/CreateEvent';
import Jobs from '../pages/Jobs';
import CreateJob from '../pages/CreateJob';
import Notifications from '../pages/Notifications';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  const routes = {
    student: '/student/dashboard',
    alumni:  '/alumni/dashboard',
    mentor:  '/mentor/dashboard',
    admin:   '/admin/dashboard',
  };
  return <Navigate to={routes[user?.role] || '/login'} replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/"                element={<Landing />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Protected (any authenticated user) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"              element={<DashboardRedirect />} />
          <Route path="/profile"                element={<Profile />} />
          <Route path="/profile/view/:id"       element={<ProfileView />} />
          <Route path="/mentors"                element={<MentorSearch />} />
          <Route path="/connections"            element={<Connections />} />
          <Route path="/messages"               element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/events"                 element={<Events />} />
          <Route path="/events/create"          element={<CreateEvent />} />
          <Route path="/jobs"                   element={<Jobs />} />
          <Route path="/jobs/create"            element={<CreateJob />} />
          <Route path="/notifications"          element={<Notifications />} />

          {/* Student only */}
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard"    element={<StudentDashboard />} />
          </Route>

          {/* Alumni only */}
          <Route element={<RoleRoute allowedRoles={['alumni']} />}>
            <Route path="/alumni/dashboard"     element={<AlumniDashboard />} />
          </Route>

          {/* Mentor only */}
          <Route element={<RoleRoute allowedRoles={['mentor']} />}>
            <Route path="/mentor/dashboard"     element={<MentorDashboard />} />
          </Route>

          {/* Admin only */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard"      element={<AdminDashboard />} />
            <Route path="/admin/users"          element={<AdminUsers />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;