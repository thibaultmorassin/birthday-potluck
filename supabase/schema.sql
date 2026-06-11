-- Run this in the Supabase SQL editor (fresh install).

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  item text not null check (char_length(item) between 1 and 200),
  category text not null default 'food' check (category in ('food', 'drink')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Semi-public by design: the publishable (anon) key can read and write,
-- the PIN gate in the app is the only door. No delete from the client.
alter table public.contributions enable row level security;

create policy "public can read contributions"
  on public.contributions for select to anon using (true);

create policy "public can insert contributions"
  on public.contributions for insert to anon with check (true);

create policy "public can update contributions"
  on public.contributions for update to anon using (true) with check (true);
