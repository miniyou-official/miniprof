import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin, getUserFromRequest, isBillingConfigured } from '@/lib/billing/razorpay';

const limiter = createRateLimiter({ name: 'status', windowMs: 60_000, max: 120 });

// When the signed-in user's Pro ends, and whether it renews by itself.
// pro_until is not readable from the browser, so the page asks here.
export async function GET(request) {
    if ((await limiter.check(getClientIp(request))).limited) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    if (!isBillingConfigured()) return NextResponse.json({ pro_until: null, renews: false });
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    const db = getSupabaseAdmin();
    const [{ data: profile }, { data: sub }] = await Promise.all([
        db.from('newprofile').select('is_pro, pro_until').eq('id', user.id).maybeSingle(),
        db.from('subscriptions').select('id').eq('user_id', user.id).in('status', ['authenticated', 'active']).eq('cancel_at_period_end', false).limit(1).maybeSingle(),
    ]);
    return NextResponse.json({ pro_until: profile?.is_pro ? profile.pro_until : null, renews: Boolean(sub) });
}
