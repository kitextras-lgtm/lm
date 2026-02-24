#!/bin/bash

# Resend API Setup Script for Supabase Edge Functions
# This script helps you set up Resend API keys in Supabase

echo "🚀 Elevate OTP Email Setup"
echo "=========================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "   Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Get Resend API Key
echo "📧 Resend API Configuration"
echo "---------------------------"
read -p "Enter your Resend API Key (starts with 're_'): " RESEND_KEY

if [ -z "$RESEND_KEY" ]; then
    echo "❌ Resend API Key is required"
    exit 1
fi

# Get From Email
read -p "Enter your FROM email (or press Enter for 'delivered@resend.dev'): " FROM_EMAIL
FROM_EMAIL=${FROM_EMAIL:-delivered@resend.dev}

echo ""
echo "📝 Setting up secrets in Supabase..."
echo ""

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please login to Supabase first:"
    supabase login
    echo ""
fi

# Link to project
echo "🔗 Linking to project..."
supabase link --project-ref hlcpoqxzqgbghsadouef

echo ""
echo "🔐 Setting secrets..."
echo ""

# Set secrets using Supabase CLI
# Note: Supabase CLI might use different commands, so we'll provide manual instructions too
echo "Setting RESEND_API_KEY..."
supabase secrets set RESEND_API_KEY="$RESEND_KEY" 2>/dev/null || {
    echo "⚠️  Could not set secret via CLI. Please set it manually:"
    echo "   1. Go to: https://supabase.com/dashboard/project/hlcpoqxzqgbghsadouef/settings/functions"
    echo "   2. Add secret: RESEND_API_KEY = $RESEND_KEY"
}

echo "Setting FROM_EMAIL..."
supabase secrets set FROM_EMAIL="$FROM_EMAIL" 2>/dev/null || {
    echo "⚠️  Could not set secret via CLI. Please set it manually:"
    echo "   1. Go to: https://supabase.com/dashboard/project/hlcpoqxzqgbghsadouef/settings/functions"
    echo "   2. Add secret: FROM_EMAIL = $FROM_EMAIL"
}

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify secrets are set in Supabase Dashboard"
echo "   2. Deploy Edge Functions:"
echo "      supabase functions deploy send-otp"
echo "      supabase functions deploy verify-otp"
echo "   3. Test by signing up with your email"
echo ""



