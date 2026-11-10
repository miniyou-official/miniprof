'use client';

import { useEffect, useState } from 'react';
import { openProTab } from '@/lib/openPro';
import { Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const DAY = 24 * 60 * 60 * 1000;

// Shown only in the last day of Pro, and only when Pro will not renew by itself. Nothing before that.
export default function ProEndNotice({ isPro }) {
    const [until, setUntil] = useState(null);

    useEffect(() => {
        if (!isPro) return undefined;
        let alive = true;
        (async () => {
            const token = (await supabase.auth.getSession()).data?.session?.access_token;
            if (!token) return;
            const r = await fetch('/api/billing/status', { headers: { Authorization: `Bearer ${token}` } }).then((x) => x.json()).catch(() => null);
            if (!alive || !r?.pro_until || r.renews) return;
            const left = new Date(r.pro_until).getTime() - Date.now();
            if (left > 0 && left <= DAY) setUntil(new Date(r.pro_until));
        })();
        return () => { alive = false; };
    }, [isPro]);

    if (!until) return null;
    const when = until.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    return (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--db-primary)', background: 'color-mix(in srgb, var(--db-primary) 10%, transparent)', color: 'var(--db-ink)' }}>
            <Clock size={18} aria-hidden="true" style={{ color: 'var(--db-primary)' }} />
            <span className="min-w-0 flex-1"><b>Your Pro ends soon</b>, on {when}. Renew to keep your Pro look and details.</span>
            <button type="button" onClick={openProTab} className="rounded-full px-4 py-2 font-bold" style={{ background: 'var(--db-primary)', color: 'var(--db-on-primary)' }}>Renew Pro</button>
        </div>
    );
}
