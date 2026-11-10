// Per-theme decoration tokens for the profile card. Colours always come from the user's
// own design (design.colors); these tokens only choose which decoration and particles a theme uses.

import { WS_EXTRA_CARD_STYLE } from '../workshop/workshopThemes';

export const CARD_STYLE = {
    cyberpunk: { deco: 'neoncity', particle: 'dust', bannerOpacity: 1 },
    anime: { deco: 'sakura', particle: 'petal', bannerOpacity: 0.95 },
    artist: { deco: 'blobs', particle: 'mote', bannerOpacity: 0.95 },
    bookreader: { deco: 'book', particle: 'mote', bannerOpacity: 0.9 },
    marvel: { deco: 'armor', particle: 'ember', bannerOpacity: 1 },
    pathways: { deco: 'pathways', particle: 'dust', bannerOpacity: 0 },
    professional: { deco: 'suit', particle: 'mote', bannerOpacity: 1 },
    suitwoman: { deco: 'suitwoman', particle: 'mote', bannerOpacity: 1 },
    balance: { deco: 'balance', particle: 'mote', bannerOpacity: 0 },
    unity: { deco: 'unity', particle: 'firefly', bannerOpacity: 0 },
    empowerment: { deco: 'empowerment', particle: 'firefly', bannerOpacity: 0 },
    community: { deco: 'community', particle: 'firefly', bannerOpacity: 0.5 },
    // Innovation Workshop role themes
    ws_speaker: { deco: 'wsspeaker', particle: 'firefly', bannerOpacity: 0 },
    ws_organizer: { deco: 'wsorganizer', particle: 'mote', bannerOpacity: 0 },
    ws_panelist: { deco: 'wspanelist', particle: 'mote', bannerOpacity: 0 },
    ws_attendee: { deco: 'wsattendee', particle: 'firefly', bannerOpacity: 0 },
    ...WS_EXTRA_CARD_STYLE,
};

export function getCardStyle(themeKey) {
    return CARD_STYLE[themeKey] || CARD_STYLE.cyberpunk;
}

function parseHex(hex) {
    if (typeof hex !== 'string') return null;
    const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// rgba() string from a hex colour; falls back to the input when it is not a hex colour
export function withAlpha(hex, alpha) {
    const rgb = parseHex(hex);
    return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})` : hex;
}

export function luminance(hex) {
    const rgb = parseHex(hex);
    if (!rgb) return 0;
    const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isLight(hex) {
    return luminance(hex) > 0.5;
}

// Readable ink colour to place on top of a given fill
export function inkOn(hex) {
    return luminance(hex) > 0.4 ? '#10121C' : '#FFFFFF';
}
