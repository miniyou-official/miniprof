-- Pro subscriptions through Razorpay. 4 Nov 2026.
-- Only the server (service role key) writes billing data. Signed-in users can read their own rows.

begin;

-- When the current paid period ends. Set by the server after a verified payment or renewal.
-- Not granted to browsers (profiles are public); users see their date from their own subscriptions row.
alter table public.newprofile add column if not exists pro_until timestamptz;

-- Browsers must not set pro_until either (same rule as is_pro in security_lockdown)
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
    new.pro_until := null;
    new.view_count := 0;
    new.created_at := now();
    new.email := (select auth.jwt() ->> 'email');
  else
    new.id := old.id;
    new.email := old.email;
    new.is_pro := old.is_pro;
    new.pro_until := old.pro_until;
    new.view_count := old.view_count;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

-- One row per Razorpay subscription
create table if not exists public.subscriptions (
  id text primary key,                         -- Razorpay subscription id (sub_...)
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount integer not null,                     -- rupees per period
  status text not null default 'created',      -- Razorpay status: created, authenticated, active, halted, cancelled, completed
  current_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- One row per Razorpay payment. The primary key makes repeated webhooks harmless.
create table if not exists public.payments (
  id text primary key,                         -- Razorpay payment id (pay_...)
  subscription_id text references public.subscriptions (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,                     -- rupees
  status text not null,                        -- captured, failed
  created_at timestamptz not null default now()
);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_subscription_id_idx on public.payments (subscription_id);

alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

create policy "Users read own subscriptions" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users read own payments" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.subscriptions, public.payments from anon;
revoke insert, update, delete on public.subscriptions, public.payments from authenticated;

commit;
