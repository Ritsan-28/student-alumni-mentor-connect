import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../store/authStore';

// Pages (we'll create these as we build each sprint)
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

// Dashboard redirect based on role
const DashboardRedirect = () => {
  const { user } = useAuthStore();

  const routes = {
    student: '/student/dashboard',
    alumni: '/alumni/dashboard',
    mentor: '/mentor/dashboard',
    admin: '/admin/dashboard',
  };

  return (
    <Navigate
      to={routes[user?.role] || '/login'}
      replace
    />
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<DashboardRedirect />}
          />

          {/* Role-based routes will be added later */}
        </Route>

        {/* 404 Page */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;