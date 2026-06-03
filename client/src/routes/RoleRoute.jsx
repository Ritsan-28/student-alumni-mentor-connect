import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Protects routes that require specific roles
// Usage: <RoleRoute allowedRoles={['admin']} />
const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;