// MiniYou "M" QR renderer. Pure function: value in, SVG string out (so it can be tested in Node).
//
// Look: hexagon modules (like MiniYou's hexagon link icons). Modules inside a bold "M" are full-size
// hexagons, modules outside are small dots, so an M shows up in the pattern while every module stays
// present and dark on white, which keeps the code scannable. Corner eyes are rounded, and the centre
// is cleared for the MiniYou monogram. Error correction is level H.
import QRCode from 'qrcode';
import alignmentPattern from 'qrcode/lib/core/alignment-pattern';
import { luminance } from '../card/cardThemes';
import { miniYouMark, neonMark } from './logoMark';

const M_POLY = [[0.08, 0.88], [0.08, 0.14], [0.24, 0.14], [0.5, 0.52], [0.76, 0.14], [0.92, 0.14], [0.92, 0.88],
    [0.77, 0.88], [0.77, 0.4], [0.54, 0.74], [0.46, 0.74], [0.23, 0.4], [0.23, 0.88]];

function inPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

function parseHex(hex) {
    const m = typeof hex === 'string' && hex.trim().match(/^#([0-9a-f]{6})$/i);
    return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null;
}

// Darken a colour until it is dark enough to scan reliably on white
export function scanInk(hex, fallback = '#14143a', maxLum = 0.2) {
    const rgb = parseHex(hex);
    if (!rgb) return fallback;
    let cur = rgb;
    for (let i = 0; i < 20; i++) {
        const h = `#${cur.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        if (luminance(h) <= maxLum) return h;
        cur = cur.map((v) => Math.round(v * 0.88));
    }
    return fallback;
}

// Brighten a colour for use on a dark badge (mix toward white until it is light enough)
function glow(hex, fallback) {
    const rgb = parseHex(hex);
    if (!rgb) return fallback;
    let cur = rgb;
    for (let i = 0; i < 12; i++) {
        const h = `#${cur.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        if (luminance(h) >= 0.3) return h;
        cur = cur.map((v) => Math.round(v + (255 - v) * 0.2));
    }
    return fallback;
}

const f = (n) => +n.toFixed(3);
const hexPath = (x, y, r) => {
    const pts = [0, 1, 2, 3, 4, 5].map((k) => {
        const a = (Math.PI / 3) * k - Math.PI / 2;
        return `${f(x + r * Math.cos(a))} ${f(y + r * Math.sin(a))}`;
    });
    return `M${pts.join('L')}Z`;
};
const dotPath = (x, y, r) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`;
const rrect = (x, y, w, h, r) =>
    `M${f(x + r)} ${f(y)}h${f(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${f(h - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${r}h${f(-(w - 2 * r))}a${r} ${r} 0 0 1 ${-r} ${-r}v${f(-(h - 2 * r))}a${r} ${r} 0 0 1 ${r} ${-r}Z`;

/**
 * @param {string} value text to encode
 * @param {{ ink1?: string, ink2?: string, variant?: 'm'|'classic', logo?: boolean, id?: string }} opts
 */
export function buildQrSvg(value, { ink1 = '#14143a', ink2 = '#3b2f8f', variant = 'm', logo = true, logoImage = '', logoStyle = 'brand', id = 'mq' } = {}) {
    const qr = QRCode.create(String(value), { errorCorrectionLevel: 'H' });
    const n = qr.modules.size;
    const quiet = 2;
    const total = n + quiet * 2;
    const c1 = scanInk(ink1);
    const c2 = scanInk(ink2, c1);

    const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
    // Timing lines and alignment patterns must stay full-size so scanners can lock on
    const align = (alignmentPattern.getPositions ? alignmentPattern.getPositions(qr.version) : []);
    const isFunction = (r, c) => r === 6 || c === 6 || align.some(([ar, ac]) => Math.abs(r - ar) <= 2 && Math.abs(c - ac) <= 2);

    const mid = n / 2;
    const clearR = logo ? n * 0.13 : 0;
    const big = [];
    const small = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (!qr.modules.get(r, c) || inFinder(r, c)) continue;
            if (logo && Math.hypot(c + 0.5 - mid, r + 0.5 - mid) < clearR + 0.5) continue;
            const x = c + quiet + 0.5;
            const y = r + quiet + 0.5;
            if (variant === 'classic') { big.push(`M${f(x - 0.5)} ${f(y - 0.5)}h1v1h-1Z`); continue; }
            if (isFunction(r, c) || inPoly((c + 0.5) / n, (r + 0.5) / n, M_POLY)) big.push(hexPath(x, y, 0.58));
            else small.push(dotPath(x, y, 0.3));
        }
    }

    const eyes = [[0, 0], [n - 7, 0], [0, n - 7]].map(([c, r]) => {
        const x = c + quiet;
        const y = r + quiet;
        return `<path fill-rule="evenodd" d="${rrect(x, y, 7, 7, 2)}${rrect(x + 1, y + 1, 5, 5, 1.2)}"/><path d="${rrect(x + 2, y + 2, 3, 3, 1)}"/>`;
    }).join('');

    // Centre: white badge with the MiniYou mark (low-poly bust that forms the M)
    let logoSvg = '';
    if (logo) {
        const cx = quiet + mid;
        const R = clearR + 0.2;
        const side = R * 1.55;
        if (logoImage) {
            // Raster logo (public/miniyou-mark.png): dark badge so the neon artwork keeps its glow
            const w = R * 1.3;
            const h = w * (162 / 181);
            // The artwork's sparks pull its middle to the left, so nudge it a little left
            const shift = w * 0.05;
            logoSvg = `<defs><clipPath id="${id}c"><circle cx="${f(cx)}" cy="${f(cx)}" r="${f(R)}"/></clipPath></defs>`
                + `<circle cx="${f(cx)}" cy="${f(cx)}" r="${f(R)}" fill="#090C15" stroke="url(#${id}g)" stroke-width="0.3"/>`
                + `<image href="${logoImage}" x="${f(cx - w / 2 - shift)}" y="${f(cx - h / 2)}" width="${f(w)}" height="${f(h)}" clip-path="url(#${id}c)" preserveAspectRatio="xMidYMid meet"/>`;
        } else if (logoStyle === 'neon') {
            // Vector neon outline in the card theme's colours, on a dark badge
            const nside = R * 1.3;
            logoSvg = `<circle cx="${f(cx)}" cy="${f(cx)}" r="${f(R)}" fill="#090C15" stroke="url(#${id}g)" stroke-width="0.3"/>`
                + neonMark({ x: f(cx - nside * 0.49 - nside * 0.03), y: f(cx - nside * 0.49), size: nside, id: `${id}n`, c1: glow(ink1, '#22C7F0'), c2: glow(ink2, '#7AA7FF') });
        } else {
            logoSvg = `<circle cx="${f(cx)}" cy="${f(cx)}" r="${f(R)}" fill="#fff" stroke="url(#${id}g)" stroke-width="0.3"/>`
                + miniYouMark({ x: f(cx - side * 0.49), y: f(cx - side * 0.49), size: side, id: `${id}m` });
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="geometricPrecision">`
        + `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${quiet}" y1="${quiet}" x2="${total - quiet}" y2="${total - quiet}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`
        + `<rect width="${total}" height="${total}" rx="1.6" fill="#fff"/>`
        + `<g fill="url(#${id}g)"><path d="${big.join('')}"/><path d="${small.join('')}"/>${eyes}</g>`
        + logoSvg
        + `</svg>`;
}
