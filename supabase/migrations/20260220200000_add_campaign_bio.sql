-- Add bio column to campaigns table
alter table campaigns add column if not exists bio text;
