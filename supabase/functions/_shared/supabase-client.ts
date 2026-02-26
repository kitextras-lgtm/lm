/**
 * Shared Supabase client factory for all edge functions.
 *
 * Usage:
 *   import { createServiceClient } from '../_shared/supabase-client.ts';
 *   const supabase = createServiceClient();
 */

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

/** Create a Supabase client authenticated with the service-role key. */
export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

/** Return the raw env values (for direct REST calls to Auth API, etc.). */
export function getSupabaseEnv(): { url: string; serviceRoleKey: string } {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return { url, serviceRoleKey };
}
