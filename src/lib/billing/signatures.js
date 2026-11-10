// Razorpay signature checks. Pure (no framework imports) so they can be unit tested.
import crypto from 'crypto';

function safeEqual(a, b) {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
}

const hmacHex = (secret, text) => crypto.createHmac('sha256', secret).update(text).digest('hex');

// Signature Razorpay sends to the browser after a subscription's first payment: HMAC-SHA256 of "payment_id|subscription_id"
export function isValidCheckoutSignature({ paymentId, subscriptionId, signature }, keySecret = process.env.RAZORPAY_KEY_SECRET) {
    if (!keySecret || !paymentId || !subscriptionId || !signature) return false;
    return safeEqual(hmacHex(keySecret, `${paymentId}|${subscriptionId}`), signature);
}

// Signature on webhook calls: HMAC-SHA256 over the raw request body with the webhook secret
export function isValidWebhookSignature(rawBody, signature, webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET) {
    if (!webhookSecret || !signature) return false;
    return safeEqual(hmacHex(webhookSecret, rawBody), signature);
}
