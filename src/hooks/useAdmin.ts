import { useCallback } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

/**
 * Custom hook for admin operations
 * Provides convenient access to admin authentication and permission checking
 */
export function useAdmin() {
  const { admin, isAuthenticated, hasPermission, sessionToken } = useAdminAuth();

  /**
   * Check if admin has permission for a resource and action
   */
  const can = (resource: string, action: string): boolean => {
    return hasPermission(resource, action);
  };

  /**
   * Get authorization header for API requests
   */
  const getAuthHeaders = (): Record<string, string> => {
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    };
    
    // Add session token if available
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }
    
    return headers;
  };

  /**
   * Make authenticated API request to admin endpoints
   * Memoized to prevent recreation on every render
   */
  const adminFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/${endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add session token if available
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [sessionToken]); // Only recreate if sessionToken changes

  return {
    admin,
    isAuthenticated,
    can,
    getAuthHeaders,
    adminFetch,
    role: admin?.role,
    permissions: admin?.permissions,
  };
}
