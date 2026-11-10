// The one place that decides whether a link may be saved or opened. Pure functions: no React, no network.
// The same rules are enforced again inside the database (supabase/migrations/20261106500000_link_safety.sql),
// because anyone can talk to the API without using this page.

export const MAX_URL_LENGTH = 400;
export const MAX_LABEL_LENGTH = 40;
export const MAX_LINKS = 30;

// A link for these apps must point at the app's own sites
export const PLATFORM_DOMAINS = {
  instagram: ['instagram.com'],
  twitter: ['twitter.com', 'x.com'],
  linkedin: ['linkedin.com'],
  github: ['github.com'],
  youtube: ['youtube.com', 'youtu.be'],
  discord: ['discord.gg', 'discord.com'],
  facebook: ['facebook.com', 'fb.com'],
  twitch: ['twitch.tv'],
  medium: ['medium.com'],
  behance: ['behance.net'],
  telegram: ['t.me', 'telegram.me'],
  reddit: ['reddit.com'],
  whatsapp: ['wa.me', 'whatsapp.com'],
  snapchat: ['snapchat.com'],
  leetcode: ['leetcode.com'],
  hackerrank: ['hackerrank.com'],
  patreon: ['patreon.com'],
};

// Never allowed for any link: tunnels, free serverless hosts and gateways that are used to hide where a link really goes
const BLOCKED_HOSTS = [
  'trycloudflare.com', 'workers.dev', 'pages.dev', 'r2.dev', 'cloudflare-ipfs.com', 'cf-ipfs.com', 'cloudflareaccess.com',
  'ngrok.io', 'ngrok.app', 'ngrok.dev', 'ngrok-free.app', 'ngrok-free.dev', 'loca.lt', 'localtunnel.me', 'serveo.net',
  'pagekite.me', 'lhr.life', 'localhost.run', 'playit.gg', 'ipfs.io', 'dweb.link', '000webhostapp.com',
];

// Not allowed on a plain website link: they hide the real destination
const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly', 'rebrand.ly', 'shorturl.at', 'tiny.cc',
  'buff.ly', 'lnkd.in', 'rb.gy', 'bl.ink', 's.id', 'v.gd', 't.ly', 'adf.ly', 'shorte.st',
];

const BLOCKED_TLDS = ['zip', 'mov', 'onion', 'local', 'localhost', 'internal', 'lan', 'home', 'corp'];

// Whitespace, control characters and invisible or direction-changing characters
const INVISIBLE = /[\u0000-\u0020\u007f-\u00a0\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202f\u205f-\u206f\u3000\ufeff\ufff9-\ufffb]/;
// Characters used to break out of quotes, tags or code
const FORBIDDEN = /[<>"'`\\{}|^]/;
// Looks like SQL, script or encoded tricks once decoded
const ATTACK = new RegExp([
  'union\\s+(all\\s+)?select', 'select\\s+.+\\s+from', 'insert\\s+into', 'delete\\s+from', 'drop\\s+(table|database|schema)',
  'update\\s+\\w+\\s+set', '\\bexec(ute)?\\s*\\(', 'xp_cmdshell', 'information_schema', 'pg_sleep', '\\bsleep\\s*\\(',
  'benchmark\\s*\\(', 'waitfor\\s+delay', '\\bor\\s+1\\s*=\\s*1', '\\band\\s+1\\s*=\\s*1', '/\\*', '\\*/', ';', '--(\\s|$)',
  '<\\s*script', 'javascript\\s*:', 'vbscript\\s*:', 'data\\s*:', '\\bon(error|load|click|mouse\\w*|focus|blur|submit|change|input|key\\w*|pointer\\w*|toggle|animation\\w*|begin|start)\\s*=','&#', '\\\\x[0-9a-f]{2}', '\\\\u[0-9a-f]{4}',
].join('|'), 'i');

const fail = (reason) => ({ ok: false, reason });
const NOT_ALLOWED = 'That link is not allowed.';

function hostMatches(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function decodeAll(text) {
  let out = text;
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(out);
      if (next === out) break;
      out = next;
    } catch {
      return null;
    }
  }
  return out;
}

// Checks one link. platform is an app name from PLATFORM_DOMAINS, or 'custom' for a website.
// Returns { ok: true, url } with a clean https link, or { ok: false, reason }.
export function cleanLink(raw, platform = 'custom') {
  if (typeof raw !== 'string') return fail('empty');
  const text = raw.trim();
  if (!text) return fail('empty');
  if (text.length > MAX_URL_LENGTH) return fail('That link is too long.');
  if (INVISIBLE.test(text)) return fail(NOT_ALLOWED);
  if (FORBIDDEN.test(text)) return fail(NOT_ALLOWED);
  if (/%(?![0-9a-f]{2})/i.test(text) || /%25/i.test(text)) return fail(NOT_ALLOWED);

  // A scheme other than https (javascript:, data:, file:, mailto:, ftp:, http:) is refused. "host:port" is not a scheme.
  let candidate = text;
  if (/^http:\/\//i.test(text)) return fail('Links must start with https.');
  if (/^[a-z][a-z0-9+.-]*:/i.test(text) && !/^https:\/\//i.test(text) && !/^[^/:]+:\d+(\/|$)/.test(text)) return fail('Links must start with https.');
  if (text.startsWith('//')) candidate = `https:${text}`;
  else if (!/^https:\/\//i.test(text)) candidate = `https://${text}`;

  let url;
  try { url = new URL(candidate); } catch { return fail('That does not look like a link.'); }
  if (url.protocol !== 'https:') return fail('Links must start with https.');
  if (url.username || url.password) return fail(NOT_ALLOWED);
  if (url.port) return fail(NOT_ALLOWED);

  const host = url.hostname.toLowerCase();
  if (host.length > 253 || host.endsWith('.')) return fail(NOT_ALLOWED);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return fail(NOT_ALLOWED);       // real domain names only (no IPs, no [ipv6], no underscores)
  const labels = host.split('.');
  if (labels.some((l) => l.startsWith('-') || l.endsWith('-') || l.startsWith('xn--'))) return fail(NOT_ALLOWED); // look-alike (punycode) domains
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld) || BLOCKED_TLDS.includes(tld)) return fail(NOT_ALLOWED);
  if (BLOCKED_HOSTS.some((d) => hostMatches(host, d))) return fail(NOT_ALLOWED);

  const allowed = PLATFORM_DOMAINS[platform];
  if (allowed) {
    if (!allowed.some((d) => hostMatches(host, d))) return fail('That is not a link for this app.');
    if (url.pathname === '/' || url.pathname === '') return fail('Add your profile name after the site, for example instagram.com/yourname.');
  } else if (SHORTENERS.some((d) => hostMatches(host, d))) {
    return fail('Short links are not allowed. Paste the full link.');
  }

  if (/\/cdn-cgi\//i.test(url.pathname)) return fail(NOT_ALLOWED);

  // Look at what the link says once decoded, so %27 or %3Cscript%3E cannot slip past
  const decoded = decodeAll(`${url.pathname}${url.search}${url.hash}`);
  if (decoded === null) return fail(NOT_ALLOWED);
  const flat = decoded.replace(/\+/g, ' ');
  if (INVISIBLE.test(decoded.replace(/ /g, '')) || FORBIDDEN.test(decoded) || ATTACK.test(flat)) return fail(NOT_ALLOWED);

  // A link that carries another link in its query is a redirect, not a profile
  for (const [, value] of url.searchParams) {
    const v = decodeAll(value) || '';
    if (/:\/\//.test(v) || v.startsWith('//')) return fail(NOT_ALLOWED);
  }

  const href = url.toString();
  if (href.length > MAX_URL_LENGTH || FORBIDDEN.test(href)) return fail(NOT_ALLOWED);
  return { ok: true, url: href };
}

// A short, plain label for a link: no invisible characters, no markup, a safe length
export function cleanLabel(raw, fallback = 'Link') {
  const text = typeof raw === 'string'
    ? raw.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, '').replace(/[<>`\\]/g, '').replace(/\s+/g, ' ').trim()
    : '';
  return (text || fallback).slice(0, MAX_LABEL_LENGTH);
}

const CLICK_ACTIONS = ['direct', 'qr_prompt'];
const ICON_SHAPES = ['rounded', 'square', 'circle', 'hexagon', 'diamond', 'octagon', 'shield', 'squircle', 'leaf'];
const HEX_COLOUR = /^#[0-9a-f]{3,8}$/i;

// Cleans a whole list before it is saved. Anything wrong stops the save with a clear reason.
export function sanitizeLinkList(list) {
  if (list == null) return { ok: true, links: [] };
  if (!Array.isArray(list)) return fail(NOT_ALLOWED);
  if (list.length > MAX_LINKS) return fail(`You can add up to ${MAX_LINKS} links.`);
  const links = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') return fail(NOT_ALLOWED);
    const platform = typeof item.platform === 'string' && /^[a-z0-9_-]{1,20}$/.test(item.platform) ? item.platform : 'custom';
    const checked = cleanLink(item.url, platform);
    if (!checked.ok) return fail(checked.reason === 'empty' ? 'A link is empty.' : checked.reason);
    const out = { platform, label: cleanLabel(item.label, platform === 'custom' ? 'Website' : platform), url: checked.url };
    out.clickAction = CLICK_ACTIONS.includes(item.clickAction) ? item.clickAction : 'direct';
    if (ICON_SHAPES.includes(item.iconShape)) out.iconShape = item.iconShape;
    if (typeof item.customColor === 'string' && HEX_COLOUR.test(item.customColor)) out.customColor = item.customColor;
    links.push(out);
  }
  return { ok: true, links };
}

// A link that is safe to open right now. mailto: and tel: are allowed only in their plain forms.
export function openableHref(raw, platform = 'custom') {
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (/^mailto:[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9.\-]{1,100}\.[A-Za-z]{2,}$/.test(text)) return text;
  if (/^tel:\+?[0-9\-]{5,20}$/.test(text)) return text;
  const r = cleanLink(text, platform);
  return r.ok ? r.url : null;
}
