'use client';

import { useEffect } from 'react';

// The opening screen is hidden by an inline script, but React never runs scripts it inserts itself. When the
// home page is reached with the browser's back button (from login or signup: a client-side navigation, not a
// page load), the screen is rebuilt without that script and would sit over the page for good. The script
// stamps the time it ran; if there is no recent stamp, nothing will ever hide the screen, so hide it now.
// If there is one, hide it when the script's own 1.2 s limit is up, in case React replaced the element the
// script was holding.
export default function SplashGuard() {
    useEffect(() => {
        const el = document.getElementById('mu-splash');
        if (!el) return;
        const age = Date.now() - (window.__muSplashAt || 0);
        if (age > 1500) {
            el.style.display = 'none';
            return;
        }
        const t = setTimeout(() => el.classList.add('mu-out'), Math.max(0, 1200 - age));
        return () => clearTimeout(t);
    }, []);
    return null;
}
