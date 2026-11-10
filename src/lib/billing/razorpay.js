// Server-only helpers for Razorpay payments. Never import this from a client component:
// it reads the Razorpay secret and the Supabase service role key.
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { PLANS } from '@/lib/billing/plans';
import { COUPON_FIRST_PERIOD_ONLY, applyDiscount, checkCoupon, describeOffer, normalizeCode } from '@/lib/billing/pricing';
import { isValidCheckoutSignature, isValidWebhookSignature } from '@/lib/billing/signatures';

export { isValidCheckoutSignature, isValidWebhookSignature };

export function isBillingConfigured() {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let razorpay;
export function getRazorpay() {
    if (!razorpay) {
        razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    }
    return razorpay;
}

// Acts as the server, so it can set is_pro and pro_until (the database blocks browsers from doing that)
export { getSupabaseAdmin };

// Checks who is calling, from the "Authorization: Bearer <token>" header
export async function getUserFromRequest(request) {
    const auth = request.headers.get('authorization') || '';
    const accessToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!accessToken) return null;
    const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);
    if (error || !data?.user) return null;
    return data.user;
}

// The full price per period, in rupees, before any code
export function getPriceFor(_user, plan) {
    return PLANS[plan].price;
}

// Looks a code up and prices it for this user and plan. Returns { ok: false, message } or
// { ok: true, coupon, listPrice, finalPrice, message }. Prices come from here only, never from the browser.
export async function quoteCoupon(user, plan, rawCode) {
    const listPrice = getPriceFor(user, plan);
    const code = normalizeCode(rawCode);
    if (!code) return { ok: false, message: 'That code is not valid.' };

    const db = getSupabaseAdmin();
    const { data: coupon, error } = await db.from('coupons').select('*').eq('code', code).maybeSingle();
    if (error) {
        console.error('coupon lookup error:', error.message);
        return { ok: false, message: 'Codes are not available right now. Please try again later.', unavailable: true };
    }

    let alreadyUsed = false;
    if (coupon) {
        const { data: used } = await db.from('coupon_redemptions').select('id').eq('coupon_id', coupon.id).eq('user_id', user.id).maybeSingle();
        alreadyUsed = Boolean(used);
    }

    const verdict = checkCoupon(coupon, plan, { alreadyUsed });
    if (!verdict.ok) return verdict;

    const finalPrice = applyDiscount(listPrice, coupon);
    if (finalPrice >= listPrice) return { ok: false, message: 'That code does not lower the price.' };
    return { ok: true, coupon, listPrice, finalPrice, message: describeOffer(coupon, listPrice, finalPrice) };
}

// Counts the code as used. Called after a payment is verified, and again by the webhook as a backup.
// Safe to repeat: the database counts a subscription once.
export async function redeemCouponFor(row) {
    if (!row?.coupon_code) return;
    const saved = (row.list_price || 0) - (row.amount || 0);
    const { error } = await getSupabaseAdmin().rpc('redeem_coupon', {
        p_code: row.coupon_code, p_user: row.user_id, p_subscription: row.id, p_saved: saved,
    });
    if (error) console.error('redeem coupon error:', error.message);
}

// After a discounted first payment, switch the subscription back to the full price from the next period
export async function restoreListPrice(row) {
    if (!COUPON_FIRST_PERIOD_ONLY || !row?.coupon_code || row.price_restored || !row.list_price) return;
    try {
        const planId = await getRazorpayPlanId(row.plan, row.list_price);
        await getRazorpay().subscriptions.update(row.id, { plan_id: planId, schedule_change_at: 'cycle_end' });
        await getSupabaseAdmin().from('subscriptions').update({ price_restored: true, amount: row.list_price }).eq('id', row.id);
    } catch (err) {
        // Not fatal: the next charged event tries again
        console.error('restore list price error:', err?.error?.description || err?.message || err);
    }
}

// Razorpay plans are fixed-price, so there is one per (period, amount). Found or created on demand.
const RAZORPAY_PERIOD = { monthly: 'monthly', yearly: 'yearly' };
const planCache = new Map();

export async function getRazorpayPlanId(plan, amount) {
    const key = `${plan}:${amount}`;
    if (planCache.has(key)) return planCache.get(key);

    const rzp = getRazorpay();
    // Razorpay lists 100 plans at a time, and every coupon price can add one, so look through several pages
    let found;
    for (let skip = 0; skip < 500 && !found; skip += 100) {
        const { items = [] } = await rzp.plans.all({ count: 100, skip });
        found = items.find((p) =>
            p.notes?.app === 'miniyou' && p.period === RAZORPAY_PERIOD[plan] && p.interval === 1 && p.item?.amount === amount * 100);
        if (items.length < 100) break;
    }

    if (!found) {
        found = await rzp.plans.create({
            period: RAZORPAY_PERIOD[plan],
            interval: 1,
            item: { name: `MiniYou ${PLANS[plan].label}`, amount: amount * 100, currency: 'INR' },
            notes: { app: 'miniyou', plan },
        });
    }
    planCache.set(key, found.id);
    return found.id;
}

// Razorpay sends times as Unix seconds
export const fromUnix = (seconds) => (seconds ? new Date(seconds * 1000).toISOString() : null);

// Turns Pro on until the given time (never shortens a later date that is already set)
export async function grantPro(userId, until) {
    const db = getSupabaseAdmin();
    const { data: profile } = await db.from('newprofile').select('pro_until').eq('id', userId).maybeSingle();
    const current = profile?.pro_until ? new Date(profile.pro_until) : null;
    const next = current && current > new Date(until) ? current.toISOString() : until;
    const { error } = await db.from('newprofile').update({ is_pro: true, pro_until: next }).eq('id', userId);
    if (error) throw error;
    return next;
}
