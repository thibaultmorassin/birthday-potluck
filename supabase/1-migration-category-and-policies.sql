-- Migration for an existing contributions table:
-- 1. adds the food/drink category column
-- 2. adds the insert/update RLS policies the app needs (select already works)
-- Run in the Supabase SQL editor.

alter table public.contributions
  add column if not exists category text not null default 'food'
  check (category in ('food', 'drink'));

create policy "public can insert contributions"
  on public.contributions for insert to anon with check (true);

create policy "public can update contributions"
  on public.contributions for update to anon using (true) with check (true);
