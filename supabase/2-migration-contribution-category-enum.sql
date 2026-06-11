create type contribution_category as enum (
  'food',
  'drink'
);

alter table public.contributions
  add column if not exists category contribution_category not null default 'food';