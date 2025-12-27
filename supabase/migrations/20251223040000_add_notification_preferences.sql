-- Add notification preferences to users table
-- These columns track user email notification preferences

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_new_features boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_platform_updates boolean DEFAULT true;

-- Add comments
COMMENT ON COLUMN users.email_new_features IS 'User preference for receiving emails about new platform features';
COMMENT ON COLUMN users.email_platform_updates IS 'User preference for receiving emails about platform improvements/updates';

-- Create indexes for efficient queries when sending bulk emails
CREATE INDEX IF NOT EXISTS idx_users_email_new_features ON users(email_new_features) WHERE email_new_features = true;
CREATE INDEX IF NOT EXISTS idx_users_email_platform_updates ON users(email_platform_updates) WHERE email_platform_updates = true;

