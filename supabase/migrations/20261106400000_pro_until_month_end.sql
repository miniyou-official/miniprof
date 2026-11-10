-- When the owner turns is_pro on by hand (Supabase table editor or SQL), Pro runs for 30 days from that moment.
-- The daily job in /api/cron/expire-pro switches it off after that.
-- Razorpay payments are not affected: they set pro_until themselves in the same update, and that value is kept.
-- Browsers cannot reach this at all, because protect_profile_columns already stops them changing is_pro.
begin;

create or replace function public.set_pro_month_end()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  turned_on boolean := false;
begin
  if new.is_pro is true then
    if tg_op = 'INSERT' then
      turned_on := new.pro_until is null;
    else
      -- Detect manual Pro activation
      turned_on := old.is_pro is distinct from true
                   and new.pro_until is not distinct from old.pro_until;
    end if;
  end if;

  if turned_on then
    -- Grant exactly 30 days from activation
    new.pro_until := now() + interval '30 days';
  end if;

  return new;
end;
$$;

-- Without this the function is never called. Named so it fires after protect_profile_columns (triggers run in name order).
drop trigger if exists zz_set_pro_month_end on public.newprofile;
create trigger zz_set_pro_month_end
  before insert or update on public.newprofile
  for each row execute function public.set_pro_month_end();

commit;
