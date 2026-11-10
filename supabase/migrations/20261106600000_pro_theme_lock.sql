-- A free account cannot save a Pro theme. The page blurs Pro themes, but anyone can call the API directly,
-- so the rule is enforced here. Free themes: cyberpunk, anime (Sakura), professional (Suit, men), suitwoman (Suit, women), community.
-- Pro themes: artist, bookreader, marvel (Iron Man), pathways.
-- It runs only when "design" is written. Pro lapsing later (is_pro turning false) does not touch the design, and the card
-- falls back to the default theme on its own.
begin;

create or replace function public.enforce_pro_theme()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.design is not null
     and new.is_pro is not true
     and (new.design->>'theme') in ('artist', 'bookreader', 'marvel', 'pathways')
     and (tg_op = 'INSERT' or (new.design->>'theme') is distinct from (old.design->>'theme') or old.is_pro is true)
  then
    raise exception 'That theme needs MiniYou Pro.';
  end if;
  return new;
end;
$$;

-- Named so it fires after protect_profile_columns, which has already reset is_pro for browser requests
drop trigger if exists zz_enforce_pro_theme on public.newprofile;
create trigger zz_enforce_pro_theme
  before insert or update of design on public.newprofile
  for each row execute function public.enforce_pro_theme();

commit;
