-- Campaigns table: admin-created campaigns that can be assigned to users
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  rules text[],
  how_it_works text[],
  songs_to_use jsonb, -- array of {title, artist, url}
  language text not null default 'English',
  platforms text[] not null default '{}',
  pay_type text not null default 'Per view',
  payout text not null default '',
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User campaign assignments: which users are assigned which campaigns
create table if not exists user_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null,
  assigned_at timestamptz not null default now(),
  unique(campaign_id, user_id)
);

-- Disable RLS — admin-managed, accessed via anon key from admin dashboard
alter table campaigns disable row level security;
alter table user_campaigns disable row level security;
