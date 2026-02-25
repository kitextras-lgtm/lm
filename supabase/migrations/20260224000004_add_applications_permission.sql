-- Add 'applications' resource to admin role permissions so admins can approve/deny applications.
-- The super_admin and content_moderator roles were missing this permission key.

UPDATE admin_roles
SET default_permissions = default_permissions || '{"applications": ["view", "approve", "deny"]}'::jsonb
WHERE name IN ('super_admin', 'content_moderator');
