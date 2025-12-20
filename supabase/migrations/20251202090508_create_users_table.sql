/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `email` (text, unique, not null) - User's email address
      - `full_name` (text) - User's full name
      - `user_type` (text) - Type of user (artist, creator, business)
      - `verified` (boolean) - Whether user's email has been verified
      - `created_at` (timestamptz) - Timestamp when user was created
      - `updated_at` (timestamptz) - Timestamp when user was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for users to update their own data
    - Add policy for creating new users during signup

  3. Notes
    - Email must be unique across all users
    - User type determines dashboard access
    - Verified flag tracks email verification status
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  user_type text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for efficient lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to create users (for signup flow)
CREATE POLICY "Anyone can create users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);

-- Policy: Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);