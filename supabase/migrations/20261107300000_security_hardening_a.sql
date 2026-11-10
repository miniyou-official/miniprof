-- Security hardening, part A. 7 Nov 2026. Safe to apply before the new code is deployed.
--   1. A shared rate limiter that works across all servers (the in-memory one resets per server on Vercel).
--   2. Browsers can write only the profile columns they actually edit (is_pro, pro_until, email, id, view_count and
--      created_at can no longer be written from a browser at all; the trigger stays as a second lock).
--   3. Nobody signed out can write anything. No browser can delete rows or truncate tables.
--   4. Avatar uploads: images only, 2 MB, and only under your own id.

begin;

-- 1. Shared rate limiter -----------------------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Counts one request. Returns true when the caller is over the limit. Atomic, so parallel requests are all counted.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (left(p_key, 200), now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
    hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end
  returning r.hits into v_hits;
  return v_hits > p_max;
end;
$$;

create or replace function public.prune_rate_limits()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.prune_rate_limits() from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.prune_rate_limits() to service_role;

-- 2 and 3. Table privileges ---------------------------------------------------------------------------------------
-- Row rules and the protect_profile_columns trigger still apply on top of this.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
revoke delete on all tables in schema public from anon, authenticated;
revoke insert, update on public.newprofile from anon;
-- (anonymous inserts into link_clicks, profile_reports and upgrade_interests are removed in part B, once the server routes are live)

-- A browser may change only the columns the app edits. Everything billing-related is written by the server only.
revoke update on public.newprofile from authenticated;
grant update (full_name, nickname, bio, avatar_url, is_public, "socialLinks", design, theme, onboarding_complete, identity, resume_path)
  on public.newprofile to authenticated;

-- 4. Avatar uploads ------------------------------------------------------------------------------------------------
update storage.buckets
   set file_size_limit = 2097152,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
 where id = 'avatars';

-- The app saves avatars as "<user id>-<time>.<ext>", so each person can only write names that start with their own id
drop policy if exists "Allow authenticated users to upload" on storage.objects;
drop policy if exists "Allow users to update their own avatar" on storage.objects;

create policy "avatars own upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and owner = (select auth.uid()) and name like (select auth.uid())::text || '-%');

create policy "avatars own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and owner = (select auth.uid()))
  with check (bucket_id = 'avatars' and owner = (select auth.uid()) and name like (select auth.uid())::text || '-%');

notify pgrst, 'reload schema';

commit;
