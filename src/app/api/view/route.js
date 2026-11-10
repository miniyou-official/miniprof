import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const limiter = createRateLimiter({ name: 'view', windowMs: 60_000, max: 300 });
const DEVICE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT = /bot|crawl|spider|preview|facebookexternalhit|slurp|headless|lighthouse/i;

// One-way, so the database never holds a raw device id or IP address
const hash = (value) => createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev').update(value).digest('hex').slice(0, 32);

// Counts a profile view once per phone or laptop. Phones on the same Wi-Fi each count.
export async function POST(request) {
    const ip = getClientIp(request);
    if ((await limiter.check(ip)).limited) return NextResponse.json({ counted: false }, { status: 429 });
    if (BOT.test(request.headers.get('user-agent') || '')) return NextResponse.json({ counted: false });

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ counted: false }, { status: 400 }); }
    const nickname = typeof body?.nickname === 'string' ? body.nickname.toLowerCase().trim().slice(0, 40) : '';
    const device = typeof body?.device === 'string' && DEVICE_ID.test(body.device) ? body.device : '';
    if (!nickname || !device || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ counted: false });

    const { data, error } = await getSupabaseAdmin().rpc('record_profile_view', {
        p_nickname: nickname, p_device: hash(device), p_ip: hash(ip),
    });
    return NextResponse.json({ counted: !error && data === true });
}
