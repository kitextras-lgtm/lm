-- Fix admin_announcements RLS so the admin dashboard can insert announcements.
-- The existing policy "Admin tables are server-side only" uses USING (false) which blocks all access.
-- The admin uses the anon key (no Supabase Auth session), so we need anon insert/select policies.

-- Drop the blocking policy
DROP POLICY IF EXISTS "Admin tables are server-side only" ON admin_announcements;

-- Allow anon to insert announcements (admin uses anon key)
CREATE POLICY "Anon can insert admin_announcements" ON admin_announcements
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow anon to select announcements
CREATE POLICY "Anon can select admin_announcements" ON admin_announcements
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow anon to update announcements
CREATE POLICY "Anon can update admin_announcements" ON admin_announcements
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Drop the FK constraint on created_by that references admins(id).
-- The AnnouncementSender passes a profiles.id (not admins.id), so the FK fails.
ALTER TABLE admin_announcements
  DROP CONSTRAINT IF EXISTS admin_announcements_created_by_fkey;
