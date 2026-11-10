'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DISPLAY_ONLY } from '@/lib/edition';

const REFRESH_BEFORE_MS = 30_000;

/**
 * QR address for the signed-in owner. The QR is available instantly from `fallbackUrl` (the plain profile or
 * link address), so nobody waits for the server. When the server can issue a short-lived signed code, it quietly
 * replaces the plain address and keeps itself fresh. If that fails, the plain QR simply stays.
 * Returns { url, status, retry } where status is 'idle' | 'loading' | 'ready' | 'error'.
 */
export function useFreshQr({ enabled, kind = 'profile', linkIndex = 0, fallbackUrl = '' }) {
    const [signedUrl, setSignedUrl] = useState('');
    const [failed, setFailed] = useState(false);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        setSignedUrl('');
        setFailed(false);
        // In display-only mode the signing API is switched off, so use the plain address straight away
        // Rotating QR codes are off unless NEXT_PUBLIC_FRESH_QR=on. The plain permanent QR is instant, works printed or
        // as a screenshot, and sends people straight to the profile, so there is no request to make here.
        if (!enabled || DISPLAY_ONLY || process.env.NEXT_PUBLIC_FRESH_QR !== 'on') return undefined;
        let cancelled = false;
        let timer;
        const run = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const token = data?.session?.access_token;
                if (!token) throw new Error('no session');
                const res = await fetch('/api/qr/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ kind, linkIndex }),
                });
                if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error('not available');
                const body = await res.json();
                if (cancelled || !body.url) return;
                setSignedUrl(body.url);
                timer = setTimeout(run, Math.max(10_000, body.expiresAt - Date.now() - REFRESH_BEFORE_MS));
            } catch {
                if (!cancelled) setFailed(true);
            }
        };
        run();
        return () => { cancelled = true; clearTimeout(timer); };
    }, [enabled, kind, linkIndex, nonce]);

    const url = signedUrl || fallbackUrl;
    let status = 'idle';
    if (enabled) status = url ? 'ready' : failed ? 'error' : 'loading';
    const retry = useCallback(() => setNonce((n) => n + 1), []);
    return { url, status, retry };
}

export function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}
