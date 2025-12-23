-- Fix blob URLs in users table by replacing them with correct Supabase Storage URLs

-- First, check which users have blob URLs:
SELECT id, email, profile_picture_url 
FROM users 
WHERE profile_picture_url LIKE 'blob:%';

-- Fix specific user (98fd369c-80db-4743-94d0-8e26e04cd61d):
UPDATE users 
SET profile_picture_url = 'https://hlcpoqxzqgbghsadouef.supabase.co/storage/v1/object/public/avatars/profile-pictures/98fd369c-80db-4743-94d0-8e26e04cd61d/1766374976442.jpg'
WHERE id = '98fd369c-80db-4743-94d0-8e26e04cd61d' 
  AND profile_picture_url LIKE 'blob:%';

-- For other users, you'll need to:
-- 1. Go to Supabase Storage → avatars bucket
-- 2. Find the files in profile-pictures/{userId}/ folders
-- 3. Get the public URL for each file
-- 4. Update using the pattern below:

-- UPDATE users 
-- SET profile_picture_url = 'https://hlcpoqxzqgbghsadouef.supabase.co/storage/v1/object/public/avatars/profile-pictures/{userId}/{filename}'
-- WHERE id = '{userId}' AND profile_picture_url LIKE 'blob:%';

-- Or, to clear all remaining blob URLs (users will need to re-upload):
-- UPDATE users 
-- SET profile_picture_url = NULL 
-- WHERE profile_picture_url LIKE 'blob:%';

