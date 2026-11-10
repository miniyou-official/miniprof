import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const ipLimiter = createRateLimiter({ name: 'report-ip', shared: true, windowMs: 60 * 60_000, max: 10 });
const userLimiter = createRateLimiter({ name: 'report-user', shared: true, windowMs: 60 * 60_000, max: 5 });
const NICKNAME = /^[a-z0-9._-]{2,40}$/;

// Reports a profile. Only a signed-in person can report, a few times an hour, and the profile has to exist.
export async function POST(request) {
    if ((await ipLimiter.check(getClientIp(request))).limited) return NextResponse.json({ error: 'Too many reports. Please try again later.' }, { status: 429 });

    const auth = request.headers.get('authorization') || '';
    const accessToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!accessToken) return NextResponse.json({ error: 'Please log in to report a profile.' }, { status: 401 });

    const db = getSupabaseAdmin();
    const { data: userData, error: userError } = await db.auth.getUser(accessToken);
    if (userError || !userData?.user) return NextResponse.json({ error: 'Please log in to report a profile.' }, { status: 401 });
    if ((await userLimiter.check(userData.user.id)).limited) return NextResponse.json({ error: 'Too many reports. Please try again later.' }, { status: 429 });

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Bad request.' }, { status: 400 }); }
    const nickname = typeof body?.nickname === 'string' ? body.nickname.toLowerCase().trim() : '';
    if (!NICKNAME.test(nickname)) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });

    const { data: profile } = await db.from('newprofile').select('id').eq('nickname', nickname).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });

    const { error } = await db.from('profile_reports').insert({ reported_nickname: nickname, reason: 'user_report' });
    if (error) return NextResponse.json({ error: 'Could not submit the report.' }, { status: 500 });
    return NextResponse.json({ ok: true });
}
