-- Tighten RLS policies for feedback and announcements INSERT
-- Previously: anyone (including anon) could insert
-- Now: only authenticated users can insert feedback (with validation)
--      announcements remain insertable by anon (admin dashboard uses anon key)
--      but add content validation constraints

-- ─── FEEDBACK ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;

CREATE POLICY "Authenticated users can insert feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id IS NOT NULL AND
    COALESCE(TRIM(content), '') != ''
  );

-- Keep existing SELECT policy for admins (anon + authenticated can view)
-- No change needed there

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
-- NOTE: The admin dashboard uses the anon key (no Supabase Auth session),
-- so we cannot restrict to `authenticated` role without breaking admin writes.
-- Instead, we add a content validation check to prevent empty/junk inserts.

DROP POLICY IF EXISTS "Anyone can insert announcements" ON announcements;

CREATE POLICY "Validated announcement inserts" ON announcements
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    title IS NOT NULL AND
    COALESCE(TRIM(title), '') != '' AND
    content IS NOT NULL AND
    COALESCE(TRIM(content), '') != ''
  );
