/*
  # Update OTP Codes RLS Policies

  1. Security Changes
    - Remove overly permissive policies that allow public access
    - Since Edge Functions use service role key, they bypass RLS
    - Lock down the table so only service role can access it
  
  2. Changes
    - Drop all existing policies on otp_codes table
    - No new policies needed since service role bypasses RLS
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create OTP codes" ON otp_codes;
DROP POLICY IF EXISTS "Anyone can read OTP codes for verification" ON otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes for verification" ON otp_codes;

-- RLS is still enabled, but no policies means only service role can access
-- This is secure because only our Edge Functions (using service role key) need access