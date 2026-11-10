import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { verifyQrToken, linkFingerprint } from '@/lib/qrToken';
import { safeHref } from '@/components/card/cardUtils';
import { profilePath } from '@/lib/edition';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'MiniYou QR', robots: { index: false, follow: false } };

async function resolveTarget(result) {
    if (result.kind === 'p') return profilePath(result.nickname);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: profile } = await supabase
        .from('newprofile')
        .select('socialLinks')
        .eq('nickname', result.nickname)
        .eq('is_public', true)
        .maybeSingle();
    const link = Array.isArray(profile?.socialLinks) ? profile.socialLinks[result.index] : null;
    const href = link ? safeHref(link.url, link.platform) : null;
    // The link must still be the one the QR was made for
    if (!href || linkFingerprint(link.url) !== result.fp) return null;
    return href;
}

export default async function QrPage({ params }) {
    const { token } = await params;
    const result = verifyQrToken(token);

    if (result.ok) {
        const target = await resolveTarget(result);
        if (target) redirect(target);
    }

    return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#00000A', color: '#E0FFFF' }}>
            <div style={{ maxWidth: 380, textAlign: 'center', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 20, padding: '32px 24px', background: '#0F0F2A' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>This QR code has expired</h1>
                <p style={{ marginTop: 12, color: '#9FE9EE', lineHeight: 1.6, fontSize: 14 }}>
                    MiniYou QR codes only work for a few minutes, so old photos and screenshots can&apos;t be reused.
                    Ask the person to show you a fresh one.
                </p>
                <a href="https://www.miniyou.co.in" style={{ display: 'inline-block', marginTop: 20, padding: '12px 22px', borderRadius: 14, background: '#00FFFF', color: '#00000A', fontWeight: 700, textDecoration: 'none' }}>
                    Go to MiniYou
                </a>
            </div>
        </main>
    );
}
