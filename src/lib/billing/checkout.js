// Browser side of Pro payments: starts a subscription on our server, opens Razorpay Checkout,
// then asks our server to verify the payment. Only the public key id ever reaches the browser.
import { supabase } from '@/lib/supabaseClient';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise;

function loadCheckout() {
    if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = CHECKOUT_SRC;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => { scriptPromise = null; reject(new Error('Could not load the payment window. Check your connection and try again.')); };
            document.body.appendChild(script);
        });
    }
    return scriptPromise;
}

async function callBilling(path, accessToken, body) {
    const res = await fetch(`/api/billing/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
}

async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) throw new Error('Please log in again.');
    return token;
}

// Asks the server what a code would do for a plan. Resolves with { valid, code, percentOff?, amountOff?, originalPrice,
// finalPrice, renewalPrice, firstPeriodOnly, message } or { valid: false, message }. Never throws for a bad code.
export async function checkCoupon(code, plan) {
    const accessToken = await getAccessToken();
    const res = await fetch('/api/billing/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code, plan }),
    });
    const data = await res.json().catch(() => ({}));
    return { valid: false, message: 'Could not check that code. Please try again.', ...data };
}

// Resolves with { status: 'paid', pro_until, starts_at } or { status: 'cancelled' }. Throws with a readable message on failure.
// A failed attempt calls onFailed but keeps the window open, so the user can try another way to pay.
export async function subscribeToPro(plan, { name, email, coupon, onFailed } = {}) {
    const accessToken = await getAccessToken();
    const [, sub] = await Promise.all([loadCheckout(), callBilling('subscribe', accessToken, { plan, ...(coupon && { coupon }) })]);

    return new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
            key: sub.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            subscription_id: sub.subscription_id,
            name: 'MiniYou',
            description: plan === 'yearly' ? 'Pro yearly subscription' : 'Pro monthly subscription',
            image: '/miniyou-mark.png',
            prefill: { name: name || '', email: email || '' },
            theme: { color: '#00B8D4' },
            handler: async (response) => {
                try {
                    // A fresh token, in case the payment took long enough for the first one to expire
                    const result = await callBilling('verify', await getAccessToken(), response);
                    resolve({ status: 'paid', ...result });
                } catch (err) {
                    reject(err);
                }
            },
            modal: { ondismiss: () => resolve({ status: 'cancelled' }) },
        });
        rzp.on('payment.failed', (res) => {
            onFailed?.(res?.error?.description || 'Payment failed. No money was taken.');
        });
        rzp.open();
    });
}

export async function cancelPro() {
    return callBilling('cancel', await getAccessToken());
}
