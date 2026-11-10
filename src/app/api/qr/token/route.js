import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { isQrSigningConfigured, linkFingerprint, signQrToken, QR_TTL_MS } from '@/lib/qrToken';
import { safeHref } from '@/components/card/cardUtils';

const limiter = createRateLimiter({ name: 'qr-token', windowMs: 60_000, max: 30 });

// Issues a fresh, short-lived QR code. Only the signed-in owner of the profile can get one.
export async function POST(request) {
    const { limited } = await limiter.check(getClientIp(request));
    if (limited) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    const auth = request.headers.get('authorization') || '';
    const accessToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!accessToken) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    if (!isQrSigningConfigured()) {
        return NextResponse.json({ error: 'Fresh QR codes are not set up on this server.', code: 'not-configured' }, { status: 503 });
    }

    let body = {};
    try { body = await request.json(); } catch { /* empty body is fine for a profile QR */ }
    const kind = body.kind === 'link' ? 'l' : 'p';
    const index = Number.isInteger(body.linkIndex) ? body.linkIndex : 0;

    // Act as the signed-in user, so database rules decide what they can read
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } }, auth: { persistSession: false } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData?.user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

    const { data: profile } = await supabase
        .from('newprofile')
        .select('nickname, socialLinks')
        .eq('id', userData.user.id)
        .maybeSingle();
    if (!profile?.nickname) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });

    let fp = '';
    if (kind === 'l') {
        const link = Array.isArray(profile.socialLinks) ? profile.socialLinks[index] : null;
        if (!link || !safeHref(link.url, link.platform)) return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
        fp = linkFingerprint(link.url);
    }

    const { token, expiresAt } = signQrToken({ nickname: profile.nickname, kind, index, fp });
    return NextResponse.json({
        url: `https://www.miniyou.co.in/q/${token}`,
        expiresAt,
        ttlMs: QR_TTL_MS,
    });
}
