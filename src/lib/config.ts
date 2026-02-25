/**
 * Centralized configuration for the application
 *
 * All other files should import from here instead of accessing import.meta.env directly.
 *
 * To update credentials:
 * 1. Copy .env.example to .env (if you haven't already)
 * 2. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 3. Restart the dev server
 */

// Supabase Configuration — no hardcoded fallbacks (security requirement)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate configuration on load — fail explicitly if env vars are missing
if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
  throw new Error('VITE_SUPABASE_URL is required. Set it in your .env file.');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined') {
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Set it in your .env file.');
}

// ASR (Speech-to-Text) Service
export const ASR_SERVICE_URL = import.meta.env.VITE_ASR_SERVICE_URL || 'http://localhost:8000';
