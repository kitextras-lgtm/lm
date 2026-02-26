/**
 * Shared request-parsing helpers.
 *
 * Usage:
 *   import { getClientIp, getUserAgent } from '../_shared/request-helpers.ts';
 */

/** Extract the client IP from x-forwarded-for / x-real-ip headers. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

/** Extract the User-Agent string from the request. */
export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}
