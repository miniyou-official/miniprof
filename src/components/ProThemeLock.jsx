'use client';

import { createPortal } from 'react-dom';
import { Crown } from 'lucide-react';
import HolographicCard, { CARD_THEMES } from './HolographicCard';
import { inkOn } from './card/cardThemes';
import { PLANS, formatRupees } from '@/lib/billing/plans';

// A Pro theme is shown on the card but blurred, under an upgrade panel drawn in that theme's own colours.
// The lock itself lives in the account, not in this blur: HolographicCard only draws a Pro theme for a Pro account,
// and the database refuses to save one for a free account. So removing this panel in the browser unlocks nothing.

function frost(c) {
    return {
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        backdropFilter: 'blur(16px) saturate(130%)',
        background: `linear-gradient(160deg, ${c.background}b3, ${c.gradientStart}33 55%, ${c.gradientEnd}47)`,
    };
}

function Panel({ themeKey, onGetPro, onFree }) {
    const t = CARD_THEMES[themeKey];
    const c = t.colors;
    return (
        <div
            role="dialog"
            aria-label={`${t.name} is a Pro theme`}
            style={{
                width: '100%', maxWidth: 300, boxSizing: 'border-box', padding: '22px 20px', borderRadius: 22, textAlign: 'center', color: c.text,
                background: `${c.background}d9`, border: `1px solid ${c.gradientStart}88`,
                boxShadow: `0 24px 60px -24px ${c.gradientStart}99`, display: 'grid', gap: 10, justifyItems: 'center',
            }}
        >
            <span style={{ width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${c.gradientStart}, ${c.gradientEnd})`, color: inkOn(c.gradientStart) }}>
                <Crown size={22} aria-hidden="true" />
            </span>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.name} is a Pro theme</p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
                Unlock it with MiniYou Pro for {formatRupees(PLANS.monthly.price)} a month. Until then your card stays on a free theme.
            </p>
            <button
                type="button"
                onClick={onGetPro}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 999, border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 800, background: `linear-gradient(120deg, ${c.gradientStart}, ${c.gradientEnd})`, color: inkOn(c.gradientStart) }}
            >
                Get Pro
            </button>
            <button
                type="button"
                onClick={onFree}
                style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', fontSize: 13, color: c.text, opacity: 0.75, textDecoration: 'underline' }}
            >
                Use a free theme
            </button>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>Secure payment by Razorpay. Cancel any time.</p>
        </div>
    );
}

// Over the live card (laptop, and the My card screen on a phone)
export function ProThemeLockOverlay({ themeKey, onGetPro, onFree }) {
    const c = CARD_THEMES[themeKey].colors;
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, borderRadius: 28, display: 'grid', placeItems: 'center', padding: 14, ...frost(c) }}>
            <Panel themeKey={themeKey} onGetPro={onGetPro} onFree={onFree} />
        </div>
    );
}

// Full screen on a phone: the card in the tapped theme.
// A free theme is shown clear, with a button that picks it and saves it in one tap.
// A Pro theme is shown blurred, behind an upgrade panel in the theme's own style.
export function ThemePreviewSheet({ themeKey, locked, userData, design, onGetPro, onFree, onUse, busy }) {
    if (typeof document === 'undefined') return null;
    const t = CARD_THEMES[themeKey];
    const c = t.colors;
    const shell = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100dvh', zIndex: 70, display: 'flex', flexDirection: 'column', ...frost(c) };
    const card = <HolographicCard userData={userData} currentDesign={design} isOwner={false} previewLocked />;

    if (locked) {
        return createPortal(
            <div style={{ ...shell, overflow: 'hidden' }}>
                <div aria-hidden="true" inert style={{ position: 'absolute', left: '50%', top: '50%', width: 360, transform: 'translate(-50%, -50%) scale(0.9)', filter: 'blur(9px)', opacity: 0.85, pointerEvents: 'none' }}>
                    {card}
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <Panel themeKey={themeKey} onGetPro={onGetPro} onFree={onFree} />
                </div>
            </div>,
            document.body,
        );
    }

    const ink = inkOn(c.gradientStart);
    return createPortal(
        <div role="dialog" aria-label={`Preview of ${t.name}`} style={shell}>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', padding: '16px 16px 8px' }}>
                <div inert style={{ margin: 'auto', width: '100%', maxWidth: 420 }}>{card}</div>
            </div>
            <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: '8px 16px calc(14px + env(safe-area-inset-bottom))', boxSizing: 'border-box', display: 'grid', gap: 8 }}>
                <button
                    type="button"
                    onClick={onUse}
                    disabled={busy}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 999, border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 800, opacity: busy ? 0.7 : 1, background: `linear-gradient(120deg, ${c.gradientStart}, ${c.gradientEnd})`, color: ink }}
                >
                    {busy ? 'Saving...' : `Use ${t.name}`}
                </button>
                <button
                    type="button"
                    onClick={onFree}
                    style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', fontSize: 13, padding: 6, color: c.text, opacity: 0.8, textDecoration: 'underline' }}
                >
                    Back to designs
                </button>
            </div>
        </div>,
        document.body,
    );
}
