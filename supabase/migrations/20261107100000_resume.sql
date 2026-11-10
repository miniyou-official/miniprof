-- Resume on your card (Pro). 7 Nov 2026.
-- A Pro user uploads one PDF (max 2 MB) to the "resumes" bucket at <user id>/resume.pdf and its path is kept in newprofile.resume_path.
-- The bucket is public (the card is public), and the path holds the user's uuid, so it cannot be guessed. The card only
-- shows the button while the owner is Pro; the file itself stays in the bucket if Pro lapses, and returns when renewed.
-- Deploy this BEFORE the code that selects resume_path, because the column list in src/lib/auth.js names it.
begin;

alter table public.newprofile add column if not exists resume_path text;

-- Browsers can read it like the other card columns (columns are not readable by default, see security_lockdown)
grant select (resume_path) on public.newprofile to anon, authenticated;

-- Only the exact path of the owner is accepted, so nobody can point their card at someone else's file
alter table public.newprofile drop constraint if exists newprofile_resume_path_check;
alter table public.newprofile add constraint newprofile_resume_path_check
  check (resume_path is null or resume_path = id::text || '/resume.pdf');

-- A free account cannot attach a resume, even by calling the API directly. Removing one is always allowed.
create or replace function public.enforce_pro_resume()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.resume_path is not null
     and new.is_pro is not true
     and (tg_op = 'INSERT' or new.resume_path is distinct from old.resume_path)
  then
    raise exception 'A resume needs MiniYou Pro.';
  end if;
  return new;
end;
$$;

-- Named so it fires after protect_profile_columns, which has already reset is_pro for browser requests
drop trigger if exists zz_enforce_pro_resume on public.newprofile;
create trigger zz_enforce_pro_resume
  before insert or update of resume_path on public.newprofile
  for each row execute function public.enforce_pro_resume();

-- PDF only, 2 MB at most; the bucket enforces both whatever the browser says
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', true, 2097152, array['application/pdf'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['application/pdf'];

-- Public download needs no policy on a public bucket. Writes are limited to the owner's own file name.
drop policy if exists "resumes owner read" on storage.objects;
create policy "resumes owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and name = (select auth.uid())::text || '/resume.pdf');

-- Uploading and replacing need Pro
drop policy if exists "resumes pro insert" on storage.objects;
create policy "resumes pro insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and name = (select auth.uid())::text || '/resume.pdf'
    and exists (select 1 from public.newprofile p where p.id = (select auth.uid()) and p.is_pro is true)
  );

drop policy if exists "resumes pro update" on storage.objects;
create policy "resumes pro update" on storage.objects
  for update to authenticated
  using (bucket_id = 'resumes' and name = (select auth.uid())::text || '/resume.pdf')
  with check (
    bucket_id = 'resumes'
    and name = (select auth.uid())::text || '/resume.pdf'
    and exists (select 1 from public.newprofile p where p.id = (select auth.uid()) and p.is_pro is true)
  );

-- Deleting is always allowed for the owner, even after Pro lapses
drop policy if exists "resumes owner delete" on storage.objects;
create policy "resumes owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and name = (select auth.uid())::text || '/resume.pdf');

commit;
