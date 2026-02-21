-- Campaigns table (v2 — re-apply if first migration was recorded but not executed)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  rules text[],
  how_it_works text[],
  songs_to_use jsonb,
  language text not null default 'English',
  platforms text[] not null default '{}',
  pay_type text not null default 'Per view',
  payout text not null default '',
  ends_at timestamptz,
  assign_to text not null default 'all',
  assigned_user_ids uuid[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User campaign assignments
create table if not exists user_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null,
  assigned_at timestamptz not null default now(),
  unique(campaign_id, user_id)
);

-- No RLS — admin-managed
alter table campaigns disable row level security;
alter table user_campaigns disable row level security;

-- Add assign_to / assigned_user_ids columns if table already existed without them
alter table campaigns add column if not exists assign_to text not null default 'all';
alter table campaigns add column if not exists assigned_user_ids uuid[] not null default '{}';

-- Add bio column
alter table campaigns add column if not exists bio text;
