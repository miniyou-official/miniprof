-- Profile views count each phone or laptop once. Phones on the same Wi-Fi each count.
-- The old increment_view_count(text) let anyone add +1 as often as they liked. It is closed here.
-- Apply this BEFORE deploying the matching app code.
begin;

create table if not exists public.profile_views (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.newprofile(id) on delete cascade,
  device_hash uuid not null,
  ip_hash     uuid not null,
  created_at  timestamptz not null default now(),
  unique (profile_id, device_hash)
);
create index if not exists profile_views_ip_idx on public.profile_views (profile_id, ip_hash, created_at);

-- Only hashes are stored, never a raw IP address or device id
alter table public.profile_views enable row level security;
revoke all on public.profile_views from anon, authenticated;

create or replace function public.record_profile_view(p_nickname text, p_device uuid, p_ip uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  added int;
begin
  select id into pid from public.newprofile where nickname = p_nickname and is_public = true;
  if pid is null then return false; end if;

  -- Flood guard only: one network cannot add more than 200 new devices a day to one profile.
  -- Ordinary shared Wi-Fi (a classroom, an event) stays far below this.
  if (select count(*) from public.profile_views
      where profile_id = pid and ip_hash = p_ip and created_at > now() - interval '24 hours') >= 200
  then return false; end if;

  -- This device already counted, ever
  insert into public.profile_views (profile_id, device_hash, ip_hash)
  values (pid, p_device, p_ip)
  on conflict (profile_id, device_hash) do nothing;
  get diagnostics added = row_count;
  if added = 0 then return false; end if;

  update public.newprofile set view_count = coalesce(view_count, 0) + 1 where id = pid;
  return true;
end;
$$;

revoke all on function public.record_profile_view(text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.record_profile_view(text, uuid, uuid) to service_role;

-- Close the open counter
revoke execute on function public.increment_view_count(text) from public, anon, authenticated;

-- Keeps the table small: the count lives in newprofile.view_count, so rows older than a year can go.
-- (A device last seen over a year ago would count once more if it came back.)
create or replace function public.prune_profile_views()
returns integer language sql security definer set search_path = public as $$
  with d as (delete from public.profile_views where created_at < now() - interval '1 year' returning 1)
  select count(*)::int from d;
$$;
revoke all on function public.prune_profile_views() from public, anon, authenticated;
grant execute on function public.prune_profile_views() to service_role;

commit;
