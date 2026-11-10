'use client';

import { RefreshCw } from 'lucide-react';
import MiniQr from './MiniQr';
import { useFreshQr } from './useFreshQr';

/**
 * Owner-only QR with a short-lived code. Used on the card back, the QR pop-ups and the Share tab.
 * Colours are passed in so each place can match its own surface; the QR itself stays dark on white.
 */
export default function FreshQrPanel({ enabled = true, kind = 'profile', linkIndex = 0, fallbackUrl = '', colors = [], name = 'profile', size = 236, textColor = 'inherit', mutedColor = 'inherit', className = '' }) {
    const { url, status, retry } = useFreshQr({ enabled, kind, linkIndex, fallbackUrl });
    const ready = (status === 'ready' || status === 'not-configured') && url;

    return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
            <div style={{ width: `min(${size}px, 64vw)`, aspectRatio: '1', borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 14px 34px -10px rgba(0,0,0,0.5)', position: 'relative' }}>
                {ready ? (
                    <MiniQr value={url} colors={colors} label={`QR code for ${name}`} style={{ width: '100%', height: '100%' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#555', fontSize: 12, padding: 16, textAlign: 'center' }}>
                        {status === 'error' ? 'Could not create your QR code.' : status === 'not-configured' ? 'Fresh QR codes are not set up yet.' : 'Making your QR code...'}
                    </div>
                )}
            </div>

            {status === 'error' && (
                <button type="button" onClick={retry} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: '1px solid currentColor', background: 'transparent', color: textColor, cursor: 'pointer', font: 'inherit', fontSize: 12 }}>
                    <RefreshCw size={14} aria-hidden="true" /> Try again
                </button>
            )}
        </div>
    );
}
