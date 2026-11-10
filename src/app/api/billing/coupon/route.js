import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { PLANS } from '@/lib/billing/plans';
import { COUPON_FIRST_PERIOD_ONLY } from '@/lib/billing/pricing';
import { getUserFromRequest, isBillingConfigured, quoteCoupon } from '@/lib/billing/razorpay';

// Two limits so codes cannot be guessed: one per network address, and a tighter one per account
const ipLimiter = createRateLimiter({ name: 'coupon-ip', windowMs: 60_000, max: 100 });
const userLimiter = createRateLimiter({ name: 'coupon-user', shared: true, windowMs: 10 * 60_000, max: 10 });

// Checks a code for a plan and returns the price the person would pay. It changes nothing:
// the discount is applied again, on the server, when the subscription is created.
export async function POST(request) {
    if ((await ipLimiter.check(getClientIp(request))).limited) {
        return NextResponse.json({ valid: false, message: 'Too many tries. Please wait a few minutes.' }, { status: 429 });
    }

    if (!isBillingConfigured()) {
        return NextResponse.json({ valid: false, message: 'Payments are not set up on this server.' }, { status: 503 });
    }

    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ valid: false, message: 'Please log in.' }, { status: 401 });

    if ((await userLimiter.check(user.id)).limited) {
        return NextResponse.json({ valid: false, message: 'Too many tries. Please wait a few minutes.' }, { status: 429 });
    }

    let body = {};
    try { body = await request.json(); } catch { /* handled below */ }
    if (!Object.hasOwn(PLANS, body.plan)) {
        return NextResponse.json({ valid: false, message: 'Choose a monthly or yearly plan first.' }, { status: 400 });
    }
    if (typeof body.code !== 'string' || !body.code.trim()) {
        return NextResponse.json({ valid: false, message: 'Enter a code.' }, { status: 400 });
    }

    const quote = await quoteCoupon(user, body.plan, body.code);
    if (!quote.ok) {
        return NextResponse.json({ valid: false, message: quote.message }, { status: quote.unavailable ? 503 : 200 });
    }

    const { coupon } = quote;
    return NextResponse.json({
        valid: true,
        code: coupon.code,
        ...(coupon.percent_off ? { percentOff: coupon.percent_off } : { amountOff: coupon.amount_off }),
        originalPrice: quote.listPrice,
        finalPrice: quote.finalPrice,
        renewalPrice: COUPON_FIRST_PERIOD_ONLY ? quote.listPrice : quote.finalPrice,
        firstPeriodOnly: COUPON_FIRST_PERIOD_ONLY,
        message: quote.message,
    });
}
