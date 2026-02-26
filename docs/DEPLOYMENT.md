# Deployment Guide

This guide will help you deploy the Elevate application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project URL and anon key
- Git repository (GitHub, GitLab, or Bitbucket) with your code

## Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub/GitLab/Bitbucket account

2. **Import Your Project**
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**
   - In the "Environment Variables" section, add:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - You can find these in your Supabase project settings:
     - Go to Settings → API
     - Copy "Project URL" → use as `VITE_SUPABASE_URL`
     - Copy "anon public" key → use as `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "/Users/diel/Documents/elevate (c)"
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Production Domain (Optional)

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Step 4: Run Database Migration

Before using the chat feature in production, make sure to run the migration:

```sql
-- Run this in Supabase SQL Editor:
-- supabase/migrations/20251223020000_add_last_message_sender_id.sql
```

This adds the `last_message_sender_id` column to the conversations table.

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Test key features:
   - User registration/login
   - Dashboard access
   - Chat functionality
   - Admin dashboard (if applicable)

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → anon public |

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure environment variables are set correctly
- Check build logs in Vercel Dashboard

### Runtime Errors
- Verify environment variables are set in Vercel
- Check browser console for errors
- Ensure Supabase project is accessible

### Chat Not Working
- Verify database migrations are run
- Check Supabase RLS policies
- Ensure realtime is enabled in Supabase

## Continuous Deployment

Once connected to Vercel, every push to your main branch will automatically trigger a new deployment. You can disable this in project settings if needed.

## Support

For issues:
- Check Vercel logs in the Dashboard
- Review Supabase logs
- Check browser console for client-side errors

