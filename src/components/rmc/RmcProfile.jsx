'use client';

import { useEffect, useRef, useState } from 'react';
import RmcThemeCard from './RmcThemeCard';
import { getThemeForRole } from './themes';
import { getRmcDetails } from './rmcUtils';
import { profileUrl } from '@/lib/edition';

const MARGIN = 24; // breathing room around the card, in px
const MAX_SCALE = 1.25;

// Public profile link in the RMC 2026 Community Edition.
// One locked screen: just the card, scaled to fit any phone, with no scrolling and no extras.
export default function RmcProfile({ userData, nickname, isOwner }) {
    const details = getRmcDetails(userData);
    const theme = getThemeForRole(details.role);
    const profile = { id: userData.id, full_name: userData.full_name, nickname, avatar_url: userData.avatar_url, bio: userData.bio };
    const [c1, c2] = [theme.palette[1], theme.palette[3]];

    const innerRef = useRef(null);
    const [fit, setFit] = useState({ s: 1, w: 340, h: 680, ready: false });

    // Lock the page so nothing scrolls or bounces
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prev = [html.style.overflow, body.style.overflow, html.style.overscrollBehavior];
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        html.style.overscrollBehavior = 'none';
        return () => { html.style.overflow = prev[0]; body.style.overflow = prev[1]; html.style.overscrollBehavior = prev[2]; };
    }, []);

    // Scale the card so the whole card always fits the visible screen
    useEffect(() => {
        const el = innerRef.current;
        if (!el) return undefined;
        const measure = () => {
            const vv = window.visualViewport;
            const vw = vv?.width || window.innerWidth;
            const vh = vv?.height || window.innerHeight;
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            if (!w || !h) return;
            setFit({ s: Math.min((vw - MARGIN) / w, (vh - MARGIN) / h, MAX_SCALE), w, h, ready: true });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        window.addEventListener('resize', measure);
        window.addEventListener('orientationchange', measure);
        window.visualViewport?.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
            window.removeEventListener('orientationchange', measure);
            window.visualViewport?.removeEventListener('resize', measure);
        };
    }, []);

    return (
        <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'grid', placeItems: 'center', touchAction: 'manipulation', overscrollBehavior: 'none', background: `radial-gradient(800px 520px at 15% -5%, ${c1}55, transparent 60%), radial-gradient(700px 520px at 100% 100%, ${c2}33, transparent 60%), #04141b` }}>
            <style>{`.rp-inner .rt-card { zoom: 1 !important; width: 340px !important; max-width: none !important; }`}</style>
            <div style={{ width: fit.w * fit.s, height: fit.h * fit.s }}>
                <div ref={innerRef} className="rp-inner" style={{ width: 340, transform: `scale(${fit.s})`, transformOrigin: 'top left', opacity: fit.ready ? 1 : 0, transition: 'opacity 200ms ease' }}>
                    <RmcThemeCard profile={profile} details={details} links={userData.socialLinks || []} profileUrl={profileUrl(nickname)} theme={theme} isOwner={isOwner} />
                </div>
            </div>
        </main>
    );
}
