/**
 * Rate limiter for API routes. Pages are never rate limited, only the routes that call this.
 *
 * Counts normally live in memory (no extra work at all). For the routes where a bypass matters (login, signup,
 * billing, reports) pass shared: true: the count then lives in the database (rate_limit_hit), so every server
 * instance shares it. That call has a 400 ms limit; if the database is slow, unreachable, or the migration is not
 * applied yet, the request is counted in memory instead. It never waits long and never blocks a real user by mistake.
 *
 * Usage:
 *   const limiter = createRateLimiter({ name: 'login', shared: true, windowMs: 60000, max: 10 });
 *   const { limited } = await limiter.check(ip);
 *   if (limited) return Response 429;
 */
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// After a database failure, stay on the in-memory counter for a minute instead of failing every request
let dbDownUntil = 0;

const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

export function createRateLimiter({ name, shared = false, windowMs = 60_000, max = 20 } = {}) {
  const store = new Map();

  // Auto-cleanup every 5 minutes
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.start > windowMs) store.delete(key);
    }
  }, 300_000);

  // Prevent the interval from keeping Node alive
  if (cleanup.unref) cleanup.unref();

  const local = (key) => {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now - entry.start > windowMs) {
      store.set(key, { start: now, count: 1 });
      return { limited: false, remaining: max - 1 };
    }
    entry.count++;
    if (entry.count > max) return { limited: true, remaining: 0 };
    return { limited: false, remaining: max - entry.count };
  };

  return {
    async check(key) {
      const id = String(key ?? 'unknown');
      if (shared && name && process.env.SUPABASE_SERVICE_ROLE_KEY && Date.now() > dbDownUntil) {
        try {
          const { data, error } = await withTimeout(getSupabaseAdmin().rpc('rate_limit_hit', {
            p_key: `${name}:${id}`,
            p_window_seconds: Math.ceil(windowMs / 1000),
            p_max: max,
          }), 400);
          if (!error && typeof data === 'boolean') return { limited: data, remaining: data ? 0 : undefined };
          dbDownUntil = Date.now() + 60_000;
        } catch {
          dbDownUntil = Date.now() + 60_000;
        }
      }
      return local(id);
    },
  };
}

/**
 * Extract client IP from request headers.
 * Handles proxied requests (Vercel, Cloudflare, etc).
 */
export function getClientIp(request) {
  // Behind Cloudflare, Vercel only sees Cloudflare's addresses and the visitor's own is in CF-Connecting-IP.
  // That header is trusted only when TRUST_CLOUDFLARE=1 is set (do that when the site is proxied by Cloudflare),
  // because otherwise anyone could send it straight to the site and dodge the limits.
  if (process.env.TRUST_CLOUDFLARE === '1') {
    const cf = request.headers.get('cf-connecting-ip');
    if (cf) return cf.trim();
  }
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
