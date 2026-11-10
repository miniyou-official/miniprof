-- Coupons for Pro. 6 Nov 2026. NOT applied yet: review, then run it once in the Supabase SQL editor.
-- Only the server (service role key) reads or writes these tables. Browsers get no access at all,
-- so nobody can list codes or change a discount.

begin;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,32}$'),   -- always upper-case
  description text,
  percent_off integer check (percent_off between 1 and 99),
  amount_off integer check (amount_off >= 1),                       -- rupees
  applies_to text not null default 'all' check (applies_to in ('all', 'monthly', 'yearly')),
  max_redemptions integer check (max_redemptions >= 1),             -- null means unlimited
  redeemed_count integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,                                          -- null means no end date
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_one_discount check ((percent_off is null) <> (amount_off is null))
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_id text unique references public.subscriptions (id) on delete set null,
  amount_saved integer not null default 0,                          -- rupees
  created_at timestamptz not null default now(),
  unique (coupon_id, user_id)                                       -- one use of a code per person
);
create index if not exists coupon_redemptions_user_id_idx on public.coupon_redemptions (user_id);

-- What was bought with a code. The new columns stay empty for purchases without one.
alter table public.subscriptions add column if not exists list_price integer;          -- full price in rupees
alter table public.subscriptions add column if not exists coupon_code text;
alter table public.subscriptions add column if not exists price_restored boolean not null default false;

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
-- No policies on purpose: with RLS on and no policy, only the service role can touch these tables
revoke all on public.coupons, public.coupon_redemptions from anon, authenticated;

-- Counts a redemption once, after the payment is verified. Safe to call again for the same subscription.
-- Returns true when the code exists (whether newly counted or already counted).
create or replace function public.redeem_coupon(p_code text, p_user uuid, p_subscription text, p_saved integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_coupon uuid;
  v_inserted integer;
begin
  select id into v_coupon from public.coupons where code = upper(p_code);
  if v_coupon is null then
    return false;
  end if;

  insert into public.coupon_redemptions (coupon_id, user_id, subscription_id, amount_saved)
  values (v_coupon, p_user, p_subscription, greatest(coalesce(p_saved, 0), 0))
  on conflict do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.coupons set redeemed_count = redeemed_count + 1 where id = v_coupon;
  end if;
  return true;
end;
$$;

revoke execute on function public.redeem_coupon(text, uuid, text, integer) from public, anon, authenticated;
grant execute on function public.redeem_coupon(text, uuid, text, integer) to service_role;

-- To add your first code (edit, then run):
-- insert into public.coupons (code, description, percent_off, applies_to, max_redemptions, valid_until)
-- values ('LAUNCH20', 'Launch offer', 20, 'all', 100, '2026-12-31T23:59:59+05:30');

commit;
