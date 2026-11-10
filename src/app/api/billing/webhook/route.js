import { NextResponse } from 'next/server';
import { fromUnix, getSupabaseAdmin, grantPro, isBillingConfigured, isValidWebhookSignature, redeemCouponFor, restoreListPrice } from '@/lib/billing/razorpay';

// Razorpay calls this for renewals, failures and cancellations. Set the same secret in
// Razorpay Dashboard → Webhooks as RAZORPAY_WEBHOOK_SECRET. A 500 makes Razorpay retry.
export async function POST(request) {
    const rawBody = await request.text();
    if (!isValidWebhookSignature(rawBody, request.headers.get('x-razorpay-signature'))) {
        return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    let event;
    try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Bad body.' }, { status: 400 }); }

    const subscription = event.payload?.subscription?.entity;
    if (!subscription) return NextResponse.json({ ok: true }); // not a subscription event
    if (!isBillingConfigured()) return NextResponse.json({ error: 'Payments are not set up on this server.' }, { status: 503 });

    const db = getSupabaseAdmin();
    const { data: row } = await db.from('subscriptions').select('*').eq('id', subscription.id).maybeSingle();
    const userId = row?.user_id || subscription.notes?.user_id;
    if (!userId) return NextResponse.json({ ok: true }); // not one of ours

    const until = fromUnix(subscription.current_end);

    try {
        await db.from('subscriptions')
            .update({ status: subscription.status, ...(until && { current_end: until }), updated_at: new Date().toISOString() })
            .eq('id', subscription.id);

        switch (event.event) {
            case 'subscription.activated':
            case 'subscription.charged': {
                const payment = event.payload?.payment?.entity;
                if (payment) {
                    await db.from('payments').upsert({
                        id: payment.id,
                        subscription_id: subscription.id,
                        user_id: userId,
                        amount: Math.round((payment.amount || 0) / 100),
                        status: payment.status,
                    }, { onConflict: 'id' });
                }
                if (until) await grantPro(userId, until);
                // Backups in case the browser never reported back: count the code, then return to full price
                if (row) {
                    await redeemCouponFor(row);
                    await restoreListPrice(row);
                }
                break;
            }
            // Renewal failed for good, or the subscription ended: Pro stops unless another one is running
            case 'subscription.halted':
            case 'subscription.cancelled':
            case 'subscription.completed': {
                const { data: others } = await db
                    .from('subscriptions')
                    .select('id')
                    .eq('user_id', userId)
                    .neq('id', subscription.id)
                    .in('status', ['authenticated', 'active', 'pending'])
                    .limit(1);
                if (!others?.length) {
                    const { error } = await db.from('newprofile').update({ is_pro: false }).eq('id', userId);
                    if (error) throw error;
                }
                break;
            }
            // subscription.pending: Razorpay is retrying a failed renewal. Pro stays on meanwhile.
            default:
                break;
        }
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('webhook error:', event.event, err?.message || err);
        return NextResponse.json({ error: 'Could not process event.' }, { status: 500 });
    }
}
