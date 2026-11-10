'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X } from 'lucide-react';
import { SiGithub, SiInstagram, SiLinkedin, SiX, SiYoutube } from 'react-icons/si';

const BLUE = '#1AD1FF';
const ROYAL = '#2A6BFF';

// Field and button sizes scale with the screen height (44px minimum for touch, 48px when there is room),
// so a short phone never needs a scrolling page
export const AUTH_INPUT = 'h-[var(--fh,48px)] min-h-[44px] w-full rounded-xl border border-black/10 bg-[#F4F7FB] pl-11 pr-4 text-base text-[#05060A] outline-none transition placeholder:text-black/35 focus:border-[#0A9FD6] focus:bg-white focus:ring-4 focus:ring-[#1AD1FF]/25';
export const AUTH_BUTTON = 'flex h-[var(--fh,48px)] min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-base font-bold text-[#05060A] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100';
export const AUTH_BUTTON_STYLE = { background: BLUE, boxShadow: `0 12px 36px -10px ${BLUE}` };

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 41 + 9) % 100,
    y: (i * 59 + 13) % 100,
    s: 2 + (i % 3),
    d: 7 + (i % 6) * 1.8,
    o: 0.25 + (i % 4) * 0.12,
}));

// The mark with the rings and the orbiting dot from the landing header
function Mark() {
    return (
        <span className="auth-mark relative grid place-items-center" style={{ width: 46, height: 46 }}>
            <span className="auth-ring absolute inset-0 rounded-full" />
            <span className="auth-ring auth-ring-dash absolute inset-[5px] rounded-full" />
            <span className="auth-orbit absolute inset-0"><i /></span>
            <span className="absolute inset-[8px] rounded-full bg-[#1AD1FF]/30 blur-md" />
            <img src="/miniyou-logo.png" alt="" width="36" height="32" className="auth-logo relative h-8 w-auto" draggable={false} />
        </span>
    );
}

// A small example card for the fanned brand panel (not the product card itself, just the same look)
function FanCard({ look, name, role, avatar, handle, className = '', style }) {
    const light = look === 'light';
    const night = look === 'night';
    const bg = light ? '#F4F6FA' : night ? '#05060A' : '#0B0D14';
    const head = light ? 'linear-gradient(135deg,#FFFFFF,#C9D2E3)' : night ? 'linear-gradient(135deg,#12151F,#2B3350)' : `linear-gradient(135deg,${BLUE},${ROYAL})`;
    const ring = light ? '#05060A' : night ? '#FFFFFF' : BLUE;
    const roleCol = light ? '#05060A' : night ? '#FFFFFF' : BLUE;
    const nameCol = light ? '#05060A' : '#FFFFFF';
    const mute = light ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.45)';
    const chip = light ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.07)';
    const chipBd = light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';
    return (
        <div className={`absolute w-[210px] overflow-hidden rounded-[24px] border ${className}`} style={{ background: bg, borderColor: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.14)', ...style }}>
            <div className="h-[72px]" style={{ background: head }} />
            <img src={avatar} alt="" className="absolute left-1/2 top-[36px] h-[72px] w-[72px] -translate-x-1/2 rounded-full border-[3px] object-cover" style={{ borderColor: ring, background: '#111' }} />
            <div className="px-4 pb-5 pt-[48px] text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: roleCol }}>{role}</p>
                <p className="mt-0.5 truncate text-lg font-extrabold tracking-tight" style={{ color: nameCol }}>{name}</p>
                <p className="text-[10px]" style={{ color: mute }}>miniyou.co.in/{handle}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full border" style={{ background: chip, borderColor: chipBd, color: light ? '#E1306C' : '#FF5C9A' }}><SiInstagram size={13} /></span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border" style={{ background: chip, borderColor: chipBd, color: light ? '#0A66C2' : '#4C9BFF' }}><SiLinkedin size={13} /></span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border" style={{ background: chip, borderColor: chipBd, color: light ? '#181717' : '#FFFFFF' }}><SiGithub size={13} /></span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border" style={{ background: chip, borderColor: chipBd, color: light ? '#E60000' : '#FF3B3B' }}><SiYoutube size={13} /></span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border" style={{ background: chip, borderColor: chipBd, color: light ? '#000000' : '#FFFFFF' }}><SiX size={12} /></span>
                </div>
            </div>
        </div>
    );
}

// Plain <style> (not styled-jsx): it is part of the server-rendered HTML, so the phone lock applies from the first paint
const AUTH_CSS = `
                @keyframes authDrift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                @keyframes authA { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(50px, 30px) scale(1.12); } }
                @keyframes authB { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-60px, 20px) scale(1.18); } }
                @keyframes authPulse {
                    0%, 100% { filter: drop-shadow(0 0 6px rgba(26,209,255,0.55)) drop-shadow(0 0 18px rgba(26,209,255,0.25)); }
                    50% { filter: drop-shadow(0 0 12px rgba(26,209,255,0.95)) drop-shadow(0 0 34px rgba(26,209,255,0.55)); }
                }
                @keyframes authSpin { to { transform: rotate(360deg); } }
                @keyframes authSpinRev { to { transform: rotate(-360deg); } }
                @keyframes authFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(0deg); } }
                @keyframes authIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: none; } }
                @keyframes authSheetIn { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: none; } }
                @keyframes authFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes authShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
                @keyframes authCheck { to { stroke-dashoffset: 0; } }
                @keyframes authPop { 0% { transform: scale(0.4); opacity: 0; } 70% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
                @keyframes authSpinner { to { transform: rotate(360deg); } }
                .auth-logo { animation: authPulse 3.2s ease-in-out infinite; }
                .auth-card-in { animation: authIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .auth-fade { animation: authFade 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--d, 0s); }
                .auth-shake { animation: authShake 0.45s ease-in-out; }
                .auth-check-path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: authCheck 0.6s ease-out 0.25s forwards; }
                .auth-pop { animation: authPop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .auth-spinner { animation: authSpinner 0.8s linear infinite; }
                .auth-grid {
                    background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 56px 56px;
                    mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 25%, transparent 80%);
                    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 25%, transparent 80%);
                }
                .auth-ring { border: 1.5px solid rgba(26,209,255,0.5); box-shadow: 0 0 18px rgba(26,209,255,0.3); }
                .auth-ring-dash { border-style: dashed; border-color: rgba(26,209,255,0.45); animation: authSpinRev 12s linear infinite; box-shadow: none; }
                .auth-orbit { animation: authSpin 9s linear infinite; }
                .auth-orbit i { position: absolute; left: 50%; top: -2.5px; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 9999px; background: ${BLUE}; box-shadow: 0 0 12px 3px ${BLUE}; }
                .auth-float { animation: authFloat 6s ease-in-out infinite; }
                .auth-back { transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
                .auth-back:hover { color: #fff; border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.08); }
                /* The shell draws its own notch and home-bar spacing, so the global body padding and white body would only
                   show as blank strips here. The whole ground (including any overscroll) stays the same dark colour. */
                html.auth-page, html.auth-page body { background: #05060A; }
                html.auth-page body { padding: 0; }
                .auth-stack > * + * { margin-top: clamp(10px, 1.9dvh, 16px); }
                .auth-footer-in { display: none; }
                .auth-trust { margin-top: 12px; text-align: center; font-size: 12px; line-height: 1.4; color: rgba(0,0,0,0.42); }
                .auth-trust a { font-weight: 600; color: #0A9FD6; }
                .auth-sub { min-height: 0; }

                /* Phones and very short screens: one locked screen. The card hugs its content and is centred between the
                   header and a bottom margin, so any spare height becomes dark scene around it (not empty space inside it).
                   The bottom margin keeps the slim cookie strip from ever covering a control. */
                @media (max-width: 639px), (max-height: 520px) {
                    html.auth-locked, html.auth-locked body { height: 100dvh; overflow: hidden; overscroll-behavior: none; }
                    .auth-root { height: 100vh; height: 100dvh; min-height: 0 !important; display: flex; flex-direction: column; overflow: hidden; }
                    .auth-root .auth-header { flex: none; width: 100%; height: calc(56px + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top) !important; box-sizing: border-box; }
                    .auth-root .auth-back-text { display: none; }
                    .auth-root .auth-back { width: 44px; height: 44px; padding: 0; justify-content: center; }
                    .auth-root .auth-main { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; margin: 0; gap: 0; padding: 0 16px calc(env(safe-area-inset-bottom) + 84px) !important; }
                    .auth-root .auth-brand { display: none !important; }
                    .auth-root .auth-formwrap { flex: 0 1 auto; min-height: 0; max-height: 100%; display: flex; flex-direction: column; width: 100%; max-width: 440px; margin: 0; }
                    .auth-root .auth-glow { flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; border-radius: 28px; }
                    .auth-root .auth-sheet { flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; border-radius: 27px; padding: 22px 20px 16px; --fh: clamp(44px, 6.2dvh, 52px); }
                    .auth-root .auth-title { font-size: clamp(1.5rem, 4.4dvh, 2.1rem); line-height: 1.05; }
                    .auth-root .auth-sub { margin-top: 6px; min-height: 1.3em; font-size: clamp(14px, 1.9dvh, 16px); line-height: 1.3; }
                    .auth-root .auth-body { flex: none; margin-top: 16px; }
                    .auth-root .auth-stack > * + * { margin-top: clamp(12px, 2dvh, 18px); }
                    .auth-root .auth-footer-in { display: block !important; margin-top: 6px; text-align: center; font-size: 14px; color: rgba(0,0,0,0.6); }
                    .auth-root .auth-footer-out { display: none !important; }
                    .auth-blur { filter: blur(70px) !important; }
                    .auth-p:nth-child(n+9) { display: none; }
                }
                /* short phones (about 700px tall and under): labels become screen-reader only and the extra trust line goes */
                @media (max-width: 639px) and (max-height: 700px) {
                    .auth-root .auth-label { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
                    .auth-root .auth-trust { display: none; }
                    .auth-root .auth-sheet { padding-top: 18px; }
                }
                /* keyboard open or landscape: compact, and the bottom margin shrinks */
                @media (max-height: 560px) and (max-width: 639px), (max-height: 520px) {
                    .auth-root .auth-main { padding-bottom: calc(env(safe-area-inset-bottom) + 8px) !important; }
                    .auth-root .auth-sub p:not([role='alert']) { display: none; }
                    .auth-root .auth-sub { min-height: 0; margin-top: 2px; }
                    .auth-root .auth-title { font-size: 1.3rem; }
                    .auth-root .auth-body { margin-top: 8px; }
                    .auth-root .auth-sheet { padding: 12px 18px 10px; }
                    .auth-root .auth-footer-in { margin-top: 2px; font-size: 13px; }
                    .auth-root .auth-stack > * + * { margin-top: 8px; }
                    .auth-root .auth-trust { display: none; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .auth-logo, .auth-ring-dash, .auth-orbit, .auth-a, .auth-b, .auth-p, .auth-float, .auth-spinner { animation: none !important; }
                    .auth-card-in, .auth-fade, .auth-formwrap { animation: none !important; }
                    .auth-shake { animation: none; }
                    .auth-check-path { animation: none; stroke-dashoffset: 0; }
                }
`;

export default function AuthShell({ title, subtitle, error, progress, children, footer, trust }) {
    // On phones (and any very short screen) the page is locked to one screen while an auth page is mounted
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px), (max-height: 520px)');
        const apply = () => document.documentElement.classList.toggle('auth-locked', mq.matches);
        document.documentElement.classList.add('auth-page');
        apply();
        mq.addEventListener('change', apply);
        return () => {
            mq.removeEventListener('change', apply);
            document.documentElement.classList.remove('auth-locked', 'auth-page');
        };
    }, []);

    return (
        <div className="auth-root relative min-h-screen overflow-x-clip bg-[#05060A] text-white" style={{ minHeight: '100dvh', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
            <style dangerouslySetInnerHTML={{ __html: AUTH_CSS }} />

            {/* the same ground as the landing page: grid, aurora, drifting particles */}
            <div className="pointer-events-none absolute inset-0">
                <div className="auth-grid absolute inset-0" />
                <div className="auth-a auth-blur absolute -left-32 -top-24 h-[480px] w-[560px] rounded-full opacity-30 blur-[120px]" style={{ background: BLUE, animation: 'authA 16s ease-in-out infinite' }} />
                <div className="auth-b auth-blur absolute -bottom-32 -right-32 h-[460px] w-[540px] rounded-full opacity-30 blur-[130px]" style={{ background: ROYAL, animation: 'authB 19s ease-in-out infinite' }} />
                {PARTICLES.map((p, i) => (
                    <span key={i} className="auth-p absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: p.o, background: i % 3 ? '#fff' : BLUE, animation: `authDrift ${p.d}s ease-in-out ${-p.d / 2}s infinite` }} />
                ))}
            </div>

            <header className="auth-header relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingLeft: 'max(1.25rem, env(safe-area-inset-left))', paddingRight: 'max(1.25rem, env(safe-area-inset-right))' }}>
                <Link href="/" className="flex h-12 items-center gap-2.5 text-lg font-extrabold tracking-tight text-white" aria-label="MiniYou home">
                    <Mark />MiniYou
                </Link>
                <Link href="/" className="auth-back inline-flex h-10 items-center gap-1.5 rounded-full border border-white/15 px-4 text-sm font-medium text-white/70" aria-label="Back to home">
                    <ArrowLeft size={16} /><span className="auth-back-text">Back to home</span>
                </Link>
            </header>

            <main className="auth-main relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pb-8 pt-4 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-20 lg:pt-0" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))', paddingLeft: 'max(1.25rem, env(safe-area-inset-left))', paddingRight: 'max(1.25rem, env(safe-area-inset-right))' }}>
                {/* brand side, laptop only */}
                <div className="auth-brand auth-fade hidden lg:block" style={{ '--d': '0.1s' }}>
                    <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.045em] xl:text-6xl">
                        The Digital<br />Profile Card,<br /><span style={{ color: BLUE }}>one link away.</span>
                    </h1>
                    <ul className="mt-8 space-y-3 text-white/70">
                        <li className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `${BLUE}2a` }}><Check size={13} style={{ color: BLUE }} /></span>Your details and every link on one page</li>
                        <li className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `${BLUE}2a` }}><Check size={13} style={{ color: BLUE }} /></span>A QR code that opens your card</li>
                        <li className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `${BLUE}2a` }}><Check size={13} style={{ color: BLUE }} /></span>Free to start, ready in a minute</li>
                    </ul>
                    <div className="relative mt-10 h-[310px] w-[470px]">
                        <FanCard look="light" name="Kavya Rao" role="Researcher" avatar="/avatar-girl.png" handle="kavya" className="left-0 top-10" style={{ transform: 'rotate(-9deg)' }} />
                        <FanCard look="night" name="Arjun Mehta" role="Developer" avatar="/avatar-guy.png" handle="arjun" className="right-0 top-10" style={{ transform: 'rotate(9deg)' }} />
                        <div className="auth-float absolute left-1/2 top-0 -ml-[105px] h-[270px] w-[210px]">
                            <FanCard look="blue" name="Priya Nair" role="Product Designer" avatar="/card3.png" handle="priya" className="left-0 top-0 shadow-[0_30px_80px_-20px_rgba(26,209,255,0.55)]" />
                        </div>
                    </div>
                </div>

                {/* form side: a card on bigger screens, a full-height app sheet on phones */}
                <div className="auth-formwrap auth-card-in mx-auto w-full max-w-[440px]">
                    <div className="auth-glow rounded-[28px] p-[1.5px]" style={{ background: `linear-gradient(135deg, ${BLUE}, rgba(26,209,255,0.08) 45%, ${ROYAL})`, boxShadow: `0 40px 100px -30px ${BLUE}88` }}>
                        <div className="auth-sheet rounded-[27px] bg-white p-6 text-[#05060A] sm:p-8">
                            {progress}
                            <h2 className="auth-title text-3xl font-black tracking-tight">{title}</h2>
                            <div className="auth-sub mt-1.5">
                                {error ? (
                                    <p key={error} role="alert" className="auth-shake flex items-start gap-1.5 text-[13.5px] font-semibold leading-snug text-red-600">
                                        <X size={15} className="mt-0.5 shrink-0" /><span className="line-clamp-2">{error}</span>
                                    </p>
                                ) : (
                                    <p className="text-black/55">{subtitle}</p>
                                )}
                            </div>
                            <div className="auth-body mt-6">{children}</div>
                            {footer && <p className="auth-footer-in">{footer}</p>}
                            {trust && <p className="auth-trust">{trust}</p>}
                        </div>
                    </div>
                    {footer && <p className="auth-footer-out mt-6 text-center text-sm text-white/60">{footer}</p>}
                </div>
            </main>
        </div>
    );
}
