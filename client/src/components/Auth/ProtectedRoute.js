import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, roles = [] }) => {
  /*
   * security-gatekeeper
   * Wrapper component that enforces Role-Based Access Control (RBAC).
   * - Authentication Check: Redirects unauthenticated users to Login.
   * - Authorization Check: Redirects authenticated users without the required role (e.g., Reader trying to access Admin) to Home.
   * - Loading State: Prevents premature redirection while the session is validating.
   */
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
