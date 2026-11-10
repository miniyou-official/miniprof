import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { PLANS } from '@/lib/billing/plans';
import { fromUnix, getRazorpay, getSupabaseAdmin, getUserFromRequest, grantPro, isBillingConfigured, isValidCheckoutSignature, redeemCouponFor, restoreListPrice } from '@/lib/billing/razorpay';

const limiter = createRateLimiter({ name: 'verify', windowMs: 60_000, max: 100 });

// Called by the browser after Razorpay Checkout succeeds. Pro is given only if Razorpay's signature matches.
export async function POST(request) {
    const { limited } = await limiter.check(getClientIp(request));
    if (limited) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    if (!isBillingConfigured()) {
        return NextResponse.json({ error: 'Payments are not set up on this server.', code: 'not-configured' }, { status: 503 });
    }

    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

    let body = {};
    try { body = await request.json(); } catch { /* handled below */ }
    const paymentId = body.razorpay_payment_id;
    const subscriptionId = body.razorpay_subscription_id;
    const signature = body.razorpay_signature;
    if (!paymentId || !subscriptionId || !signature) {
        return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    if (!isValidCheckoutSignature({ paymentId, subscriptionId, signature })) {
        return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    const { data: row } = await db.from('subscriptions').select('*').eq('id', subscriptionId).maybeSingle();
    if (!row || row.user_id !== user.id) {
        return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
    }

    try {
        const rzp = getRazorpay();
        const [subscription, payment] = await Promise.all([
            rzp.subscriptions.fetch(subscriptionId),
            rzp.payments.fetch(paymentId),
        ]);

        // Paid period end from Razorpay, or the plan length if Razorpay has not filled it in yet.
        // A restart that begins later (start_at) only authorises the mandate now, so it adds no days yet.
        const startsLater = subscription.start_at && subscription.start_at * 1000 > Date.now();
        const until = fromUnix(subscription.current_end)
            || (startsLater ? null : new Date(Date.now() + PLANS[row.plan].days * 86_400_000).toISOString());

        await db.from('subscriptions')
            .update({ status: subscription.status, ...(until && { current_end: until }), updated_at: new Date().toISOString() })
            .eq('id', subscriptionId);
        await db.from('payments').upsert({
            id: paymentId,
            subscription_id: subscriptionId,
            user_id: user.id,
            amount: Math.round((payment.amount || 0) / 100),
            status: payment.status,
        }, { onConflict: 'id' });

        const proUntil = until ? await grantPro(user.id, until) : null;

        // Count the code as used now that the payment is verified, and queue the return to full price
        await redeemCouponFor(row);
        await restoreListPrice(row);
        return NextResponse.json({ ok: true, pro_until: proUntil, starts_at: startsLater ? fromUnix(subscription.start_at) : null });
    } catch (err) {
        console.error('verify error:', err?.error || err?.message || err);
        return NextResponse.json({ error: 'Payment received but Pro could not be turned on yet. It will update shortly.' }, { status: 500 });
    }
}
