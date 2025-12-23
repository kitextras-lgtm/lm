import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface AdminRole {
  id: string;
  name: string;
  displayName: string;
}

interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: Record<string, string[]>; // {"resource": ["action1", "action2"]}
}

interface AdminAuthContextType {
  admin: Admin | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; message?: string; requiresTotp?: boolean }>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  hasPermission: (resource: string, action: string) => boolean;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Store session token in memory only (using a ref that persists across re-renders)
// NOTE: On page reload, session will be lost (more secure for admin accounts)
// In production, consider using httpOnly cookies for session tokens

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  // Initialize token ref on mount
  useEffect(() => {
    // Session token stored in memory only (ref)
    // On page reload, user must log in again (security best practice for admin)
    setIsLoading(false);
  }, []);

  // Verify session with backend
  const verifySession = async (): Promise<boolean> => {
    try {
      const token = tokenRef.current || sessionToken;
      
      if (!token) {
        setIsLoading(false);
        return false;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-verify-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'X-Session-Token': token, // Pass session token in custom header
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.admin) {
        setAdmin(data.admin);
        tokenRef.current = token; // Update ref
        setIsLoading(false);
        return true;
      } else {
        setAdmin(null);
        setSessionToken(null);
        tokenRef.current = null;
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Session verification error:', error);
      setAdmin(null);
      setSessionToken(null);
      tokenRef.current = null;
      setIsLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string, totpCode?: string): Promise<{ success: boolean; message?: string; requiresTotp?: boolean }> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, password, totpCode }),
      });

      const data = await response.json();

      if (data.success && data.sessionToken && data.admin) {
        // Store token in memory only (ref + state)
        tokenRef.current = data.sessionToken;
        setSessionToken(data.sessionToken);
        setAdmin(data.admin);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed',
          requiresTotp: data.requiresTotp || false
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (sessionToken) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        await fetch(`${supabaseUrl}/functions/v1/admin-logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'X-Session-Token': sessionToken, // Pass session token in custom header
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      setSessionToken(null);
      tokenRef.current = null;
    }
  };

  // Check if admin has permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!admin || !admin.permissions) return false;
    
    const resourcePermissions = admin.permissions[resource];
    if (!resourcePermissions || !Array.isArray(resourcePermissions)) return false;
    
    return resourcePermissions.includes(action);
  };

  // Refresh session
  const refreshSession = async (): Promise<void> => {
    await verifySession();
  };

  // Expose sessionToken from state (ref is for internal use only)
  const value: AdminAuthContextType = {
    admin,
    sessionToken: tokenRef.current || sessionToken, // Return current token from ref or state
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    verifySession,
    hasPermission,
    refreshSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
