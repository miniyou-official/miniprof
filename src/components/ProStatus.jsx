'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { cancelPro } from '@/lib/billing/checkout';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Pro users see when their plan renews or ends, and can cancel or restart it
export default function ProStatus({ userId, onRestart }) {
    const [sub, setSub] = useState(null);
    const [manualUntil, setManualUntil] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!userId) return;
        supabase
            .from('subscriptions')
            .select('id, plan, status, current_end, cancel_at_period_end')
            .eq('user_id', userId)
            .in('status', ['authenticated', 'active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data }) => setSub(data || null));
        // Pro switched on by hand has no subscription, only an end date
        supabase.auth.getSession().then(async ({ data }) => {
            const token = data?.session?.access_token;
            if (!token) return;
            const r = await fetch('/api/billing/status', { headers: { Authorization: `Bearer ${token}` } }).then((x) => x.json()).catch(() => null);
            if (r?.pro_until) setManualUntil(r.pro_until);
        });
    }, [userId]);

    const handleCancel = async () => {
        setBusy(true);
        try {
            await cancelPro();
            setSub((s) => (s ? { ...s, cancel_at_period_end: true } : s));
            toast.success('Renewal cancelled. You keep Pro until the end of this period.');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
            setConfirming(false);
        }
    };

    const until = sub?.current_end || manualUntil;
    const renews = Boolean(sub) && !sub.cancel_at_period_end;

    const linkStyle = { background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' };

    return (
        <div style={{ marginTop: 16, textAlign: 'center', fontFamily: 'inherit', fontSize: 12, color: 'var(--db-ink, #BFE6FF)', lineHeight: 1.8 }}>
            <span style={{ color: 'var(--db-primary, #1AD1FF)', fontWeight: 700 }}>✦ PRO</span>
            {until && <> · {renews ? 'Renews' : 'Active until'} {formatDate(until)}</>}
            <br />
            {renews && !confirming && (
                <button type="button" onClick={() => setConfirming(true)} style={{ ...linkStyle, color: 'var(--db-muted, rgba(191,230,255,0.75))' }}>
                    Cancel subscription
                </button>
            )}
            {renews && confirming && (
                <>
                    Stop renewing?{' '}
                    <button type="button" onClick={handleCancel} disabled={busy} style={{ ...linkStyle, color: '#FF6B9A' }}>
                        {busy ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                    {' · '}
                    <button type="button" onClick={() => setConfirming(false)} disabled={busy} style={{ ...linkStyle, color: 'var(--db-ink, #BFE6FF)' }}>
                        Keep Pro
                    </button>
                </>
            )}
            {sub?.cancel_at_period_end && (
                <button type="button" onClick={onRestart} style={{ ...linkStyle, color: 'var(--db-primary, #1AD1FF)' }}>
                    Restart subscription
                </button>
            )}
        </div>
    );
}
