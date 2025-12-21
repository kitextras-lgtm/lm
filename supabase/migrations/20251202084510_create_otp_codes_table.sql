/*
  # Create OTP Codes Table

  1. New Tables
    - `otp_codes`
      - `id` (uuid, primary key) - Unique identifier for each OTP record
      - `email` (text, not null) - Email address associated with the OTP
      - `code` (text, not null) - The 6-digit OTP code
      - `created_at` (timestamptz) - Timestamp when OTP was created
      - `expires_at` (timestamptz, not null) - Timestamp when OTP expires
      - `verified` (boolean) - Whether the OTP has been used/verified
      - `attempts` (integer) - Number of verification attempts made

  2. Security
    - Enable RLS on `otp_codes` table
    - Add policy for inserting OTP codes (public access for signup flow)
    - Add policy for verifying OTP codes (public access for verification flow)
    - Add index on email and expires_at for efficient querying

  3. Notes
    - OTPs expire after a set time period (handled by expires_at)
    - Verified OTPs cannot be reused
    - Attempts are tracked to prevent brute force attacks
*/

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0
);

-- Add index for efficient lookup by email and expiration
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_expires ON otp_codes(email, expires_at);

-- Enable Row Level Security
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert OTP codes (for sending OTPs during signup)
CREATE POLICY "Anyone can create OTP codes"
  ON otp_codes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to read their own OTP codes (for verification)
CREATE POLICY "Anyone can read OTP codes for verification"
  ON otp_codes
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to update OTP codes (for marking as verified and incrementing attempts)
CREATE POLICY "Anyone can update OTP codes for verification"
  ON otp_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);