-- Run this in the Supabase SQL editor (or via `supabase db push`).

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  item text not null check (char_length(item) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS on, no policies: the anon key can't touch this table.
-- The app only ever talks to it server-side with the service role key,
-- behind the PIN gate.
alter table public.contributions enable row level security;
