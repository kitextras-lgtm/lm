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
        // Check localStorage first (faster) - this works during onboarding
        const verifiedUserId = localStorage.getItem('verifiedUserId');
        const verifiedEmail = localStorage.getItem('verifiedEmail');
        
        console.log('ProtectedRoute - Checking auth:', {
          verifiedUserId: verifiedUserId ? verifiedUserId.substring(0, 8) + '...' : null,
          verifiedEmail: verifiedEmail ? verifiedEmail.substring(0, 10) + '...' : null
        });
        
        if (verifiedUserId) {
          // User has verifiedUserId from OTP - allow access (even without session)
          console.log('✅ ProtectedRoute - User authenticated via localStorage');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        if (verifiedEmail) {
          // Try to verify with Supabase auth
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log('✅ ProtectedRoute - User authenticated via Supabase session');
            setIsAuthenticated(true);
          } else {
            // Check if user exists in database by email
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .eq('email', verifiedEmail)
              .maybeSingle();
            
            if (userData?.id) {
              // Store userId for future use
              localStorage.setItem('verifiedUserId', userData.id);
              console.log('✅ ProtectedRoute - Found user by email, authenticated');
              setIsAuthenticated(true);
            } else {
              console.warn('⚠️ ProtectedRoute - No user found, not authenticated');
              setIsAuthenticated(false);
            }
          }
        } else {
          // Check Supabase session as fallback
          const { data: { session } } = await supabase.auth.getSession();
          console.log('ProtectedRoute - Session check:', !!session);
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('❌ ProtectedRoute - Auth check error:', error);
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

