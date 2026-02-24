-- Rate limiting table for OTP send flow
-- Tracks per-email and per-IP attempt counts within sliding windows

CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  type text NOT NULL CHECK (type IN ('otp_email', 'otp_ip')),
  count integer NOT NULL DEFAULT 1,
  window_end timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_type_window
  ON rate_limits (identifier, type, window_end);

-- Only the service role (Edge Functions) should read/write this table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated access — only service role bypasses RLS
CREATE POLICY "No direct access to rate_limits" ON rate_limits
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);
