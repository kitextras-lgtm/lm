-- Allow artist_account as an application type
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_application_type_check;
ALTER TABLE applications ADD CONSTRAINT applications_application_type_check
  CHECK (application_type IN ('freelancer_onboarding', 'creator_verification', 'artist_account'));

-- Add decline_reason column for admin to provide reason when denying
ALTER TABLE applications ADD COLUMN IF NOT EXISTS decline_reason text;
