/**
 * Shared JSON response helpers for all edge functions.
 *
 * Usage:
 *   import { json, jsonError } from '../_shared/response.ts';
 *
 * Pass `req` for dynamic CORS origin validation (recommended in production).
 * Without `req`, falls back to wildcard "*".
 */

import { getCorsHeaders } from './cors.ts';

/** Return a JSON response with CORS headers. */
export function json(
  body: Record<string, unknown>,
  status = 200,
  req?: Request,
): Response {
  const headers = req
    ? getCorsHeaders(req)
    : getCorsHeaders(new Request('http://localhost'));
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

/** Shorthand for error responses. */
export function jsonError(message: string, status = 400, req?: Request): Response {
  return json({ success: false, message }, status, req);
}
