-- Add enrolled column to user_campaigns
-- enrolled = true means the user has explicitly joined the campaign (vs just being assigned/visible)
alter table user_campaigns add column if not exists enrolled boolean not null default false;
