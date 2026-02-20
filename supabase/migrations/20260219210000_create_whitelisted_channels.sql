-- Whitelisted channel links: social links matching these patterns skip verification
create table if not exists whitelisted_channels (
  id uuid primary key default gen_random_uuid(),
  url_pattern text not null unique,
  platform text,
  note text,
  created_at timestamptz not null default now()
);

-- Only admins can manage this table (via service role / admin API)
alter table whitelisted_channels enable row level security;

-- Anyone authenticated can read (needed for client-side verification check)
create policy "Authenticated users can read whitelisted channels"
  on whitelisted_channels for select
  to authenticated
  using (true);
