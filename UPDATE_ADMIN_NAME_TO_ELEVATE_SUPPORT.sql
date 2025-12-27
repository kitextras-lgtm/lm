-- ============================================================================
-- UPDATE ADMIN PROFILE NAME TO "Team Elevate"
-- ============================================================================
-- This updates the admin profile name to "Team Elevate" for the chat system
-- ============================================================================

-- Update admin profile name to "Team Elevate"
UPDATE profiles
SET name = 'Team Elevate'
WHERE is_admin = true;

-- Verify the update
SELECT 
  p.id, 
  p.name, 
  p.is_admin, 
  a.email as admin_email
FROM profiles p
LEFT JOIN admins a ON p.id = a.id
WHERE p.is_admin = true;


