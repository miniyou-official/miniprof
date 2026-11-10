'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, X, Check } from 'lucide-react';
import { PRO_FEATURES } from './proFeatures';

const PRO_CHECKOUT_ID = 'pro-checkout'; // the pay box in ProTab

// The Pro tab: a floating 3D stack of cards in a box. "Open the box" pops the lid, fires a burst and
// fills the screen with everything Pro has (and what is coming), then leads straight down to the price and the pay button.

const CSS = `
.pf { --pf-s2: color-mix(in srgb, var(--db-ink) 6%, var(--db-surface)); }
.pf-box { position: relative; border-radius: 28px; padding: 22px 18px 24px; text-align: center; overflow: hidden; border: 1px solid color-mix(in srgb, var(--db-primary) 38%, var(--db-line)); background: radial-gradient(520px 260px at 50% -10%, color-mix(in srgb, var(--db-primary) 22%, transparent), transparent 70%), var(--db-surface); }
.pf-scene { position: relative; height: 250px; perspective: 900px; display: grid; place-items: center; }
.pf-stack { position: relative; width: 190px; height: 230px; transform-style: preserve-3d; }
.pf-float { position: absolute; inset: 0; transform-style: preserve-3d; animation: pfFloat 6s ease-in-out infinite; }
.pf-layer { position: absolute; inset: 0; border-radius: 22px; border: 1px solid color-mix(in srgb, var(--db-primary) 45%, transparent); backface-visibility: hidden; }
.pf-l1 { transform: translateZ(-70px) rotate(-7deg); background: linear-gradient(150deg, color-mix(in srgb, var(--db-accent, #5b8cff) 70%, #000), color-mix(in srgb, var(--db-primary) 40%, #000)); opacity: .8; }
.pf-l2 { transform: translateZ(-30px) rotate(5deg); background: linear-gradient(150deg, color-mix(in srgb, var(--db-primary) 70%, #000), color-mix(in srgb, var(--db-accent, #5b8cff) 50%, #000)); opacity: .9; }
.pf-l3 { transform: translateZ(10px); background: linear-gradient(165deg, #0f1530, #0a0d1c); color: #f1f6ff; padding: 16px 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 30px 60px -28px var(--db-primary); overflow: hidden; }
.pf-l3::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent); transform: skewX(-20deg); animation: pfShine 4.5s ease-in-out infinite; }
.pf-badge { align-self: flex-end; display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 800; letter-spacing: .1em; padding: 3px 8px; border-radius: 999px; color: #05060a; background: linear-gradient(120deg, #7be6ff, #2a6bff); }
.pf-av { position: relative; width: 62px; height: 62px; border-radius: 50%; margin-top: 4px; background: linear-gradient(135deg, #7be6ff, #2a6bff); border: 3px solid #0a0d1c; }
.pf-av::before { content: ''; position: absolute; inset: -5px; border-radius: 50%; background: conic-gradient(#7be6ff, #2a6bff, #fff, #7be6ff); z-index: -1; animation: pfSpin 6s linear infinite; }
.pf-line { height: 8px; border-radius: 99px; background: rgba(255,255,255,.18); }
.pf-dots { display: flex; gap: 7px; margin-top: auto; }
.pf-dots i { width: 28px; height: 28px; border-radius: 9px; background: rgba(123,230,255,.2); border: 1px solid rgba(123,230,255,.5); }
.pf-chip { position: absolute; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; color: var(--db-primary); background: var(--db-surface); border: 1px solid color-mix(in srgb, var(--db-primary) 50%, transparent); box-shadow: 0 14px 28px -14px var(--db-primary); animation: pfBob 4s ease-in-out infinite; animation-delay: var(--dl); }
.pf-lid { position: absolute; left: 50%; top: 6px; width: 230px; height: 26px; margin-left: -115px; border-radius: 12px; background: linear-gradient(180deg, color-mix(in srgb, var(--db-primary) 85%, #fff), color-mix(in srgb, var(--db-primary) 55%, #000)); box-shadow: 0 10px 24px -10px var(--db-primary); transform-origin: left center; z-index: 5; }
.pf-ring { position: absolute; left: 50%; top: 50%; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; border: 3px solid var(--db-primary); pointer-events: none; z-index: 6; }
.pf-shake { animation: pfShake .09s linear infinite; }
.pf-h { margin: 8px 0 4px; font-size: clamp(1.3rem, 4.4vw, 1.7rem); font-weight: 900; letter-spacing: -.02em; }
.pf-h span { background: linear-gradient(90deg, #7be6ff, #2a6bff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pf-sub { margin: 0 auto; max-width: 40ch; font-size: 14px; line-height: 1.55; color: var(--db-muted); }
.pf-cta { position: relative; overflow: hidden; margin-top: 18px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 26px; border-radius: 999px; border: 0; cursor: pointer; font: inherit; font-size: 15px; font-weight: 900; color: #05060a; background: linear-gradient(90deg, #7be6ff, #1ad1ff 45%, #2a6bff); box-shadow: 0 18px 40px -16px rgba(26,209,255,.85); }
.pf-cta::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.7), transparent); transform: skewX(-20deg); animation: pfShine 3.6s ease-in-out infinite; }
.pf-cta:focus-visible, .pf-x:focus-visible, .pf-go:focus-visible { outline: 2px solid var(--db-primary); outline-offset: 3px; }
.pf-over { position: fixed; top: 0; left: 0; right: 0; bottom: 0; height: 100dvh; z-index: 80; display: flex; flex-direction: column; color: var(--db-ink); background: radial-gradient(900px 500px at 50% 8%, color-mix(in srgb, var(--db-primary) 26%, transparent), transparent 70%), color-mix(in srgb, var(--db-bg, #060912) 94%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.pf-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px 6px; max-width: 1040px; width: 100%; margin: 0 auto; box-sizing: border-box; }
.pf-x { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; border: 1px solid var(--db-line); background: var(--db-surface); color: var(--db-ink); flex: none; }
.pf-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 16px 12px; }
.pf-grid { max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; perspective: 1000px; }
.pf-tile { position: relative; padding: 16px; border-radius: 20px; text-align: left; background: var(--db-surface); border: 1px solid var(--db-line); overflow: hidden; transform-style: preserve-3d; }
.pf-tile[data-state='live'] { border-color: color-mix(in srgb, var(--db-primary) 45%, transparent); }
.pf-tile::before { content: ''; position: absolute; top: -50%; right: -30%; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--db-primary) 28%, transparent), transparent 65%); pointer-events: none; }
.pf-tile i { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; font-style: normal; color: var(--db-primary); background: color-mix(in srgb, var(--db-primary) 14%, transparent); }
.pf-tile h3 { margin: 12px 0 4px; font-size: 16px; font-weight: 800; }
.pf-tile p { margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--db-muted); }
.pf-state { position: absolute; top: 12px; right: 12px; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; }
.pf-state[data-state='live'] { color: #05060a; background: var(--db-primary); }
.pf-state[data-state='soon'] { color: var(--db-muted); border: 1px dashed var(--db-line); }
.pf-foot { padding: 12px 16px calc(14px + env(safe-area-inset-bottom)); max-width: 1040px; width: 100%; margin: 0 auto; box-sizing: border-box; display: grid; gap: 6px; justify-items: center; }
.pf-go { border: 0; cursor: pointer; font: inherit; display: flex; width: 100%; max-width: 420px; align-items: center; justify-content: center; gap: 8px; min-height: 54px; border-radius: 999px; text-decoration: none; font-size: 16px; font-weight: 900; color: #05060a; background: linear-gradient(90deg, #7be6ff, #1ad1ff 45%, #2a6bff); box-shadow: 0 18px 40px -16px rgba(26,209,255,.85); }
@keyframes pfFloat { 0%, 100% { transform: translateY(0) rotateY(-16deg) rotateX(4deg); } 50% { transform: translateY(-12px) rotateY(16deg) rotateX(-3deg); } }
@keyframes pfBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes pfShine { 0%, 70% { left: -60%; } 100% { left: 130%; } }
@keyframes pfSpin { to { transform: rotate(360deg); } }
@keyframes pfShake { 0% { transform: translate(0,0); } 25% { transform: translate(-3px, 2px); } 50% { transform: translate(3px, -2px); } 75% { transform: translate(-2px, -2px); } 100% { transform: translate(0,0); } }
@media (prefers-reduced-motion: reduce) { .pf-float, .pf-chip, .pf-l3::after, .pf-av::before, .pf-cta::after, .pf-shake { animation: none; } }
`;

const CHIPS = PRO_FEATURES.slice(0, 6).map((f, i) => ({
    f,
    style: [
        { left: '4%', top: '12%' }, { right: '4%', top: '8%' }, { left: '0%', top: '52%' },
        { right: '0%', top: '50%' }, { left: '10%', bottom: '2%' }, { right: '10%', bottom: '0%' },
    ][i],
    delay: `${i * 0.5}s`,
}));

const PARTICLES = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + (i % 2) * 0.12;
    const d = 110 + (i % 5) * 34;
    return { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d), s: 5 + (i % 3) * 3 };
});

export default function ProFeatureBox({ isPro = false }) {
    const [stage, setStage] = useState('closed'); // closed, blast, open
    const closeRef = useRef(null);
    const openerRef = useRef(null);

    // Pointer tilt for the card stack
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 120, damping: 14 });
    const sy = useSpring(my, { stiffness: 120, damping: 14 });
    const rotY = useTransform(sx, [-1, 1], [-22, 22]);
    const rotX = useTransform(sy, [-1, 1], [16, -16]);
    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => { mx.set(0); my.set(0); };

    const openBox = useCallback(() => {
        if (stage !== 'closed') return;
        const calm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (calm) { setStage('open'); return; }
        setStage('blast');
    }, [stage]);

    // The blast lasts a moment, then the full-screen view fills up
    useEffect(() => {
        if (stage !== 'blast') return undefined;
        const t = setTimeout(() => setStage('open'), 750);
        return () => clearTimeout(t);
    }, [stage]);

    const closeAll = useCallback(() => {
        setStage('closed');
        openerRef.current?.focus({ preventScroll: true });
    }, []);

    // "Get Pro": close the box and bring the price and pay button into view
    const goToPrice = useCallback(() => {
        closeAll();
        setTimeout(() => document.getElementById(PRO_CHECKOUT_ID)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    }, [closeAll]);

    // While open: Escape closes, the page behind does not scroll
    useEffect(() => {
        if (stage !== 'open') return undefined;
        const onKey = (e) => { if (e.key === 'Escape') closeAll(); };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus({ preventScroll: true });
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [stage, closeAll]);

    const blast = stage === 'blast';
    const liveCount = PRO_FEATURES.filter((f) => f.state === 'live').length;

    return (
        <div className="pf">
            <style>{CSS}</style>
            <div className={`pf-box ${blast ? 'pf-shake' : ''}`}>
                <div className="pf-scene" onPointerMove={onMove} onPointerLeave={onLeave}>
                    {CHIPS.map(({ f, style, delay }) => {
                        const Icon = f.icon;
                        return (
                            <motion.span key={f.id} className="pf-chip" style={{ ...style, '--dl': delay }} aria-hidden="true"
                                animate={blast ? { scale: [1, 1.5, 0], opacity: [1, 1, 0], rotate: 120 } : { scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ duration: blast ? 0.7 : 0.4 }}>
                                <Icon size={20} />
                            </motion.span>
                        );
                    })}

                    <motion.div style={{ rotateY: rotY, rotateX: rotX, transformStyle: 'preserve-3d' }} animate={blast ? { scale: [1, 0.92, 1.25] } : { scale: 1 }} transition={{ duration: 0.7 }}>
                        <div className="pf-stack">
                            <div className="pf-float" aria-hidden="true">
                                <div className="pf-layer pf-l1" />
                                <div className="pf-layer pf-l2" />
                                <div className="pf-layer pf-l3">
                                    <span className="pf-badge"><Sparkles size={9} /> MEGAYOU</span>
                                    <div className="pf-av" />
                                    <div className="pf-line" style={{ width: '70%' }} />
                                    <div className="pf-line" style={{ width: '45%', opacity: 0.7 }} />
                                    <div className="pf-dots"><i /><i /><i /><i /></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="pf-lid" aria-hidden="true"
                        animate={blast ? { y: -220, rotate: -38, x: -40, opacity: 0 } : { y: 0, rotate: 0, x: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 160, damping: 12, delay: blast ? 0.25 : 0 }} />

                    <AnimatePresence>
                        {blast && (
                            <>
                                <motion.span key="ring" className="pf-ring" aria-hidden="true" initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 12, opacity: 0 }} transition={{ duration: 0.75, delay: 0.25, ease: 'easeOut' }} />
                                {PARTICLES.map((p, i) => (
                                    <motion.span key={i} aria-hidden="true"
                                        style={{ position: 'absolute', left: '50%', top: '50%', width: p.s, height: p.s, marginLeft: -p.s / 2, marginTop: -p.s / 2, borderRadius: i % 3 ? '50%' : 2, background: i % 2 ? 'var(--db-primary)' : '#fff', zIndex: 7 }}
                                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                        animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3, rotate: 180 }}
                                        transition={{ duration: 0.8, delay: 0.25 + (i % 6) * 0.02, ease: 'easeOut' }} />
                                ))}
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <h3 className="pf-h">{isPro ? 'Your ' : 'Everything in '}<span>MiniYou Pro</span></h3>
                <p className="pf-sub">
                    {isPro
                        ? `${liveCount} perks are on your card now, and more are on the way.`
                        : `${liveCount} perks are live today, with more coming. Open the box to see all of it.`}
                </p>
                <button ref={openerRef} type="button" className="pf-cta" onClick={openBox} disabled={stage !== 'closed'}>
                    <Crown size={18} aria-hidden="true" /> {isPro ? 'See what you have' : 'Open the box'}
                </button>
            </div>

            {stage === 'open' && typeof document !== 'undefined' && createPortal(
                <motion.div className="pf-over" role="dialog" aria-modal="true" aria-label="Everything in MiniYou Pro"
                    initial={{ opacity: 0, clipPath: 'circle(0% at 50% 40%)' }} animate={{ opacity: 1, clipPath: 'circle(150% at 50% 40%)' }} transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}>
                    <div className="pf-top">
                        <div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--db-primary)' }}>MiniYou Pro</p>
                            <h2 style={{ margin: '2px 0 0', fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: 900, letterSpacing: '-.02em' }}>All of it. And more on the way.</h2>
                        </div>
                        <button ref={closeRef} type="button" className="pf-x" onClick={closeAll} aria-label="Close"><X size={20} /></button>
                    </div>

                    <div className="pf-scroll">
                        <div className="pf-grid">
                            {PRO_FEATURES.map((f, i) => {
                                const Icon = f.icon;
                                // Each tile shoots up from the middle of the screen with a little spin, then settles
                                const dir = i % 2 ? 1 : -1;
                                return (
                                    <motion.div key={f.id} className="pf-tile" data-state={f.state}
                                        initial={{ opacity: 0, scale: 0.2, y: 260, rotate: dir * (14 + (i % 4) * 6) }}
                                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 150, damping: 13, delay: 0.12 + i * 0.045 }}
                                        whileHover={{ y: -5, rotateX: 5, rotateY: dir * 5, scale: 1.03 }}>
                                        <span className="pf-state" data-state={f.state}>{f.state === 'live' ? 'Live' : 'Soon'}</span>
                                        <i><Icon size={20} aria-hidden="true" /></i>
                                        <h3>{f.title}</h3>
                                        <p>{f.text}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pf-foot">
                        <button type="button" className="pf-go" onClick={isPro ? closeAll : goToPrice}>
                            {isPro ? 'Close' : 'Get Pro'} {!isPro && <ArrowRight size={18} aria-hidden="true" />}
                        </button>
                        {!isPro && (
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--db-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Check size={13} aria-hidden="true" /> Cancel any time. Prices include GST.
                            </p>
                        )}
                    </div>
                </motion.div>,
                document.body,
            )}
        </div>
    );
}
