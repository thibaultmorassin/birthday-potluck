-- Profiles are now just a name, no email.
-- Renames users.email → users.name and converts existing email values
-- ("marie.dupont@mail.com" → "Marie Dupont"). Safe to re-run.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'email'
  ) then
    alter table public.users rename column email to name;
  end if;
end $$;

alter table public.users drop constraint if exists users_email_check;
alter table public.users drop constraint if exists users_name_check;
alter table public.users
  add constraint users_name_check check (char_length(name) between 1 and 80);

-- Turn leftover email values into readable names.
update public.users
set name = initcap(replace(replace(split_part(name, '@', 1), '.', ' '), '_', ' '))
where name like '%@%';
