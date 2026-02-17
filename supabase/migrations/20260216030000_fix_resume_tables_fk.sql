/*
  # Fix foreign keys on resume/draft tables
  
  The resumes and profile_drafts tables reference auth.users(id),
  but the app uses the public users table. Change FK to reference
  public users table instead, and also allow the extraction_method
  check to accept OCR_FALLBACK and TEXT methods.
*/

-- Fix resumes.user_id FK: auth.users -> public.users
DO $$
BEGIN
  -- Drop existing FK if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'resumes_user_id_fkey' AND table_name = 'resumes'
  ) THEN
    ALTER TABLE resumes DROP CONSTRAINT resumes_user_id_fkey;
  END IF;

  -- Add new FK to public.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'resumes_user_id_users_fkey' AND table_name = 'resumes'
  ) THEN
    ALTER TABLE resumes
      ADD CONSTRAINT resumes_user_id_users_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix profile_drafts.user_id FK: auth.users -> public.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profile_drafts_user_id_fkey' AND table_name = 'profile_drafts'
  ) THEN
    ALTER TABLE profile_drafts DROP CONSTRAINT profile_drafts_user_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profile_drafts_user_id_users_fkey' AND table_name = 'profile_drafts'
  ) THEN
    ALTER TABLE profile_drafts
      ADD CONSTRAINT profile_drafts_user_id_users_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix extraction_method check to allow OCR_FALLBACK and TEXT
DO $$
BEGIN
  -- Drop existing check constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'resume_artifacts_extraction_method_check' AND table_name = 'resume_artifacts'
  ) THEN
    ALTER TABLE resume_artifacts DROP CONSTRAINT resume_artifacts_extraction_method_check;
  END IF;

  -- Add updated check
  ALTER TABLE resume_artifacts
    ADD CONSTRAINT resume_artifacts_extraction_method_check
    CHECK (extraction_method IN ('PDF_TEXT','OCR','OCR_FALLBACK','DOCX_PARSE','TEXT'));
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
