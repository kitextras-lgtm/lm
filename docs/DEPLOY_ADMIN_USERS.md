# Deploy Admin Users Edge Function

The `admin-users` Edge Function needs to be deployed for the Users section to work in the Admin Dashboard.

## Quick Deploy

### Option 1: Using Supabase CLI

```bash
cd /Users/diel/Documents/elevate\ \(c\)
supabase functions deploy admin-users
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. Name it: `admin-users`
5. Copy the contents of `supabase/functions/admin-users/index.ts`
6. Paste into the function editor
7. Click **Deploy**

## Verify Deployment

After deployment, check the browser console when clicking on "Users" in the admin dashboard. You should see:
- "Fetching users..." log
- Either a successful response or a clear error message

## Troubleshooting

If you see "Network error" or "Failed to load users":
1. Verify the Edge Function is deployed: Check Supabase Dashboard → Edge Functions
2. Check browser console for detailed error messages
3. Verify admin session is active (check if you're logged in)
4. Verify permissions: The admin role needs `users.view` permission

## Testing

After deployment, the Users section should:
- Show a loading spinner briefly
- Display a table with all users
- Show error message if something goes wrong (with retry button)
