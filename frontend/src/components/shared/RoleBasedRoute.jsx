import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RoleBasedRoute Component
 * 
 * Purpose: Route users to appropriate pages based on their role
 * 
 * Flow:
 * 1. Check user authentication status
 * 2. Check user role (customer or mechanic)
 * 3. If user role matches allowedRole → render component
 * 4. If user role doesn't match → redirect to their appropriate home
 * 5. If not authenticated → redirect to /auth
 * 
 * Role Routing Logic:
 * - Customer role → /customer/home
 * - Mechanic role → /mechanic/dashboard
 * 
 * Usage:
 * <Route path="/customer/home" element={<RoleBasedRoute allowedRole="customer"><CustomerHome /></RoleBasedRoute>} />
 */
const RoleBasedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to appropriate home based on user role
  if (user.role !== allowedRole) {
    if (user.role === 'customer') {
      return <Navigate to="/customer/home" replace />;
    } else if (user.role === 'mechanic') {
      return <Navigate to="/mechanic/dashboard" replace />;
    }
  }

  return children;
};

export default RoleBasedRoute;
