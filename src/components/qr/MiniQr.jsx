'use client';

import { useId, useMemo } from 'react';
import { buildQrSvg } from './qrSvg';
import { QR_LOGO_IMAGE, QR_LOGO_STYLE } from './logoConfig';

// Branded "M" QR drawn on the device. `colors` are the theme gradient colours (darkened for scanning).
export default function MiniQr({ value, colors = [], variant = 'm', logoStyle = QR_LOGO_STYLE, label = 'QR code', className = '', style }) {
    const rawId = useId();
    const id = `q${rawId.replace(/[^a-z0-9]/gi, '')}`;
    const svg = useMemo(() => {
        if (!value) return '';
        try {
            return buildQrSvg(value, { ink1: colors[0], ink2: colors[1], variant, logoStyle, logoImage: logoStyle === 'image' ? QR_LOGO_IMAGE : '', id });
        } catch {
            return '';
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, colors[0], colors[1], variant, logoStyle, id]);

    return (
        <div
            className={className}
            style={style}
            role="img"
            aria-label={label}
            // The SVG is generated here from the QR matrix only; no user HTML is inserted
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
