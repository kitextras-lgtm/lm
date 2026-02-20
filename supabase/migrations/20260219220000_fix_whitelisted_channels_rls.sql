-- Fix: whitelisted_channels is admin-managed platform config, not user data.
-- The admin system uses its own session (not Supabase auth), so auth.uid() is null.
-- Disable RLS so the anon-key client can read/write this table from the admin dashboard.
alter table whitelisted_channels disable row level security;
