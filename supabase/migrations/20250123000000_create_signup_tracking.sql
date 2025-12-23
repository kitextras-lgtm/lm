/*
  # Create Signup Tracking Table

  1. New Tables
    - `signup_tracking`
      - `id` (uuid, primary key) - Unique identifier for each tracking record
      - `ip_address` (inet) - IP address of the signup attempt
      - `user_agent` (text) - User agent string for device fingerprinting
      - `email` (text) - Email address used for signup
      - `user_id` (uuid, foreign key to users.id) - Reference to the created user
      - `created_at` (timestamptz) - Timestamp when signup was completed

  2. Security
    - Enable RLS on `signup_tracking` table
    - Deny all public access (only service role can insert/read)
    - This table is for spam prevention only

  3. Notes
    - Tracks signups by IP address and device (user-agent)
    - Used to prevent multiple signups from same device/IP
    - IP address stored as INET type for efficient queries
*/

CREATE TABLE IF NOT EXISTS signup_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  user_agent text,
  email text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_signup_tracking_ip ON signup_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_signup_tracking_user_id ON signup_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_tracking_created_at ON signup_tracking(created_at);

-- Composite index for checking existing signups by IP
CREATE INDEX IF NOT EXISTS idx_signup_tracking_ip_created ON signup_tracking(ip_address, created_at);

-- Enable Row Level Security
ALTER TABLE signup_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Deny all public access (only service role can access)
CREATE POLICY "Deny all public access"
  ON signup_tracking
  FOR ALL
  USING (false)
  WITH CHECK (false);
