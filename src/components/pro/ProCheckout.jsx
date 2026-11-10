'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Lock, ShieldCheck, X } from 'lucide-react';
import { PLANS, formatRupees, yearlySaving } from '@/lib/billing/plans';
import { subscribeToPro, checkCoupon as checkCouponCode } from '@/lib/billing/checkout';

// Price, coupon and pay, right inside the dashboard's Pro tab.
// The server checks the coupon and the payment; this only shows the result.
const CSS = `
.pc { --pc-s2: color-mix(in srgb, var(--db-ink) 6%, var(--db-surface)); --pc-good: #34d399; --pc-bad: #f87171; }
.pc-buy { border-radius: 24px; padding: 22px; background: var(--db-surface); border: 1px solid var(--db-line); }
.pc-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 5px; border-radius: 999px; background: var(--pc-s2); border: 1px solid var(--db-line); }
.pc-seg { position: relative; }
.pc-seg button { position: relative; z-index: 1; min-height: 44px; border-radius: 999px; border: 0; background: transparent; color: var(--db-muted); font-weight: 800; font-size: 14px; cursor: pointer; transition: color .25s ease; }
.pc-seg button[aria-pressed='true'] { color: var(--db-on-primary); }
.pc-pill { position: absolute; inset: 0; z-index: -1; border-radius: 999px; background: var(--db-primary); box-shadow: 0 8px 22px -10px var(--db-primary); }
.pc-badge { margin-left: 6px; padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 900; background: color-mix(in srgb, var(--pc-good) 22%, transparent); color: var(--pc-good); }
.pc-seg button[aria-pressed='true'] .pc-badge { background: rgba(255,255,255,.22); color: inherit; }
.pc-amount { display: inline-flex; font-variant-numeric: tabular-nums; }
.pc-flash { position: relative; }
.pc-flash::after { content: ''; position: absolute; inset: -6px -10px; border-radius: 16px; pointer-events: none; background: radial-gradient(closest-side, color-mix(in srgb, var(--pc-good) 38%, transparent), transparent); opacity: 0; animation: pcFlash .9s ease-out; }
@keyframes pcFlash { 0% { opacity: 0; transform: scale(.7); } 30% { opacity: 1; } 100% { opacity: 0; transform: scale(1.35); } }
.pc-price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.pc-price strong { font-size: 44px; line-height: 1; letter-spacing: -.04em; font-weight: 900; }
.pc-price s, .pc-price span { color: var(--db-muted); } .pc-price s { font-size: 20px; } .pc-price span { font-size: 14px; }
.pc-save { margin: 8px 0 0; font-size: 14px; font-weight: 700; color: var(--pc-good); min-height: 20px; }
.pc-input { flex: 1; min-width: 0; min-height: 46px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--db-line); background: var(--pc-s2); color: var(--db-ink); font: inherit; font-size: 15px; text-transform: uppercase; letter-spacing: .06em; outline: none; }
.pc-input:focus { border-color: var(--db-primary); }
.pc-apply { min-height: 46px; padding: 0 18px; border-radius: 12px; border: 1px solid var(--db-primary); background: transparent; color: var(--db-primary); font-weight: 800; cursor: pointer; }
.pc-apply:disabled { opacity: .5; cursor: not-allowed; }
.pc-cta { width: 100%; min-height: 54px; margin-top: 16px; border-radius: 999px; border: 0; background: linear-gradient(90deg, #7be6ff, #1ad1ff 45%, #2a6bff); color: #05060a; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 18px 40px -18px rgba(26,209,255,.8); transition: transform .15s ease; }
.pc-cta:hover:not(:disabled) { transform: translateY(-2px); }
.pc-cta:disabled { opacity: .7; cursor: progress; }
.pc-trust { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 16px 0 0; padding: 0; list-style: none; font-size: 12.5px; color: var(--db-muted); }
.pc-trust li { display: flex; align-items: center; gap: 6px; }
.pc-msg { margin: 12px 0 0; padding: 10px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; }
.pc-msg.bad { background: color-mix(in srgb, var(--pc-bad) 12%, transparent); color: var(--pc-bad); }
.pc-msg.good { background: color-mix(in srgb, var(--pc-good) 12%, transparent); color: var(--pc-good); }
.pc-msg.info { background: var(--pc-s2); color: var(--db-muted); }
.pc-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(5,6,10,.82); backdrop-filter: blur(8px); }
.pc-pop { width: min(100%, 400px); padding: 34px 26px; border-radius: 28px; text-align: center; background: var(--db-surface); border: 1px solid var(--db-line); color: var(--db-ink); position: relative; }
.pc-ring { width: 84px; height: 84px; margin: 0 auto 18px; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--db-primary) 18%, transparent); box-shadow: 0 0 0 8px color-mix(in srgb, var(--db-primary) 10%, transparent); }
.pc-spin { width: 34px; height: 34px; border-radius: 50%; border: 3px solid color-mix(in srgb, var(--db-primary) 30%, transparent); border-top-color: var(--db-primary); animation: pcSpin .8s linear infinite; }
@keyframes pcSpin { to { transform: rotate(360deg); } }
.pc-spark { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--db-primary); opacity: 0; animation: pcSpark 1.2s ease-out forwards; }
@keyframes pcSpark { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(.4); } }
@media (prefers-reduced-motion: reduce) { .pc-spin, .pc-spark, .pc-flash::after { animation: none; } .pc-cta, .pc-seg button { transition: none; } }
`;

// The price counts up or down to its new value, so a switch from monthly to yearly or a coupon is easy to see
function RollingPrice({ value }) {
    const reduce = useReducedMotion();
    const mv = useMotionValue(value);
    const text = useTransform(mv, (v) => formatRupees(Math.round(v)));
    useEffect(() => {
        if (reduce) { mv.set(value); return undefined; }
        const controls = animate(mv, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
        return () => controls.stop();
    }, [value, reduce, mv]);
    return <motion.strong className="pc-amount">{text}</motion.strong>;
}

const SPARKS = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { x: Math.round(Math.cos(a) * 70), y: Math.round(Math.sin(a) * 70), d: i * 40 };
});

// restart: a Pro member whose renewal is cancelled can subscribe again (it starts when the paid period ends)
// Razorpay wordmark for the trust line: the blue slanted mark, then the name in the page's text colour
function RazorpayLogo() {
    return (
        <span role="img" aria-label="Razorpay" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--db-ink)' }}>
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M5.2 1 0 15l4.1-2.6L5.2 1Z" fill="#3395FF" /><path d="M13.6 4.4 6.8 15 3 15l1.6-3.6 3.5-2.2L5.9 4.2l5.2-3.1 2.5 3.3Z" fill="#3395FF" opacity="0.85" /></svg>
            Razorpay
        </span>
    );
}

export default function ProCheckout({ user, userData, setUserData, restart = false, id }) {
    const [billing, setBilling] = useState('monthly');
    const [phase, setPhase] = useState('idle'); // idle, opening, verifying, success, failed, cancelled
    const [errorText, setErrorText] = useState('');
    const [codeText, setCodeText] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [couponBusy, setCouponBusy] = useState(false);
    const [couponMsg, setCouponMsg] = useState(null);
    const couponRef = useRef(null);
    couponRef.current = coupon;

    const basePrice = PLANS[billing].price;
    const period = PLANS[billing].period;
    const finalPrice = coupon ? coupon.finalPrice : basePrice;
    const youSave = coupon ? Math.max(0, (coupon.originalPrice ?? basePrice) - coupon.finalPrice) : 0;
    const busy = phase === 'opening' || phase === 'verifying';

    const checkCoupon = useCallback(async (rawCode, plan, quiet) => {
        const code = (rawCode || '').trim().toUpperCase();
        if (!code) { if (!quiet) setCouponMsg({ kind: 'bad', text: 'Type a coupon code first.' }); return; }
        setCouponBusy(true);
        if (!quiet) setCouponMsg(null);
        try {
            const body = await checkCouponCode(code, plan);
            if (!body.valid) {
                setCoupon(null);
                setCouponMsg({ kind: 'bad', text: body.message || 'That code is not valid or has expired.' });
                return;
            }
            setCoupon({
                code: body.code || code, percentOff: body.percentOff || 0, amountOff: body.amountOff || 0,
                originalPrice: body.originalPrice, finalPrice: body.finalPrice,
                renewalPrice: body.renewalPrice, firstPeriodOnly: Boolean(body.firstPeriodOnly),
            });
            setCouponMsg({ kind: 'good', text: body.message || 'Coupon applied.' });
        } catch (err) {
            setCoupon(null);
            setCouponMsg({ kind: 'bad', text: err?.message || 'Could not check that code. Please try again.' });
        } finally {
            setCouponBusy(false);
        }
    }, []);

    const chooseBilling = (plan) => {
        if (plan === billing) return;
        setBilling(plan);
        // The same code may give a different price on the other plan, so ask again
        if (couponRef.current) checkCoupon(couponRef.current.code, plan, true);
    };
    const removeCoupon = () => { setCoupon(null); setCouponMsg(null); setCodeText(''); };

    const handleUpgrade = async () => {
        if (busy) return;
        setErrorText('');
        setPhase('opening');
        try {
            const result = await subscribeToPro(billing, {
                name: userData?.full_name,
                email: user?.email,
                coupon: coupon ? coupon.code : undefined,
                onVerifying: () => setPhase('verifying'),
                onFailed: (message) => { setErrorText(message); toast.error(message); },
            });
            if (result.status === 'cancelled') {
                setPhase('cancelled');
            } else {
                setPhase('success'); // the account is marked Pro when they press Done, so this message stays up until then
            }
        } catch (err) {
            setErrorText(err.message || 'Payment could not be completed. No money was taken.');
            setPhase('failed');
        }
    };

    const ctaLabel = phase === 'opening' ? 'Opening secure payment...'
        : phase === 'verifying' ? 'Confirming your payment...'
            : `${restart ? 'Restart Pro' : 'Upgrade to Pro'} for ${formatRupees(finalPrice)}`;

    return (
        <div className="pc" id={id}>
            <style>{CSS}</style>
            <div className="pc-buy">
                <div className="pc-seg" role="group" aria-label="Billing period">
                    {['monthly', 'yearly'].map((plan) => (
                        <button key={plan} type="button" aria-pressed={billing === plan} onClick={() => chooseBilling(plan)}>
                            {billing === plan && <motion.span layoutId="pc-pill" className="pc-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                            {plan === 'monthly' ? 'Monthly' : 'Yearly'}
                            {plan === 'yearly' && <span className="pc-badge">Best value</span>}
                        </button>
                    ))}
                </div>

                <div className={`pc-price${coupon ? ' pc-flash' : ''}`} key={coupon ? coupon.code : 'plain'} aria-live="polite">
                    <AnimatePresence initial={false}>
                        {coupon && coupon.finalPrice !== (coupon.originalPrice ?? basePrice) && (
                            <motion.s key="was" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>{formatRupees(coupon.originalPrice ?? basePrice)}</motion.s>
                        )}
                    </AnimatePresence>
                    <RollingPrice value={finalPrice} />
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={`${billing}-${coupon?.firstPeriodOnly}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                            {coupon?.firstPeriodOnly ? `first ${period}, GST included` : `/ ${period}, GST included`}
                        </motion.span>
                    </AnimatePresence>
                </div>
                {coupon?.firstPeriodOnly && coupon.renewalPrice != null && (
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--db-muted)' }}>then {formatRupees(coupon.renewalPrice)} per {period}</p>
                )}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.p key={youSave > 0 ? `c-${coupon.code}-${billing}` : billing} className="pc-save" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        {youSave > 0
                            ? `You save ${formatRupees(youSave)}${coupon.percentOff ? ` (${coupon.percentOff}% off)` : ''} with ${coupon.code}`
                            : billing === 'yearly' ? `Save ${formatRupees(yearlySaving())} compared with paying monthly` : ''}
                    </motion.p>
                </AnimatePresence>

                <div style={{ marginTop: 14 }}>
                    {coupon ? (
                        <div className="pc-msg good" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 0 }}>
                            <span><Check size={14} style={{ display: 'inline', marginRight: 6 }} aria-hidden="true" />Code {coupon.code} applied</span>
                            <button type="button" onClick={removeCoupon} aria-label="Remove coupon" style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer', display: 'grid', placeItems: 'center', minHeight: 32, minWidth: 32 }}><X size={16} /></button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); checkCoupon(codeText, billing); }} style={{ display: 'flex', gap: 8 }}>
                            <input className="pc-input" value={codeText} onChange={(e) => setCodeText(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" maxLength={32} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
                            <button type="submit" className="pc-apply" disabled={couponBusy}>{couponBusy ? 'Checking...' : 'Apply'}</button>
                        </form>
                    )}
                    {couponMsg && !coupon && <p className={`pc-msg ${couponMsg.kind}`} role="status">{couponMsg.text}</p>}
                </div>

                <button type="button" className="pc-cta" onClick={handleUpgrade} disabled={busy}>{ctaLabel}</button>

                {phase === 'failed' && <p className="pc-msg bad" role="alert">{errorText} <button type="button" onClick={handleUpgrade} style={{ background: 'transparent', border: 0, color: 'inherit', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>Try again</button></p>}
                {phase === 'cancelled' && <p className="pc-msg info" role="status">Payment cancelled. You have not been charged. Your coupon is still here when you are ready.</p>}

                <ul className="pc-trust">
                    <li><Lock size={14} aria-hidden="true" /> Secure payment by <RazorpayLogo /></li>
                    <li><ShieldCheck size={14} aria-hidden="true" /> We never save your card details</li>
                    <li><Check size={14} aria-hidden="true" /> Cancel any time</li>
                </ul>
            </div>

            <AnimatePresence>
                {(busy || phase === 'success') && (
                    <motion.div className="pc-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Payment status">
                        <motion.div className="pc-pop" initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}>
                            {phase === 'success' ? (
                                <>
                                    {SPARKS.map((s, i) => <span key={i} className="pc-spark" style={{ left: '50%', top: 76, '--x': `${s.x}px`, '--y': `${s.y}px`, animationDelay: `${s.d}ms` }} aria-hidden="true" />)}
                                    <div className="pc-ring">
                                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--db-primary)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>You are on Pro</h2>
                                    <p style={{ margin: '10px 0 22px', color: 'var(--db-muted)', lineHeight: 1.6 }}>Thank you. Your premium themes, shapes, extra tags, city and role are ready. Razorpay will email your receipt.</p>
                                    <button type="button" className="pc-cta" style={{ marginTop: 0 }} onClick={() => { setUserData?.((prev) => ({ ...prev, is_pro: true })); setPhase('idle'); }}>Done</button>
                                </>
                            ) : (
                                <>
                                    <div className="pc-ring"><span className="pc-spin" /></div>
                                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{phase === 'verifying' ? 'Confirming your payment' : 'Secure payment is open'}</h2>
                                    <p style={{ margin: '10px 0 0', color: 'var(--db-muted)', lineHeight: 1.6 }}>{phase === 'verifying' ? 'This takes a few seconds. Please do not close this page.' : 'Finish paying in the Razorpay window. If you do not see it, check for a blocked pop-up.'}</p>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
