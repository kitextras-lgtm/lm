/*
  # Create Referral Codes System

  1. New Tables
    - `referral_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `code` (text, unique) - The user's unique referral code
      - `total_uses` (integer) - Number of times code has been used
      - `total_earnings` (numeric) - Total earnings from referrals
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `referral_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - User who applied the code
      - `referral_code_id` (uuid, foreign key to referral_codes)
      - `applied_at` (timestamptz)
      - Constraint: User can only apply one referral code

  2. Security
    - Enable RLS on both tables
    - Users can read their own referral code data
    - Users can create referral applications
    - Users can view their applied referral code

  3. Functions
    - Function to generate unique referral code
    - Trigger to auto-create referral code on user profile creation
*/

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text UNIQUE NOT NULL,
  total_uses integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral_applications table
CREATE TABLE IF NOT EXISTS referral_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referral_code_id uuid REFERENCES referral_codes(id) ON DELETE CASCADE NOT NULL,
  applied_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
DROP POLICY IF EXISTS "Users can view their own referral code" ON referral_codes;
CREATE POLICY "Users can view their own referral code"
  ON referral_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view referral codes by code" ON referral_codes;
CREATE POLICY "Users can view referral codes by code"
  ON referral_codes
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own referral code" ON referral_codes;
CREATE POLICY "Users can insert their own referral code"
  ON referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own referral code stats" ON referral_codes;
CREATE POLICY "Users can update their own referral code stats"
  ON referral_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referral_applications
DROP POLICY IF EXISTS "Users can view their own referral application" ON referral_applications;
CREATE POLICY "Users can view their own referral application"
  ON referral_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own referral application" ON referral_applications;
CREATE POLICY "Users can insert their own referral application"
  ON referral_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  characters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  code_length integer := 8;
  i integer;
  code_exists boolean := true;
BEGIN
  WHILE code_exists LOOP
    code := '';
    FOR i IN 1..code_length LOOP
      code := code || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE referral_codes.code = code) INTO code_exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle referral code application
CREATE OR REPLACE FUNCTION apply_referral_code(p_code text)
RETURNS json AS $$
DECLARE
  v_referral_code_id uuid;
  v_user_id uuid;
  v_already_applied boolean;
  v_result json;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user already applied a code
  SELECT EXISTS(
    SELECT 1 FROM referral_applications WHERE user_id = v_user_id
  ) INTO v_already_applied;
  
  IF v_already_applied THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You have already applied a referral code'
    );
  END IF;
  
  -- Find the referral code
  SELECT id INTO v_referral_code_id
  FROM referral_codes
  WHERE code = p_code;
  
  IF v_referral_code_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid referral code'
    );
  END IF;
  
  -- Check if user is trying to use their own code
  IF EXISTS(SELECT 1 FROM referral_codes WHERE id = v_referral_code_id AND user_id = v_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You cannot use your own referral code'
    );
  END IF;
  
  -- Apply the code
  INSERT INTO referral_applications (user_id, referral_code_id)
  VALUES (v_user_id, v_referral_code_id);
  
  -- Update referral code stats
  UPDATE referral_codes
  SET total_uses = total_uses + 1,
      updated_at = now()
  WHERE id = v_referral_code_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Referral code applied successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_applications_user_id ON referral_applications(user_id);
