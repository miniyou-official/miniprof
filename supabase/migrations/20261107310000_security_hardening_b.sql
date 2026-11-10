-- Security hardening, part B. 7 Nov 2026.
-- RUN THIS ONLY AFTER the new code is deployed: it needs /api/track/click and /api/report to be live. Those routes
-- now write the click and report rows with the server key, so browsers no longer need (or get) any write access.
--   1. Nobody can insert clicks, reports or upgrade interests straight from a browser any more.
--   2. Length limits on what those tables can hold.
--   3. The older duplicate access rules on newprofile are removed (the newer set stays and says the same thing).

begin;

-- 1. No direct browser writes --------------------------------------------------------------------------------------
drop policy if exists "Anyone can insert clicks" on public.link_clicks;
drop policy if exists "Authenticated users can insert reports" on public.profile_reports;
drop policy if exists "anyone can insert a report" on public.profile_reports;
drop policy if exists "Authenticated users can register interest" on public.upgrade_interests;

revoke insert, update on public.link_clicks, public.profile_reports, public.upgrade_interests from anon, authenticated;
revoke select on public.profile_reports, public.upgrade_interests from anon, authenticated;
revoke select on public.link_clicks from anon;      -- owners still read their own clicks as signed-in users

-- 2. Size limits (not valid = checked for new rows; existing rows are left as they are) ----------------------------
alter table public.link_clicks drop constraint if exists link_clicks_len;
alter table public.link_clicks add constraint link_clicks_len
  check (char_length(nickname) <= 40 and char_length(platform) <= 40) not valid;

alter table public.profile_reports drop constraint if exists profile_reports_len;
alter table public.profile_reports add constraint profile_reports_len
  check (char_length(reported_nickname) <= 40 and (reason is null or char_length(reason) <= 200)) not valid;

-- 3. Duplicate access rules on newprofile -------------------------------------------------------------------------
drop policy if exists "public profiles viewable by everyone" on public.newprofile;
drop policy if exists "users can insert own profile" on public.newprofile;
drop policy if exists "users can update own profile" on public.newprofile;
drop policy if exists "users can view own profile" on public.newprofile;

notify pgrst, 'reload schema';

commit;
