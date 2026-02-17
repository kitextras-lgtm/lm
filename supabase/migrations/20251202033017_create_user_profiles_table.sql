/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - References auth.users
      - `user_type` (text) - Type of user: 'artist', 'creator', or 'business'
      - `created_at` (timestamptz) - When the profile was created
      - `updated_at` (timestamptz) - When the profile was last updated

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for authenticated users to read their own profile
    - Add policy for authenticated users to insert their own profile
    - Add policy for authenticated users to update their own profile
    
  3. Important Notes
    - This table stores the user type selection made during onboarding
    - The user_type field determines which dashboard the user sees
    - Each user can only have one profile linked to their auth.users id
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('artist', 'creator', 'business')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);