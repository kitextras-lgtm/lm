/**
 * Shared CORS configuration for all edge functions.
 *
 * Supports dynamic origin validation via the ALLOWED_ORIGIN env var.
 * If ALLOWED_ORIGIN is set, only that origin is allowed.
 * If unset, falls back to wildcard "*" (development only).
 *
 * Usage:
 *   import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
 */

/** Build CORS headers with dynamic origin validation. */
export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';
  const origin = req.headers.get('Origin') || '';
  const resolvedOrigin =
    allowedOrigin === '*' ? '*' : origin === allowedOrigin ? origin : allowedOrigin;

  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Client-Info, Apikey, X-Session-Token',
  };
}

/** Return early for OPTIONS preflight requests. */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: getCorsHeaders(req) });
  }
  return null;
}
