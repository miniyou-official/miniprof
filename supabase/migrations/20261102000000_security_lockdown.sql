-- Security lockdown for newprofile (audit issues S2, S4, S5). 2 Nov 2026.
-- Deploy the matching code change (explicit column lists in src/lib/auth.js and src/app/proyou/page.jsx) BEFORE running this.

begin;

-- S2: signed-in users must not change their own Pro status, email, id or view count.
-- SECURITY INVOKER on purpose: current_user is 'anon'/'authenticated' for browser requests,
-- but the owner for the server, the SQL editor and SECURITY DEFINER functions such as increment_view_count.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_pro := false;
    new.view_count := 0;
    new.created_at := now();
    new.email := (select auth.jwt() ->> 'email');
  else
    new.id := old.id;
    new.email := old.email;
    new.is_pro := old.is_pro;
    new.view_count := old.view_count;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.newprofile;
create trigger protect_profile_columns
  before insert or update on public.newprofile
  for each row execute function public.protect_profile_columns();

-- S4: nobody reads the email column through the API. Every other column stays readable under the existing RLS rules.
-- New columns are NOT readable by default after this; grant them explicitly when added.
revoke select on public.newprofile from anon, authenticated;
grant select (
  id, full_name, nickname, bio, avatar_url, is_public, is_pro, "socialLinks", design,
  updated_at, theme, view_count, onboarding_complete, created_at, identity
) on public.newprofile to anon, authenticated;

-- S5: no public email lookup by nickname. Username login moves to a server route later.
revoke execute on function public.get_email_from_nickname(text) from public, anon, authenticated;

-- Advisor warning: pin search_path on the remaining functions.
alter function public.increment_view_count(text) set search_path = public;
alter function public.handle_updated_at() set search_path = public;

commit;
