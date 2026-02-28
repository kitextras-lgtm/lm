-- Sync Opportunities table
-- Admins create opportunities and assign them to specific users or all users.
-- Users see only opportunities assigned to them (via assigned_user_ids array) or to everyone (assign_to = 'all').

create table if not exists sync_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null default '',
  category text not null default 'Film & TV'
    check (category in ('Film & TV', 'Advertising', 'Games', 'Streaming', 'Trailers')),
  status text not null default 'Open'
    check (status in ('Open', 'Closing Soon', 'Featured')),
  budget text not null default '',
  deadline text not null default 'Rolling',
  description text not null default '',
  genres text[] not null default '{}',
  moods text[] not null default '{}',
  -- assign_to = 'all'  → visible to every artist
  -- assign_to = 'specific' → visible only to users in assigned_user_ids
  assign_to text not null default 'all'
    check (assign_to in ('all', 'specific')),
  assigned_user_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No RLS — admin-managed table (same pattern as campaigns)
alter table sync_opportunities disable row level security;

-- Index for fast user-specific lookups
create index if not exists idx_sync_opportunities_assign_to
  on sync_opportunities (assign_to);

create index if not exists idx_sync_opportunities_assigned_user_ids
  on sync_opportunities using gin (assigned_user_ids);
