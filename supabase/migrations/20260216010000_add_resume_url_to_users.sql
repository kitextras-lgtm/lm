/*
  # Add resume_url to users table
  
  For freelancer accounts only - stores the uploaded resume file path
  so it persists across sessions and navigation.
*/

-- Add resume_url column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS resume_url text;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_resume_url ON users(resume_url) WHERE resume_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.resume_url IS 'File path to uploaded resume (freelancer accounts only)';
