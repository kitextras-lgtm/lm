/*
  # Add Onboarding Fields to Users Table

  1. Changes
    - Add `first_name` column to users table
    - Add `last_name` column to users table
    - Add `username` column to users table (unique)
    - Add `location` column to users table
    - Add `primary_language` column to users table
    - Add `profile_picture_url` column to users table
    - Add `profile_completed` column to users table

  2. Security
    - Username must be unique across all users
    - All existing RLS policies remain unchanged
*/

-- Add new columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS primary_language text,
  ADD COLUMN IF NOT EXISTS profile_picture_url text,
  ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Add index for efficient username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add constraint to ensure username is lowercase and alphanumeric
ALTER TABLE users 
  ADD CONSTRAINT users_username_format 
  CHECK (username ~ '^[a-z0-9_]+$');


