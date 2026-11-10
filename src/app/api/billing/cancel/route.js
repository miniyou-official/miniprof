import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { getRazorpay, getSupabaseAdmin, getUserFromRequest, isBillingConfigured } from '@/lib/billing/razorpay';

const limiter = createRateLimiter({ name: 'cancel', windowMs: 60_000, max: 30 });

// Stops renewals. The user keeps Pro until the end of the period they paid for.
export async function POST(request) {
    const { limited } = await limiter.check(getClientIp(request));
    if (limited) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    if (!isBillingConfigured()) {
        return NextResponse.json({ error: 'Payments are not set up on this server.', code: 'not-configured' }, { status: 503 });
    }

    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    const db = getSupabaseAdmin();
    const { data: subs } = await db
        .from('subscriptions')
        .select('id, status, current_end')
        .eq('user_id', user.id)
        .in('status', ['authenticated', 'active', 'pending'])
        .eq('cancel_at_period_end', false);
    if (!subs?.length) return NextResponse.json({ error: 'No subscription to cancel.' }, { status: 404 });

    try {
        for (const sub of subs) {
            // Razorpay can end "at the end of the paid period" only for a subscription that is running.
            // One that has not started yet (a restart waiting for its date) is cancelled straight away.
            await getRazorpay().subscriptions.cancel(sub.id, sub.status === 'active');
            await db.from('subscriptions')
                .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
                .eq('id', sub.id);
        }
        const { data: profile } = await db.from('newprofile').select('pro_until').eq('id', user.id).maybeSingle();
        return NextResponse.json({ ok: true, pro_until: profile?.pro_until || subs[0].current_end });
    } catch (err) {
        console.error('cancel error:', err?.error || err?.message || err);
        return NextResponse.json({ error: 'Could not cancel right now. Please try again or email us.' }, { status: 500 });
    }
}
