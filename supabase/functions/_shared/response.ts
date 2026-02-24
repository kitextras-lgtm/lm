/**
 * Shared JSON response helpers for all edge functions.
 *
 * Usage:
 *   import { json, jsonError } from '../_shared/response.ts';
 */

import { corsHeaders } from './cors.ts';

/** Return a JSON response with CORS headers. */
export function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Shorthand for error responses. */
export function jsonError(message: string, status = 400): Response {
  return json({ success: false, message }, status);
}
