/**
 * Centralized configuration for the application
 * 
 * This file provides a single source of truth for all configuration values.
 * All other files should import from here instead of accessing import.meta.env directly.
 * 
 * To update Supabase credentials:
 * 1. Update the .env file in the project root
 * 2. Restart the dev server
 * 
 * If .env is not set, fallback values are used (for development only)
 */

// Supabase Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hlcpoqxzqgbghsadouef.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsY3BvcXh6cWdiZ2hzYWRvdWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzI2MTUsImV4cCI6MjA4MTcwODYxNX0.Qhbzj0g5FbpW0wgtGsJBF2AV0HqL-9X2S2nGL64KCYA';

// Validate configuration on load
if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
  console.error('❌ VITE_SUPABASE_URL is not set! Check your .env file.');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined') {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set! Check your .env file.');
}

// ASR (Speech-to-Text) Service
export const ASR_SERVICE_URL = import.meta.env.VITE_ASR_SERVICE_URL || 'http://localhost:8000';

// Log config status in development
if (import.meta.env.DEV) {
  console.log('🔧 Config loaded:', {
    supabaseUrl: SUPABASE_URL?.substring(0, 30) + '...',
    hasAnonKey: !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10,
    asrServiceUrl: ASR_SERVICE_URL,
  });
}

