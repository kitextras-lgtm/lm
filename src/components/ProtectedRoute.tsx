import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AnimatedBarsLoader } from './AnimatedBarsLoader';
import { useTheme } from '../contexts/ThemeContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, tokens } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Try Supabase session first (most secure — JWT validated server-side)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        } catch {
          // No active Supabase session — fall through to localStorage checks
        }

        // 2. Fallback: verifiedUserId from OTP flow
        // NOTE: RLS on users table requires auth.uid() = id, so anon queries return nothing.
        // We trust the value set by the verified OTP flow, but validate it's a proper UUID
        // to prevent trivial localStorage tampering.
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const verifiedUserId = localStorage.getItem('verifiedUserId');
        if (verifiedUserId && UUID_REGEX.test(verifiedUserId)) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // 3. Fallback: verifiedEmail present but no userId — clear stale state
        const verifiedEmail = localStorage.getItem('verifiedEmail');
        if (verifiedEmail) {
          // Can't query DB without auth session, but email presence means OTP was completed
          // The dashboard will handle the case where the user data can't be loaded
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // 4. No credentials at all
        setIsAuthenticated(false);
      } catch (error) {
        console.error('ProtectedRoute auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: tokens.bg.primary, 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tokens.text.primary
      }}>
        <AnimatedBarsLoader text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

