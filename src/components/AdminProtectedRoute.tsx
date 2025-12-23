import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { AnimatedBarsLoader } from './AnimatedBarsLoader';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

/**
 * Protected route component for admin pages
 * Redirects to /admin/login if not authenticated
 * Checks permissions if requiredPermission is provided
 */
export function AdminProtectedRoute({ children, requiredPermission }: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
        <AnimatedBarsLoader text="Loading dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check permission if required
  if (requiredPermission) {
    if (!hasPermission(requiredPermission.resource, requiredPermission.action)) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
