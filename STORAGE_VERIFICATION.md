# Storage Setup Verification Checklist

## ✅ Bucket Configuration

- [ ] **Bucket Created**: `avatars` bucket exists in Supabase Storage
- [ ] **Public Access**: Bucket is set to public (or RLS policies allow public read)
- [ ] **File Size Limit**: Configured (recommended: 5 MB)
- [ ] **MIME Types**: Configured to allow `image/*` (optional but recommended)

## ✅ Storage Policies

Run the SQL from `setup-storage.sql` in Supabase Dashboard → SQL Editor:

- [ ] **Upload Policy**: Users can upload to their own folder
- [ ] **Update Policy**: Users can update their own files
- [ ] **Delete Policy**: Users can delete their own files
- [ ] **Public Read Policy**: Anyone can view profile pictures

## ✅ Code Integration

### File Structure
- [x] **Upload Path**: `profile-pictures/{userId}/{filename}`
- [x] **Bucket Name**: `avatars`
- [x] **Error Handling**: Gracefully handles missing bucket

### MakeProfilePage
- [x] Uploads profile picture to Supabase Storage
- [x] Gets public URL after upload
- [x] Saves URL to `user_profiles.profile_picture_url`
- [x] Handles upload errors gracefully

## 🧪 Testing

### Test Profile Picture Upload
1. [ ] Sign up or log in to your app
2. [ ] Go to "Make your profile" page
3. [ ] Upload a profile picture
4. [ ] Verify:
   - Image uploads successfully
   - No errors in browser console
   - Profile picture URL is saved to database
   - Image displays correctly

### Verify in Supabase Dashboard
1. [ ] Go to Storage → avatars bucket
2. [ ] Check that files are in `profile-pictures/{userId}/` structure
3. [ ] Verify files are accessible via public URL
4. [ ] Test that you can view the image in browser

### Test Security
1. [ ] Try uploading as one user
2. [ ] Verify files are in correct user folder
3. [ ] Verify other users cannot access/modify your files

## 🔧 Troubleshooting

### If uploads fail:
1. Check browser console for errors
2. Verify bucket name is exactly `avatars`
3. Verify policies are applied correctly
4. Check that user is authenticated
5. Verify bucket is public or RLS allows access

### If images don't display:
1. Check that public read policy is applied
2. Verify URL format is correct
3. Check browser network tab for 404 errors
4. Verify file was actually uploaded to storage

### Common Issues:
- **"Bucket not found"**: Bucket doesn't exist or name is wrong
- **"new row violates row-level security policy"**: Policies not set up correctly
- **"Permission denied"**: User not authenticated or policies too restrictive

## 📝 File Structure

```
avatars/
└── profile-pictures/
    ├── {user-id-1}/
    │   └── {timestamp}.{ext}
    ├── {user-id-2}/
    │   └── {timestamp}.{ext}
    └── ...
```

## ✅ Everything Looks Good!

If all checks pass, your storage setup is complete and ready to use!
