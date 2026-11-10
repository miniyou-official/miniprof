// Coupon price maths and checks. Pure (no framework imports) so they can be unit tested.
// The server is the only place a price is decided. The browser never sends one.

// Razorpay will not take less than 1 rupee (100 paise), so a discount can never go below this
export const MIN_PAYABLE = 1;

// true: the discount covers the first payment only, then the plan returns to the full price.
// false: the discount lasts for as long as the subscription runs.
export const COUPON_FIRST_PERIOD_ONLY = true;

export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;

export function normalizeCode(raw) {
    const code = String(raw || '').trim().toUpperCase();
    return COUPON_CODE_PATTERN.test(code) ? code : '';
}

// Whole rupees after the discount, never below MIN_PAYABLE and never above the list price
export function applyDiscount(listPrice, coupon) {
    let final = listPrice;
    if (coupon?.percent_off) final = Math.round((listPrice * (100 - coupon.percent_off)) / 100);
    else if (coupon?.amount_off) final = listPrice - coupon.amount_off;
    return Math.min(listPrice, Math.max(MIN_PAYABLE, final));
}

// Returns { ok: true } or { ok: false, message } for a coupon row (or null) bought for a plan.
// `alreadyUsed` is true when this user has used this code before.
export function checkCoupon(coupon, plan, { now = new Date(), alreadyUsed = false } = {}) {
    if (!coupon || !coupon.active) return { ok: false, message: 'That code is not valid.' };
    if (coupon.valid_from && new Date(coupon.valid_from) > now) return { ok: false, message: 'That code is not active yet.' };
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return { ok: false, message: 'That code has expired.' };
    if (coupon.max_redemptions != null && coupon.redeemed_count >= coupon.max_redemptions) {
        return { ok: false, message: 'That code has been fully used.' };
    }
    if (coupon.applies_to && coupon.applies_to !== 'all' && coupon.applies_to !== plan) {
        return { ok: false, message: `That code works on the ${coupon.applies_to} plan only.` };
    }
    if (alreadyUsed) return { ok: false, message: 'You have already used that code.' };
    return { ok: true };
}

export function describeOffer(coupon, listPrice, finalPrice) {
    const saved = listPrice - finalPrice;
    const what = coupon.percent_off ? `${coupon.percent_off}% off` : `₹${coupon.amount_off} off`;
    return `${what} applied. You save ₹${saved}.`;
}
