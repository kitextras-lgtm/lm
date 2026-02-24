-- Fix applications table: user_id FK referenced auth.users which blocks custom-auth users.
-- Drop the FK constraint and re-add it referencing public.users instead.

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;

ALTER TABLE applications
  ADD CONSTRAINT applications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
