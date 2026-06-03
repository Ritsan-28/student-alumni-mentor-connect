import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Protects routes that require authentication
// If not logged in → redirect to login page
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;