-- Link safety, enforced in the database.
-- The page checks links before saving, but anyone can call the API directly, so the same rules are applied here.
-- Mirrors src/lib/linkSafety.js: https only, a real domain (no IP, port, login in the link or look-alike letters),
-- the right site for each app, no tunnels / serverless hosts / short links, no quotes, tags, SQL or script text,
-- no redirects, at most 30 links, and a short plain label.
-- Only writes to "socialLinks" are checked. Existing rows are not touched until their links are next saved.
begin;

create or replace function public.validate_social_links()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  item        jsonb;
  u           text;
  plat        text;
  lbl         text;
  host        text;
  flat        text;
  query       text;
  doms        jsonb;
  allowed     boolean;
  platform_domains constant jsonb := '{
    "instagram":["instagram.com"],"twitter":["twitter.com","x.com"],"linkedin":["linkedin.com"],"github":["github.com"],
    "youtube":["youtube.com","youtu.be"],"discord":["discord.gg","discord.com"],"facebook":["facebook.com","fb.com"],
    "twitch":["twitch.tv"],"medium":["medium.com"],"behance":["behance.net"],"telegram":["t.me","telegram.me"],
    "reddit":["reddit.com"],"whatsapp":["wa.me","whatsapp.com"],"snapchat":["snapchat.com"],"leetcode":["leetcode.com"],"hackerrank":["hackerrank.com"],"patreon":["patreon.com"]
  }'::jsonb;
begin
  if new."socialLinks" is null then return new; end if;
  if tg_op = 'UPDATE' and new."socialLinks" is not distinct from old."socialLinks" then return new; end if;

  if jsonb_typeof(new."socialLinks") <> 'array' then raise exception 'Links must be a list.'; end if;
  if jsonb_array_length(new."socialLinks") > 30 then raise exception 'You can add up to 30 links.'; end if;

  for item in select value from jsonb_array_elements(new."socialLinks") loop
    if jsonb_typeof(item) <> 'object' then raise exception 'That link is not allowed.'; end if;
    if exists (select 1 from jsonb_object_keys(item) k where k not in ('platform','label','url','clickAction','iconShape','customColor')) then
      raise exception 'That link is not allowed.';
    end if;

    u    := item->>'url';
    plat := coalesce(item->>'platform', 'custom');
    lbl  := coalesce(item->>'label', '');

    if plat !~ '^[a-z0-9_-]{1,20}$' then raise exception 'That link is not allowed.'; end if;
    if lbl ~ '[<>`\\]' or lbl ~ '[[:cntrl:]]' or length(lbl) > 64 then raise exception 'That link label is not allowed.'; end if;
    if coalesce(item->>'clickAction', 'direct') not in ('direct','qr_prompt') then raise exception 'That link is not allowed.'; end if;
    if coalesce(item->>'iconShape', 'rounded') not in ('rounded','circle','square','hexagon','diamond','octagon','shield','squircle','leaf') then raise exception 'That link is not allowed.'; end if;
    if item ? 'customColor' and (item->>'customColor') !~* '^#[0-9a-f]{3,8}$' then raise exception 'That link is not allowed.'; end if;

    if u is null or length(u) > 400 then raise exception 'That link is not allowed.'; end if;

    -- https, a real domain name, no port, no login in the link, only safe characters, and a path that starts with /
    if u !~* '^https://[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+/[^[:space:][:cntrl:]<>"''`\\{}|^]*$' then
      raise exception 'That link is not allowed.';
    end if;
    if u ~ '[^\x21-\x7e]' then raise exception 'That link is not allowed.'; end if;        -- plain ASCII only (non-ASCII must be encoded)
    if u ~* '%25' or u ~* '%(?![0-9a-f]{2})' then raise exception 'That link is not allowed.'; end if;

    host := lower(substring(u from '^https://([^/]+)'));
    if host ~ '^[0-9.]+$' or host ~ '\.[0-9]+$' then raise exception 'That link is not allowed.'; end if;           -- IP addresses
    if host !~ '\.[a-z]{2,}$' then raise exception 'That link is not allowed.'; end if;
    if host ~ '(^|\.)xn--' then raise exception 'That link is not allowed.'; end if;                                -- look-alike domains
    if host ~ '\.(zip|mov|onion|local|localhost|internal|lan|home|corp)$' then raise exception 'That link is not allowed.'; end if;
    if host ~ '(^|\.)(trycloudflare\.com|workers\.dev|pages\.dev|r2\.dev|cloudflare-ipfs\.com|cf-ipfs\.com|cloudflareaccess\.com|ngrok\.(io|app|dev)|ngrok-free\.(app|dev)|loca\.lt|localtunnel\.me|serveo\.net|pagekite\.me|lhr\.life|localhost\.run|playit\.gg|ipfs\.io|dweb\.link|000webhostapp\.com)$' then
      raise exception 'That link is not allowed.';
    end if;

    doms := platform_domains -> plat;
    if doms is not null then
      select exists (select 1 from jsonb_array_elements_text(doms) d where host = d or right(host, length(d) + 1) = '.' || d) into allowed;
      if not allowed then raise exception 'That is not a link for this app.'; end if;
    elsif host ~ '(^|\.)(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rebrand\.ly|shorturl\.at|tiny\.cc|buff\.ly|lnkd\.in|rb\.gy|bl\.ink|s\.id|v\.gd|t\.ly|adf\.ly|shorte\.st)$' then
      raise exception 'Short links are not allowed. Paste the full link.';
    end if;

    if u ~* '/cdn-cgi/' then raise exception 'That link is not allowed.'; end if;

    -- SQL, script and encoded tricks (looked at with %20 and + turned into spaces)
    flat := lower(regexp_replace(substring(u from '^https://[^/]+(.*)$'), '(\+|%20|%09|%0a|%0d)', ' ', 'gi'));
    if flat ~ '(union( all)? +select|select +.+ +from|insert +into|delete +from|drop +(table|database|schema)|update +[a-z_]+ +set|\yexec(ute)? *\(|xp_cmdshell|information_schema|pg_sleep|\ysleep *\(|benchmark *\(|waitfor +delay|\yor +1 *= *1|\yand +1 *= *1|/\*|\*/|;|%3b|--( |$)|<script|javascript *:|vbscript *:|data *:|&#|\\x[0-9a-f]{2}|\\u[0-9a-f]{4}|%(0[0-9a-f]|1[0-9a-f]|7f|22|27|3c|3e|5c|60|7b|7c|7d|5e)|%e2%80%(8[b-f]|a[89a-e])|\yon(error|load|click|mouse[a-z]*|focus|blur|submit|change|input|key[a-z]*|pointer[a-z]*|toggle|animation[a-z]*|begin|start) *=)' then
      raise exception 'That link is not allowed.';
    end if;

    -- a link that carries another link in its query is a redirect
    query := substring(u from '\?(.*)$');
    if query is not null and lower(query) ~ '(://|%3a%2f%2f|%3a//|=//)' then raise exception 'That link is not allowed.'; end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists zz_validate_social_links on public.newprofile;
create trigger zz_validate_social_links
  before insert or update of "socialLinks" on public.newprofile
  for each row execute function public.validate_social_links();

commit;
