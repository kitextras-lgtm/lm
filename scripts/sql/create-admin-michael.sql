-- SQL to create your first super admin
-- Replace YOUR_BCRYPT_HASH_HERE with the hash you copied from bcrypt-generator.com

INSERT INTO admins (email, password_hash, role_id, full_name, totp_enabled)
SELECT 
    'michael@sayelevate.com',
    'YOUR_BCRYPT_HASH_HERE',  -- Paste your bcrypt hash here (from rounds 12)
    id,
    'Super Administrator',
    false
FROM admin_roles
WHERE name = 'super_admin'
RETURNING id, email, full_name;

-- After running, verify the admin was created:
-- SELECT id, email, full_name, is_active FROM admins WHERE email = 'michael@sayelevate.com';
