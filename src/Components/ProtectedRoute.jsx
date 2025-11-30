import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute component that requires authentication to access
 * Redirects unauthenticated users to the login page
 * Preserves the intended destination for post-login redirect
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.user);
  const location = useLocation();

  if (!token) {
    // Redirect to login page while preserving the intended destination
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
