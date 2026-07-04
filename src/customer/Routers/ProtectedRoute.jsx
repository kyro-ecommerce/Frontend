import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const {
    user,
    isLoading,
    isAuthenticated,
    logout: authLogout,
  } = useAuthContext();
  const location = useLocation();

  // Show loading while authentication is being checked
  if (isLoading) {
    return <div>Loading...</div>; // or your loading component
  }

  if (!user || !isAuthenticated) {
    // Redirect to home page, but save the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;