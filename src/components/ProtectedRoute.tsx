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

        // 2. Fallback: verifiedUserId from OTP flow — but VERIFY it exists in DB
        const verifiedUserId = localStorage.getItem('verifiedUserId');
        if (verifiedUserId) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('id', verifiedUserId)
            .maybeSingle();

          if (userData?.id) {
            setIsAuthenticated(true);
          } else {
            // Invalid/stale userId — clear it
            localStorage.removeItem('verifiedUserId');
            setIsAuthenticated(false);
          }
          setIsLoading(false);
          return;
        }

        // 3. Fallback: verifiedEmail — verify user exists in DB
        const verifiedEmail = localStorage.getItem('verifiedEmail');
        if (verifiedEmail) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', verifiedEmail)
            .maybeSingle();

          if (userData?.id) {
            localStorage.setItem('verifiedUserId', userData.id);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
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

