// frontend/src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          message: `This page requires ${requiredRole} role.`
        }} 
        replace 
      />
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          message: `You don't have permission to access this page.`
        }} 
        replace 
      />
    );
  }

  // All checks passed - render the protected component
  return children;
};

export default ProtectedRoute;