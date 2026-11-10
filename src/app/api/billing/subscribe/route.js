import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { PLANS } from '@/lib/billing/plans';
import { MIN_PAYABLE } from '@/lib/billing/pricing';
import { getPriceFor, getRazorpay, getRazorpayPlanId, getSupabaseAdmin, getUserFromRequest, isBillingConfigured, quoteCoupon } from '@/lib/billing/razorpay';

const limiter = createRateLimiter({ name: 'subscribe', shared: true, windowMs: 60_000, max: 60 });

// Enough renewals to run until the user cancels (Razorpay needs a finite count)
const TOTAL_COUNT = { monthly: 120, yearly: 10 };

// Starts a Pro subscription. The browser then opens Razorpay Checkout with the returned id.
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
    const plan = body.plan;
    if (!Object.hasOwn(PLANS, plan)) return NextResponse.json({ error: 'Choose a monthly or yearly plan.' }, { status: 400 });

    const db = getSupabaseAdmin();
    const { data: runningRows } = await db
        .from('subscriptions')
        .select('id, current_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .in('status', ['authenticated', 'active', 'pending']);
    const running = runningRows || [];
    // A checkout opened in the last 15 minutes and not yet paid (double-click, second tab): do not open another
    const { data: openRows } = await db
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'created')
        .gt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
        .limit(1);
    if (openRows?.length) {
        return NextResponse.json({ error: 'A payment is already open. Finish it, or try again in a few minutes.' }, { status: 409 });
    }
    if (running.some((s) => !s.cancel_at_period_end)) {
        return NextResponse.json({ error: 'You already have a Pro subscription.' }, { status: 409 });
    }
    // Restarting after a cancel: the new subscription starts when the paid period ends, so nobody pays twice
    const paidUntil = running.map((s) => s.current_end && new Date(s.current_end)).filter((d) => d && d > new Date()).sort((a, b) => b - a)[0];

    // The price is worked out here, never taken from the browser. A code that does not check out stops the payment,
    // so nobody is charged full price when they expected a discount.
    const listPrice = getPriceFor(user, plan);
    let amount = listPrice;
    let couponCode = null;
    if (typeof body.coupon === 'string' && body.coupon.trim()) {
        const quote = await quoteCoupon(user, plan, body.coupon);
        if (!quote.ok) return NextResponse.json({ error: quote.message }, { status: quote.unavailable ? 503 : 400 });
        amount = quote.finalPrice;
        couponCode = quote.coupon.code;
    }
    if (!Number.isInteger(amount) || amount < MIN_PAYABLE) return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });

    try {
        const subscription = await getRazorpay().subscriptions.create({
            plan_id: await getRazorpayPlanId(plan, amount),
            total_count: TOTAL_COUNT[plan],
            customer_notify: 1,
            ...(paidUntil && { start_at: Math.floor(paidUntil.getTime() / 1000) }),
            notes: { user_id: user.id, plan, ...(couponCode && { coupon: couponCode }) },
        });

        const { error } = await db.from('subscriptions').insert({
            id: subscription.id,
            user_id: user.id,
            plan,
            amount,
            status: subscription.status,
            // The coupon columns exist only after the coupons migration, so they are sent only when a code is used
            ...(couponCode && { coupon_code: couponCode, list_price: listPrice }),
        });
        if (error) throw error;

        return NextResponse.json({
            subscription_id: subscription.id,
            key_id: process.env.RAZORPAY_KEY_ID,
            amount,
            plan,
            ...(couponCode && { coupon: couponCode, list_price: listPrice }),
        });
    } catch (err) {
        if (err?.statusCode === 401) {
            return NextResponse.json({ error: 'Payment provider rejected our keys.' }, { status: 401 });
        }
        console.error('subscribe error:', err?.error || err?.message || err);
        return NextResponse.json({ error: 'Could not start the payment. Please try again.' }, { status: 500 });
    }
}
