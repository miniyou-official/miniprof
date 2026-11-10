// Three more Innovation Workshop styles to choose from, beside the first one (Sprout, in HolographicCard.jsx):
//   Boardroom  deep burgundy with antique gold
//   Blueprint  midnight navy with amber and copper
//   Foundry    charcoal and warm ivory with terracotta and emerald
// Each style has the same four roles. Theme keys are ws_<style>_<role>. Plain data only; the artwork is in WorkshopStylesArt.jsx.

// rgba() string from a hex colour (cardThemes.js imports this file, so the helper is kept here)
const withAlpha = (hex, alpha) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const WS_STYLES = [
    { key: 'sprout', name: 'Sprout', note: 'Teal and lime: the lightbulb and sprout from the poster', themes: { speaker: 'ws_speaker', organizer: 'ws_organizer', panelist: 'ws_panelist', attendee: 'ws_attendee' } },
    { key: 'boardroom', name: 'Boardroom', note: 'Burgundy and antique gold: bold and premium', themes: { speaker: 'ws_boardroom_speaker', organizer: 'ws_boardroom_organizer', panelist: 'ws_boardroom_panelist', attendee: 'ws_boardroom_attendee' } },
    { key: 'blueprint', name: 'Blueprint', note: 'Midnight navy with amber and copper: funding and growth', themes: { speaker: 'ws_blueprint_speaker', organizer: 'ws_blueprint_organizer', panelist: 'ws_blueprint_panelist', attendee: 'ws_blueprint_attendee' } },
    { key: 'foundry', name: 'Foundry', note: 'Charcoal and ivory with terracotta and emerald: industry and craft', themes: { speaker: 'ws_foundry_speaker', organizer: 'ws_foundry_organizer', panelist: 'ws_foundry_panelist', attendee: 'ws_foundry_attendee' } },
];

// One palette per theme. light = a pale card (dark text on light panels), the way the panelist cards work.
const P = {
    ws_boardroom_speaker: { bg: '#4A0E1C', text: '#FFF6E5', g1: '#D4AF37', g2: '#8E1B33', face: 'radial-gradient(380px 260px at 86% 10%, rgba(212,175,55,0.26), transparent 70%), linear-gradient(165deg, #3A0A16 0%, #5A1224 55%, #6E1A2E 100%)', accent: '#E6C25A', btnBg: 'rgba(58,10,22,0.82)', primary: 'linear-gradient(120deg, #E6C25A, #B88A2A)', onPrimary: '#3A0A16', ring: 'conic-gradient(#E6C25A, #8E1B33, #FFF1C2, #E6C25A)' },
    ws_boardroom_organizer: { bg: '#2B0A12', text: '#FFF6E5', g1: '#B8923A', g2: '#6B1428', face: 'radial-gradient(380px 260px at 86% 10%, rgba(184,146,58,0.18), transparent 70%), linear-gradient(165deg, #200710 0%, #340E1B 55%, #461523 100%)', accent: '#C9A24B', btnBg: 'rgba(32,7,16,0.85)', primary: 'linear-gradient(120deg, #C9A24B, #8A6A22)', onPrimary: '#1E0710', ring: 'conic-gradient(#C9A24B, #6B1428, #E8D29A, #C9A24B)' },
    ws_boardroom_panelist: { light: true, bg: '#F6EBD9', text: '#5A1424', g1: '#8E1B33', g2: '#C9A24B', face: 'radial-gradient(360px 240px at 85% 8%, rgba(255,255,255,0.9), transparent 70%), linear-gradient(170deg, #FBF3E4 0%, #F2E4CC 55%, #E8D4B2 100%)', accent: '#8E1B33', btnBg: '#5A1424', primary: '#8E1B33', onPrimary: '#FFFFFF', ring: 'conic-gradient(#8E1B33, #C9A24B, #F1DFB6, #8E1B33)' },
    ws_boardroom_attendee: { bg: '#7A1B34', text: '#FFF6E5', g1: '#F2D98A', g2: '#C9A24B', face: 'radial-gradient(380px 260px at 84% 12%, rgba(242,217,138,0.28), transparent 70%), linear-gradient(165deg, #6A1228 0%, #8A2140 55%, #A02C4C 100%)', accent: '#F2D98A', btnBg: 'rgba(74,14,28,0.82)', primary: 'linear-gradient(120deg, #F2D98A, #D4AF37)', onPrimary: '#4A0E1C', ring: 'conic-gradient(#F2D98A, #C9A24B, #FFFFFF, #F2D98A)' },

    ws_blueprint_speaker: { bg: '#07142B', text: '#FFFFFF', g1: '#FFB020', g2: '#2A6BFF', face: 'radial-gradient(380px 260px at 86% 10%, rgba(255,176,32,0.22), transparent 70%), linear-gradient(165deg, #050F22 0%, #0A1E3F 55%, #102A55 100%)', accent: '#FFB020', btnBg: 'rgba(5,15,34,0.84)', primary: 'linear-gradient(120deg, #FFB020, #FF7A2F)', onPrimary: '#1A1204', ring: 'conic-gradient(#FFB020, #2A6BFF, #FFE2A0, #FFB020)' },
    ws_blueprint_organizer: { bg: '#050D1F', text: '#FFFFFF', g1: '#E8914A', g2: '#5AB8FF', face: 'radial-gradient(380px 260px at 86% 10%, rgba(232,145,74,0.16), transparent 70%), linear-gradient(165deg, #040A18 0%, #071632 55%, #0A2040 100%)', accent: '#E8914A', btnBg: 'rgba(4,10,24,0.86)', primary: 'linear-gradient(120deg, #E8914A, #B85F22)', onPrimary: '#150A02', ring: 'conic-gradient(#E8914A, #5AB8FF, #FFD3A8, #E8914A)' },
    ws_blueprint_panelist: { light: true, bg: '#EAF0F8', text: '#0B1F44', g1: '#C96F2B', g2: '#0B1F44', face: 'radial-gradient(360px 240px at 85% 8%, rgba(255,255,255,0.92), transparent 70%), linear-gradient(170deg, #F3F7FC 0%, #E4ECF7 55%, #D3DFF0 100%)', accent: '#C96F2B', btnBg: '#0B1F44', primary: '#0B1F44', onPrimary: '#FFFFFF', ring: 'conic-gradient(#0B1F44, #C96F2B, #CFE0F5, #0B1F44)' },
    ws_blueprint_attendee: { bg: '#0F2A5A', text: '#FFFFFF', g1: '#FFC857', g2: '#5AB8FF', face: 'radial-gradient(380px 260px at 84% 12%, rgba(90,184,255,0.26), transparent 70%), linear-gradient(165deg, #0B2250 0%, #133A7A 55%, #1B4F9C 100%)', accent: '#FFC857', btnBg: 'rgba(11,34,80,0.84)', primary: 'linear-gradient(120deg, #FFC857, #5AB8FF)', onPrimary: '#0B1F44', ring: 'conic-gradient(#FFC857, #5AB8FF, #FFFFFF, #FFC857)' },

    ws_foundry_speaker: { bg: '#1E2123', text: '#F7F1E5', g1: '#EF7F52', g2: '#2DBE8A', face: 'radial-gradient(380px 260px at 86% 10%, rgba(224,105,60,0.22), transparent 70%), linear-gradient(165deg, #171A1C 0%, #23272A 55%, #2D3236 100%)', accent: '#EF7F52', btnBg: 'rgba(23,26,28,0.86)', primary: 'linear-gradient(120deg, #EF7F52, #C4522A)', onPrimary: '#1A0D07', ring: 'conic-gradient(#EF7F52, #F7F1E5, #2DBE8A, #EF7F52)' },
    ws_foundry_organizer: { bg: '#121415', text: '#F4EEE2', g1: '#3FD1A0', g2: '#E0693C', face: 'radial-gradient(380px 260px at 86% 10%, rgba(45,190,138,0.18), transparent 70%), linear-gradient(165deg, #0C0E0F 0%, #16191B 55%, #1E2325 100%)', accent: '#3FD1A0', btnBg: 'rgba(12,14,15,0.88)', primary: 'linear-gradient(120deg, #3FD1A0, #1E9A72)', onPrimary: '#06201A', ring: 'conic-gradient(#3FD1A0, #E0693C, #F4EEE2, #3FD1A0)' },
    ws_foundry_panelist: { light: true, bg: '#F4EEE2', text: '#2A2C2E', g1: '#1E8E6A', g2: '#D9663D', face: 'radial-gradient(360px 240px at 85% 8%, rgba(255,255,255,0.92), transparent 70%), linear-gradient(170deg, #FAF6EC 0%, #F0E9DA 55%, #E4DAC6 100%)', accent: '#1E8E6A', btnBg: '#2A2C2E', primary: '#1E8E6A', onPrimary: '#FFFFFF', ring: 'conic-gradient(#1E8E6A, #D9663D, #F4EEE2, #1E8E6A)' },
    ws_foundry_attendee: { bg: '#2A2622', text: '#FFF4E6', g1: '#F5A07A', g2: '#F7D9A8', face: 'radial-gradient(380px 260px at 84% 12%, rgba(240,138,93,0.26), transparent 70%), linear-gradient(165deg, #231F1B 0%, #34302A 55%, #443E36 100%)', accent: '#F5A07A', btnBg: 'rgba(35,31,27,0.86)', primary: 'linear-gradient(120deg, #F5A07A, #E0693C)', onPrimary: '#1F0F08', ring: 'conic-gradient(#F5A07A, #F7D9A8, #FFFFFF, #F5A07A)' },
};

const ROLE_NAME = { speaker: 'Speaker', organizer: 'Organizer', panelist: 'Panelist', attendee: 'Attendee' };
const STYLE_NAME = { boardroom: 'Boardroom', blueprint: 'Blueprint', foundry: 'Foundry' };

// CARD_THEMES entries (hidden from the look picker, like the other role themes)
export const WS_EXTRA_THEMES = Object.fromEntries(Object.entries(P).map(([key, p]) => {
    const [, style, role] = key.split('_');
    return [key, { name: `Workshop ${STYLE_NAME[style]} ${ROLE_NAME[role]}`, free: false, rmcOnly: true, colors: { background: p.bg, text: p.text, gradientStart: p.g1, gradientEnd: p.g2 } }];
}));

// CARD_STYLE entries: which artwork and particles each theme uses
export const WS_EXTRA_CARD_STYLE = Object.fromEntries(Object.entries(P).map(([key, p]) => [key, { deco: key.replace(/_/g, ''), particle: p.light ? 'mote' : 'firefly', bannerOpacity: 0 }]));

// The styles for one theme, written in the same pattern as the other role themes
function themeCss(key, p) {
    const t = `.mu-card[data-theme='${key}']`;
    const a = (n) => withAlpha(p.accent, n);
    const rules = [
        `${t} .mu-face { background: ${p.face}; border-color: ${p.light ? withAlpha(p.text, 0.28) : a(0.42)}; }`,
        `${t} .mu-ring::before { background: ${p.ring}; }`,
        `${t} .mu-panel { background: ${p.light ? 'rgba(255,255,255,0.55)' : a(0.08)}; border: 1px solid ${p.light ? withAlpha(p.accent, 0.35) : a(0.45)}; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }`,
        `${t} .mu-panel-title { color: ${p.accent}; }`,
        `${t} .mu-primary { background: ${p.primary}; color: ${p.onPrimary}; }`,
    ];
    if (p.light) {
        rules.push(
            `${t} .mu-handle { background: rgba(255,255,255,0.9); color: ${p.text}; border-color: ${withAlpha(p.text, 0.25)}; }`,
            `${t} .mu-tag { background: rgba(255,255,255,0.78); color: ${p.text}; border-color: ${withAlpha(p.text, 0.25)}; }`,
            `${t} .mu-bio, ${t} .mu-meta { color: ${p.text}; }`,
            `${t} .mu-links > button { color: #fff !important; background-color: ${p.btnBg} !important; box-shadow: none !important; }`,
            `${t} .mu-ghost { background: rgba(255,255,255,0.75); color: ${p.text}; border: 1.5px solid ${withAlpha(p.text, 0.4)}; }`,
        );
    } else {
        rules.push(
            `${t} .mu-handle, ${t} .mu-tag { color: ${p.accent}; border-color: ${a(0.55)}; background: ${a(0.10)}; }`,
            `${t} .mu-links > button { color: ${p.accent} !important; background-color: ${p.btnBg} !important; box-shadow: inset 0 0 0 1.5px ${a(0.65)} !important; }`,
            `${t} .mu-ghost { background: ${p.btnBg}; color: #fff; border: 1.5px solid ${a(0.6)}; }`,
        );
    }
    // Foundry: cog wheels are drawn right behind the name, so give it an outline in the card colour and a soft halo
    if (key.startsWith('ws_foundry_')) {
        const halo = p.light ? '255,255,255' : '12,14,15';
        rules.push(`${t} .mu-name { font-weight: 900; -webkit-text-stroke: 5px ${p.light ? '#FAF6EC' : p.bg}; paint-order: stroke fill; text-shadow: 0 0 14px rgba(${halo},0.95), 0 0 28px rgba(${halo},0.85), 0 2px 6px rgba(${halo},0.9); }`);
    }
    return rules.join('\n');
}

// The styles for each extra theme, keyed by theme key. Only the showing theme's styles are added to a card.
export const WS_EXTRA_CSS = Object.fromEntries(Object.entries(P).map(([key, p]) => [key, themeCss(key, p)]));
