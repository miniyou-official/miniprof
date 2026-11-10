import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const limiter = createRateLimiter({ name: 'click', windowMs: 60_000, max: 300 });
const pairLimiter = createRateLimiter({ name: 'click-pair', windowMs: 10 * 60_000, max: 8 });
const NICKNAME = /^[a-z0-9._-]{2,40}$/;
const PLATFORM = /^[a-z0-9_-]{1,20}$/;
const BOT = /bot|crawl|spider|preview|facebookexternalhit|slurp|headless|lighthouse/i;

// Counts one click on a profile's link. Browsers can no longer write click rows themselves, so the counts cannot be
// forged in bulk: each visitor is limited overall and per profile and link, and the profile has to exist.
export async function POST(request) {
    const ip = getClientIp(request);
    if ((await limiter.check(ip)).limited) return NextResponse.json({ counted: false }, { status: 429 });
    if (BOT.test(request.headers.get('user-agent') || '')) return NextResponse.json({ counted: false });

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ counted: false }, { status: 400 }); }
    const nickname = typeof body?.nickname === 'string' ? body.nickname.toLowerCase().trim() : '';
    const platform = typeof body?.platform === 'string' ? body.platform.toLowerCase().trim() : '';
    if (!NICKNAME.test(nickname) || !PLATFORM.test(platform)) return NextResponse.json({ counted: false }, { status: 400 });
    if ((await pairLimiter.check(`${ip}:${nickname}:${platform}`)).limited) return NextResponse.json({ counted: false });

    const db = getSupabaseAdmin();
    const { data: profile } = await db.from('newprofile').select('id').eq('nickname', nickname).eq('is_public', true).maybeSingle();
    if (!profile) return NextResponse.json({ counted: false });

    const { error } = await db.from('link_clicks').insert({ profile_id: profile.id, nickname, platform });
    return NextResponse.json({ counted: !error });
}
