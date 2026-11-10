// Gives someone Pro for a set time, or removes it. You run this yourself.
//   node --env-file=.env.local scripts/grant-pro.mjs someone@example.com           (30 days)
//   node --env-file=.env.local scripts/grant-pro.mjs someone@example.com --days 60
//   node --env-file=.env.local scripts/grant-pro.mjs someone@example.com --revoke
// If they are still Pro, the new time is added after their current end date.
import { createClient } from '@supabase/supabase-js';

const [email, ...rest] = process.argv.slice(2);
if (!email || !email.includes('@')) {
    console.error('Usage: node --env-file=.env.local scripts/grant-pro.mjs <email> [--days N | --revoke]');
    process.exit(1);
}
const revoke = rest.includes('--revoke');
const di = rest.indexOf('--days');
const days = di >= 0 ? Number(rest[di + 1]) : 30;
if (!revoke && !(days > 0 && days <= 366)) { console.error('--days must be between 1 and 366.'); process.exit(1); }

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: rows, error } = await db.from('newprofile').select('id, nickname, is_pro, pro_until').ilike('email', email.trim());
if (error) { console.error('Lookup failed:', error.message); process.exit(1); }
if (rows?.length !== 1) { console.error(rows?.length ? 'More than one match.' : 'No profile with that email.'); process.exit(1); }
const p = rows[0];

let patch;
if (revoke) patch = { is_pro: false, pro_until: new Date().toISOString() };
else {
    const now = Date.now();
    const current = p.is_pro && p.pro_until ? new Date(p.pro_until).getTime() : 0;
    patch = { is_pro: true, pro_until: new Date(Math.max(now, current) + days * 86400000).toISOString() };
}
const { error: upErr } = await db.from('newprofile').update(patch).eq('id', p.id);
if (upErr) { console.error('Update failed:', upErr.message); process.exit(1); }
console.log(`${p.nickname}: ${revoke ? 'Pro removed' : `Pro until ${patch.pro_until}`}`);
