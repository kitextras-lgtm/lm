#!/bin/bash

# Deploy Supabase Edge Functions
# This script will deploy the send-otp and verify-otp functions

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# Check if logged in
if ! npx supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in to Supabase. Please login first:"
  echo "   npx supabase login"
  echo ""
  echo "Then run this script again."
  exit 1
fi

# Link to project
echo "📎 Linking to project..."
npx supabase link --project-ref hlcpoqxzqgbghsadouef

if [ $? -ne 0 ]; then
  echo "❌ Failed to link project. Make sure you're logged in."
  exit 1
fi

echo ""
echo "📦 Deploying send-otp function..."
npx supabase functions deploy send-otp

if [ $? -ne 0 ]; then
  echo "❌ Failed to deploy send-otp"
  exit 1
fi

echo ""
echo "📦 Deploying verify-otp function..."
npx supabase functions deploy verify-otp

if [ $? -ne 0 ]; then
  echo "❌ Failed to deploy verify-otp"
  exit 1
fi

echo ""
echo "📦 Deploying save-profile function..."
npx supabase functions deploy save-profile

if [ $? -ne 0 ]; then
  echo "❌ Failed to deploy save-profile"
  exit 1
fi

echo ""
echo "📦 Deploying get-profile function..."
npx supabase functions deploy get-profile

if [ $? -ne 0 ]; then
  echo "❌ Failed to deploy get-profile"
  exit 1
fi

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Verify FROM_EMAIL secret is set in Supabase Dashboard"
echo "   2. Test the signup flow"
