-- Allow admin users to read all release drafts (for Applications section)
DROP POLICY IF EXISTS "Admins can read all release drafts" ON release_drafts;
CREATE POLICY "Admins can read all release drafts"
  ON release_drafts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Allow admin users to update release draft status (accept/decline)
DROP POLICY IF EXISTS "Admins can update release draft status" ON release_drafts;
CREATE POLICY "Admins can update release draft status"
  ON release_drafts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );
