// MiniYou mark: a low-poly bust that forms the letter M, with data trails streaming off to the left.
// Simplified from the full logo so it stays readable at QR-centre size. Drawn on a 100 x 100 grid.
// Returns SVG markup (no <svg> wrapper) placed with a transform, so it can sit inside the QR.

const BLUE_1 = '#22C7F0';
const BLUE_2 = '#2457E6';

// One silhouette: left leg, shoulders, profile head, right leg, and the two notches of the M
const SILHOUETTE = 'M14 94V58L28 52L40 47L42 40L36 30L34 20L36 12L46 4L58 4L66 12L67 20L72 26L66 29L67 33L63 37L61 42L70 44L84 38H98V94H84V64L56 94L28 64V94Z';

// Low-poly facet lines inside the head and torso
const FACETS = [
    'M46 4L44 18', 'M44 18L58 12', 'M58 12L66 12', 'M44 18L52 28', 'M52 28L66 26', 'M58 12L52 28', 'M52 28L55 40', 'M36 30L52 28',
    'M36 12L44 18', 'M36 30L44 18', 'M58 4L58 12', 'M67 20L66 26', 'M52 28L63 37', 'M55 40L61 42', 'M44 18L40 26',
    'M28 52L46 58', 'M40 47L46 58', 'M61 42L46 58', 'M46 58L28 64', 'M46 58L56 94', 'M61 42L72 60', 'M72 60L56 94', 'M84 38L72 60', 'M72 60L84 64',
    'M28 52L28 64', 'M40 47L36 56', 'M36 56L28 64', 'M36 56L46 58', 'M46 58L40 62', 'M70 44L72 60', 'M56 94L36 74', 'M46 58L56 76', 'M56 76L72 60', 'M56 76L40 62', 'M36 74L28 64',
];

export function miniYouMark({ x = 0, y = 0, size = 100, id = 'mk', trails = true } = {}) {
    const s = size / 100;
    return `<g transform="translate(${x} ${y}) scale(${s})">`
        + `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE_1}"/><stop offset="1" stop-color="${BLUE_2}"/></linearGradient></defs>`
        + (trails
            ? `<g stroke="${BLUE_1}" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M2 30H20"/><path d="M8 40H26"/><path d="M0 50H18"/></g>`
            + `<g fill="${BLUE_1}"><circle cx="23" cy="30" r="2.3"/><circle cx="29" cy="40" r="2.3"/><circle cx="21" cy="50" r="2.3"/><circle cx="12" cy="20" r="1.8"/><circle cx="24" cy="18" r="1.5"/></g>`
            : '')
        + `<path d="${SILHOUETTE}" fill="url(#${id}f)"/>`
        + `<g stroke="#fff" stroke-opacity="0.55" stroke-width="0.8" fill="none" stroke-linejoin="round">${FACETS.map((d) => `<path d="${d}"/>`).join('')}</g>`
        + `</g>`;
}

// Neon outline version: the same bust-M drawn as glowing lines, in the card theme's own colours.
// Meant for a dark badge, like the original logo artwork. c1/c2 should be bright colours.
export function neonMark({ x = 0, y = 0, size = 100, id = 'nm', c1 = BLUE_1, c2 = BLUE_2 } = {}) {
    const s = size / 100;
    const stroke = `url(#${id}s)`;
    return `<g transform="translate(${x} ${y}) scale(${s})">`
        + `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`
        + `<g stroke="${c1}" stroke-width="2" stroke-linecap="round" fill="none"><path d="M2 30H20"/><path d="M8 40H26"/><path d="M0 50H18"/></g>`
        + `<g fill="${c1}"><circle cx="23" cy="30" r="2.2"/><circle cx="29" cy="40" r="2.2"/><circle cx="21" cy="50" r="2.2"/><circle cx="12" cy="20" r="1.7"/><circle cx="24" cy="18" r="1.4"/></g>`
        + `<path d="${SILHOUETTE}" fill="${stroke}" fill-opacity="0.16" stroke="${stroke}" stroke-width="3.2" stroke-opacity="0.28" stroke-linejoin="round"/>`
        + `<path d="${SILHOUETTE}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`
        + `<g stroke="${stroke}" stroke-opacity="0.85" stroke-width="0.9" fill="none" stroke-linejoin="round">${FACETS.map((d) => `<path d="${d}"/>`).join('')}</g>`
        + `</g>`;
}
