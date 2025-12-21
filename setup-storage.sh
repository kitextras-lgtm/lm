#!/bin/bash

# Setup Supabase Storage Bucket for Profile Pictures
# This script helps you set up the storage bucket via Supabase Dashboard

echo "📦 Setting up Supabase Storage for Profile Pictures"
echo "=================================================="
echo ""

echo "📋 Manual Steps Required:"
echo ""
echo "1. Go to Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/hlcpoqxzqgbghsadouef/storage/buckets"
echo ""
echo "2. Click 'New bucket'"
echo ""
echo "3. Configure the bucket:"
echo "   - Name: avatars"
echo "   - Public bucket: YES (checked)"
echo "   - File size limit: 5 MB (or your preference)"
echo "   - Allowed MIME types: image/* (optional)"
echo ""
echo "4. Click 'Create bucket'"
echo ""
echo "5. After creating the bucket, go to SQL Editor and run:"
echo "   setup-storage.sql"
echo ""
echo "   Or copy the SQL from setup-storage.sql file"
echo ""
echo "✅ Once done, profile pictures will be uploaded to Supabase Storage!"
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null || command -v npx &> /dev/null; then
  echo ""
  echo "💡 Tip: You can also use Supabase CLI to create buckets programmatically"
  echo "   (Requires Supabase CLI and authentication)"
fi
