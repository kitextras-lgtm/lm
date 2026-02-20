-- Add user_type to profiles table so admin chat can filter/display account types
-- profiles table has open RLS (readable by anyone), unlike users/user_profiles which require auth.uid()

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type text;

-- Backfill from user_profiles (same id)
UPDATE profiles p
SET user_type = up.user_type
FROM user_profiles up
WHERE up.id = p.id
  AND up.user_type IS NOT NULL;

-- Also backfill from users table as fallback
UPDATE profiles p
SET user_type = u.user_type
FROM users u
WHERE u.id = p.id
  AND u.user_type IS NOT NULL
  AND p.user_type IS NULL;

-- Trigger: keep profiles.user_type in sync when user_profiles.user_type changes
CREATE OR REPLACE FUNCTION sync_user_type_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET user_type = NEW.user_type
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to sync user_type to profile for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_type_on_profile_change ON user_profiles;
CREATE TRIGGER sync_user_type_on_profile_change
  AFTER INSERT OR UPDATE OF user_type ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_type_to_profile();

-- Also sync from users table when user_type changes there
CREATE OR REPLACE FUNCTION sync_user_type_from_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET user_type = NEW.user_type
  WHERE id = NEW.id
    AND NEW.user_type IS NOT NULL;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to sync user_type from users for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_type_from_users_trigger ON users;
CREATE TRIGGER sync_user_type_from_users_trigger
  AFTER INSERT OR UPDATE OF user_type ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_type_from_users();
