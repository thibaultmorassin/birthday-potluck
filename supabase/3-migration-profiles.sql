-- Profiles migration:
-- 1. users table (Netflix-like profile picker)
-- 2. contributions.user_id ownership column
-- 3. all the RLS policies the app needs (idempotent — safe to re-run)
-- Run in the Supabase SQL editor.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 3 and 254),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "public can read users" on public.users;
create policy "public can read users"
  on public.users for select to anon using (true);

drop policy if exists "public can insert users" on public.users;
create policy "public can insert users"
  on public.users for insert to anon with check (true);

alter table public.contributions
  add column if not exists user_id uuid references public.users (id) on delete set null;

drop policy if exists "public can read contributions" on public.contributions;
create policy "public can read contributions"
  on public.contributions for select to anon using (true);

drop policy if exists "public can insert contributions" on public.contributions;
create policy "public can insert contributions"
  on public.contributions for insert to anon with check (true);

drop policy if exists "public can update contributions" on public.contributions;
create policy "public can update contributions"
  on public.contributions for update to anon using (true) with check (true);

drop policy if exists "public can delete contributions" on public.contributions;
create policy "public can delete contributions"
  on public.contributions for delete to anon using (true);
