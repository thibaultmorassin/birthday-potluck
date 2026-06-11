-- Adds the "other" contribution category.
-- The live table stores category as text with a check constraint, so we
-- swap the constraint to allow 'other'. We also defensively extend the
-- contribution_category enum in case that variant was applied instead.
-- Safe to re-run.

alter table public.contributions
  drop constraint if exists contributions_category_check;

alter table public.contributions
  add constraint contributions_category_check
  check (category in ('food', 'drink', 'other'));

do $$
begin
  if exists (select 1 from pg_type where typname = 'contribution_category') then
    alter type contribution_category add value if not exists 'other';
  end if;
end $$;
