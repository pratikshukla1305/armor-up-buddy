
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';

interface ProtectedOfficerRouteProps {
  children: React.ReactNode;
}

const ProtectedOfficerRoute: React.FC<ProtectedOfficerRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useOfficerAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shield-blue"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/officer-login" replace />;
  }
  
  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedOfficerRoute;
