// Distinct looks for the main card themes. Each theme gets its own artwork, banner, panels, type and details,
// scoped by data-theme on .mu-card, so the shared card structure stays one piece of code.
// Fonts load only for the theme that needs them.

const fam = (q) => `@import url('https://fonts.googleapis.com/css2?${q}&display=swap');`;

export const THEME_FONT_IMPORT = {
    cyberpunk: fam('family=Orbitron:wght@700;900&family=Rajdhani:wght@500;700'),
    anime: fam('family=Cormorant+Garamond:ital,wght@0,600;1,700'),
    bookreader: fam('family=Playfair+Display:wght@600;800&family=Libre+Baskerville:wght@400;700'),
    marvel: fam('family=Orbitron:wght@700;900&family=Rajdhani:wght@500;700'),
    professional: fam('family=Playfair+Display:wght@600;800'),
    suitwoman: fam('family=Playfair+Display:wght@600;800'),
};

/* ------------------------------ Cyberpunk: neon city at night ------------------------------ */

function NeonCityArt() {
    const towers = [[0, 70, 30], [26, 104, 24], [48, 62, 28], [74, 124, 22], [94, 82, 30], [122, 112, 26], [146, 66, 30], [174, 132, 24], [196, 92, 28], [222, 72, 26], [246, 120, 30], [274, 86, 24], [296, 128, 28], [322, 78, 26], [346, 106, 30], [374, 68, 26]];
    return (
        <>
            <div className="nb-floor" />
            <svg className="nb-city" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="nbF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="var(--g1)" stopOpacity="0.55" />
                        <stop offset="1" stopColor="var(--g1)" stopOpacity="0.04" />
                    </linearGradient>
                    <pattern id="nbW" width="6" height="8" patternUnits="userSpaceOnUse"><rect x="1.6" y="2" width="2" height="3" fill="var(--g2)" /></pattern>
                </defs>
                {towers.map(([x, h, w], i) => (
                    <g key={i}>
                        <rect x={x} y={140 - h} width={w} height={h} fill="url(#nbF)" />
                        <rect x={x} y={140 - h} width={w} height={h} fill="url(#nbW)" opacity={i % 3 ? 0.35 : 0.75} />
                        <rect x={x} y={140 - h} width={w} height="1.4" fill="var(--g2)" opacity="0.8" />
                    </g>
                ))}
            </svg>
            <div className="nb-rain" />
            <div className="nb-sweep" />
        </>
    );
}

/* ------------------------------ Sakura: rose cherry blossom, ink-wash hills, moon ------------------------------ */

function Blossom({ x, y, s = 1, r = 0, o = 1 }) {
    return (
        <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
            {[0, 72, 144, 216, 288].map((a) => (
                <path key={a} transform={`rotate(${a})`} d="M0 0 C -10 -6, -11 -19, -3 -23 L0 -20 L3 -23 C 11 -19, 10 -6, 0 0 Z" fill="url(#skP)" />
            ))}
            <circle r="3" fill="#FFD36B" />
            {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6.5} cy={Math.sin((a * Math.PI) / 180) * 6.5} r="0.9" fill="#FFF0B8" />)}
        </g>
    );
}

function SakuraArt() {
    return (
        <>
            <svg className="sk-moon" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="56" fill="#FFD9E4" opacity="0.07" />
                <circle cx="60" cy="60" r="42" fill="#FFE6EE" opacity="0.12" />
                <circle cx="60" cy="60" r="30" fill="#FFF3F7" opacity="0.5" />
            </svg>
            <svg className="sk-branch mu-sway" viewBox="0 0 300 190" aria-hidden="true" style={{ '--sd': '0s' }}>
                <defs>
                    <radialGradient id="skP" cx="50%" cy="85%" r="90%">
                        <stop offset="0" stopColor="#FF6E9C" />
                        <stop offset="0.55" stopColor="#FFA3C0" />
                        <stop offset="1" stopColor="#FFE3EC" />
                    </radialGradient>
                </defs>
                <path d="M300 14 C 250 26, 232 62, 184 72 C 146 80, 124 106, 84 112" fill="none" stroke="#4A2230" strokeWidth="5" strokeLinecap="round" />
                <path d="M232 52 C 222 78, 226 98, 208 126" fill="none" stroke="#4A2230" strokeWidth="3.4" strokeLinecap="round" />
                <path d="M184 72 C 176 56, 160 48, 146 30" fill="none" stroke="#4A2230" strokeWidth="3" strokeLinecap="round" />
                <path d="M120 100 C 112 124, 96 138, 86 160" fill="none" stroke="#4A2230" strokeWidth="2.6" strokeLinecap="round" />
                <Blossom x={262} y={24} s={1.1} r={10} />
                <Blossom x={238} y={52} s={0.95} r={-20} />
                <Blossom x={206} y={78} s={1.15} r={30} />
                <Blossom x={184} y={64} s={0.8} r={50} o={0.9} />
                <Blossom x={146} y={30} s={0.85} r={-10} />
                <Blossom x={150} y={92} s={1} r={20} />
                <Blossom x={118} y={108} s={1.05} r={-30} />
                <Blossom x={208} y={126} s={0.9} r={40} />
                <Blossom x={92} y={114} s={0.8} r={10} o={0.9} />
                <Blossom x={86} y={160} s={0.85} r={-40} o={0.85} />
                <Blossom x={282} y={52} s={0.6} r={25} o={0.7} />
            </svg>
            {[0, 1].map((k) => (
                <svg key={k} className={`sk-lantern sk-l${k + 1}`} viewBox="0 0 46 120" aria-hidden="true">
                    <defs>
                        <radialGradient id="skLn" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#FF8A5C" /><stop offset="0.6" stopColor="#E0242F" /><stop offset="1" stopColor="#8F0F1C" /></radialGradient>
                    </defs>
                    <path d="M23 0 V30" stroke="#E6C879" strokeWidth="1.4" />
                    <rect x="14" y="28" width="18" height="5" rx="1.5" fill="#E6C879" />
                    <ellipse cx="23" cy="52" rx="19" ry="21" fill="url(#skLn)" />
                    <path d="M23 31 C 12 40, 12 64, 23 73 M23 31 C 34 40, 34 64, 23 73" fill="none" stroke="#8F0F1C" strokeOpacity="0.5" />
                    <rect x="14" y="71" width="18" height="5" rx="1.5" fill="#E6C879" />
                    <path d="M23 76 V100 M18 76 V94 M28 76 V94" stroke="#E6C879" strokeWidth="1.3" />
                    <circle cx="23" cy="102" r="2" fill="#E6C879" />
                </svg>
            ))}
            <svg className="sk-pagoda" viewBox="0 0 80 120" aria-hidden="true">
                <path d="M40 0 L40 12 M12 40 L40 14 L68 40 Z M18 64 L40 42 L62 64 Z M8 92 L40 68 L72 92 Z M14 92 V120 H66 V92" fill="#FFE3EC" />
            </svg>
            <svg className="sk-hills" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 92 C 50 40, 90 70, 130 56 C 180 36, 210 84, 260 62 C 310 40, 350 70, 400 50 L400 140 L0 140Z" fill="#FFC1D6" opacity="0.07" />
                <path d="M0 112 C 60 76, 110 104, 170 88 C 230 70, 280 108, 340 92 C 370 84, 390 90, 400 88 L400 140 L0 140Z" fill="#FF8FB4" opacity="0.1" />
                <path d="M0 128 C 90 108, 160 134, 250 118 C 320 106, 360 124, 400 116 L400 140 L0 140Z" fill="#FFE3EC" opacity="0.1" />
            </svg>
        </>
    );
}

/* ------------------------------ Book Reader: a real book (parchment, spine, ribbon, page edge, curl) ------------------------------ */

function BookArt() {
    return (
        <>
            <div className="bk-spine" />
            <div className="bk-gutter" />
            <svg className="bk-ribbon" viewBox="0 0 34 140" aria-hidden="true">
                <path d="M0 0H34V140L17 118L0 140Z" fill="#9b1c2c" />
                <path d="M0 0H8V132L0 140Z" fill="#000" opacity="0.18" />
                <path d="M17 0V116" stroke="#000" strokeOpacity="0.2" />
            </svg>
            <svg className="bk-curl" viewBox="0 0 70 70" aria-hidden="true">
                <defs>
                    <linearGradient id="bkC" x1="1" y1="1" x2="0" y2="0">
                        <stop offset="0" stopColor="#d8c394" />
                        <stop offset="1" stopColor="#f7edd6" />
                    </linearGradient>
                </defs>
                <path d="M70 0 L0 70 H70 Z" fill="url(#bkC)" />
                <path d="M70 0 L0 70 L16 70 Z" fill="#000" opacity="0.12" />
            </svg>
            {['tl', 'tr', 'bl'].map((c) => (
                <svg key={c} className={`bk-orn bk-${c}`} viewBox="0 0 40 40" aria-hidden="true">
                    <path d="M2 2 H22 M2 2 V22 M2 2 C 14 6, 18 10, 22 22 M8 8 C 14 8, 16 12, 16 16" fill="none" stroke="#B8862B" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="26" cy="26" r="1.6" fill="#B8862B" />
                </svg>
            ))}
        </>
    );
}

/* ------------------------------ Iron Man: armour plate, HUD readouts, arc reactor ------------------------------ */

function ArmorArt() {
    return (
        <>
            <svg className="am-mesh" width="100%" height="100%" aria-hidden="true">
                <defs>
                    <pattern id="amHex" width="22" height="38" patternUnits="userSpaceOnUse">
                        <path d="M11 0 L22 6.3 V19 L11 25.3 L0 19 V6.3 Z M11 25.3 V38 M0 19 V31.7 M22 19 V31.7" fill="none" stroke="#F0B323" strokeOpacity="0.09" />
                    </pattern>
                    <linearGradient id="amFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.45" stopColor="#fff" /><stop offset="1" stopColor="#fff" /></linearGradient>
                    <mask id="amM"><rect width="100%" height="100%" fill="url(#amFade)" /></mask>
                </defs>
                <rect width="100%" height="100%" fill="url(#amHex)" mask="url(#amM)" />
            </svg>
            <div className="am-scan" />
            <svg className="am-hud" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                <g fontFamily="Rajdhani, monospace" fontSize="8" fill="#F0B323" opacity="0.75" letterSpacing="1.4">
                    <text x="14" y="98">SYSTEM ONLINE</text>
                    <text x="14" y="110">PWR 100%</text>
                    <text x="386" y="98" textAnchor="end">ARMOUR  OK</text>
                    <text x="386" y="110" textAnchor="end">LINK  SECURE</text>
                </g>
                <path d="M14 84 H70 M330 84 H386" stroke="#4FD8FF" strokeOpacity="0.6" />
                <path d="M170 116 H230" stroke="#F0B323" strokeOpacity="0.55" strokeWidth="2" />
            </svg>
            <span className="mu-corner mu-c-tl" /><span className="mu-corner mu-c-tr" />
            <span className="mu-corner mu-c-bl" /><span className="mu-corner mu-c-br" />
        </>
    );
}

/* ------------------------------ Suit: tailored pinstripe, lapels, shirt, tie ------------------------------ */

function SuitArt() {
    return (
        <>
        <div className="st-seam" />
        <svg className="st-lapels" viewBox="0 0 400 150" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
            <defs>
                <linearGradient id="stL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c3446" /><stop offset="1" stopColor="#10141d" /></linearGradient>
                <linearGradient id="stR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c3446" /><stop offset="1" stopColor="#10141d" /></linearGradient>
                <linearGradient id="stT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--g2)" /><stop offset="1" stopColor="#4d1220" /></linearGradient>
            </defs>
            <path d="M0 0 H400 V150 H0 Z" fill="#141925" />
            <path d="M200 142 L128 34 L146 0 H0 V150 Z" fill="url(#stL)" />
            <path d="M200 142 L272 34 L254 0 H400 V150 Z" fill="url(#stR)" />
            <path d="M128 34 L146 0 L170 0 L146 46 Z" fill="#323b50" />
            <path d="M272 34 L254 0 L230 0 L254 46 Z" fill="#323b50" />
            <path d="M146 0 H254 L200 142 Z" fill="#F4F1EA" />
            <path d="M170 0 L200 30 L230 0 Z" fill="#E4E0D6" />
            <path d="M184 22 H216 L222 42 L200 50 L178 42 Z" fill="url(#stT)" />
            <path d="M178 42 L200 50 L222 42 L232 112 L200 128 L168 112 Z" fill="url(#stT)" />
            <path d="M200 50 V126" stroke="#000" strokeOpacity="0.2" />
            <circle cx="104" cy="52" r="5" fill="#C9A24B" /><circle cx="104" cy="52" r="2" fill="#7a5d1c" />
        </svg>
        </>
    );
}

/* ------------------------------ Suit (women): tailored blazer, silk blouse, pearls, brooch ------------------------------ */

function SuitWomanArt() {
    const pearls = [];
    for (let i = 0; i <= 12; i += 1) {
        const t = i / 12;
        pearls.push([160 + 80 * t, 6 + 54 * Math.sin(Math.PI * t)]);
    }
    return (
        <>
            <div className="st-seam" />
            <svg className="st-lapels" viewBox="0 0 400 150" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
                <defs>
                    <linearGradient id="swL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a2a3c" /><stop offset="1" stopColor="#1d111b" /></linearGradient>
                    <linearGradient id="swR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a2a3c" /><stop offset="1" stopColor="#1d111b" /></linearGradient>
                    <radialGradient id="swP" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d9c9c2" /></radialGradient>
                </defs>
                <path d="M0 0 H400 V150 H0 Z" fill="#1a0f18" />
                <path d="M200 146 L112 30 L134 0 H0 V150 Z" fill="url(#swL)" />
                <path d="M200 146 L288 30 L266 0 H400 V150 Z" fill="url(#swR)" />
                <path d="M112 30 L134 0 L160 0 L132 44 Z" fill="#5a3649" />
                <path d="M288 30 L266 0 L240 0 L268 44 Z" fill="#5a3649" />
                <path d="M150 0 H250 L200 128 Z" fill="#F8EFE8" />
                <path d="M150 0 Q200 26 250 0 L200 128 Z" fill="#EBDDD3" opacity="0.7" />
                {pearls.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.4" fill="url(#swP)" />)}
                <g transform="translate(106 58)">
                    {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 5} cy={Math.sin((a * Math.PI) / 180) * 5} r="3.2" fill="#E0B4A4" />)}
                    <circle r="2.6" fill="#9C3D54" />
                </g>
            </svg>
        </>
    );
}

/* ------------------------------ Frames drawn around the profile photo ------------------------------ */

const rad = (d) => (d * Math.PI) / 180;
const pt = (deg, r) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r];
const PETAL = 'M0 0 C -10 -6, -11 -19, -3 -23 L0 -20 L3 -23 C 11 -19, 10 -6, 0 0 Z';

function MarvelFx() {
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="fx-cw"><circle r="91" fill="none" stroke="#F0B323" strokeOpacity="0.75" strokeWidth="1.6" strokeDasharray="2 5.4" /></g>
            <g className="fx-ccw"><circle r="82" fill="none" stroke="#4FD8FF" strokeWidth="3" strokeDasharray="46 22" strokeOpacity="0.85" /></g>
            <circle r="97" fill="none" stroke="#F0B323" strokeOpacity="0.35" strokeWidth="0.8" />
            {[0, 90, 180, 270].map((a) => { const [x, y] = pt(a, 99); return <path key={a} d="M-5 0 L5 0 L0 -7 Z" transform={`translate(${x} ${y}) rotate(${a + 90})`} fill="#4FD8FF" />; })}
            {[45, 135, 225, 315].map((a) => { const [x, y] = pt(a, 95); return <circle key={a} cx={x} cy={y} r="1.8" fill="#F0B323" />; })}
        </svg>
    );
}

function CyberFx() {
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="fx-cw"><circle r="84" fill="none" stroke="#FF2E9A" strokeWidth="1.6" strokeDasharray="14 9" strokeOpacity="0.9" /></g>
            <g className="fx-ccw"><circle r="92" fill="none" stroke="#19E3FF" strokeWidth="1" strokeDasharray="3 8" /></g>
            {[[-1, -1], [1, -1]].map(([sx, sy]) => (
                <path key={`${sx}${sy}`} d={`M${sx * 70} ${sy * 94} H${sx * 94} V${sy * 70}`} fill="none" stroke="#19E3FF" strokeWidth="2.4" strokeLinecap="square" className="fx-flick" />
            ))}
        </svg>
    );
}

function SakuraFx() {
    const spots = [[104, 66, 0.7], [128, 64, 0.95], [152, 63, 0.75], [176, 64, 1.05], [200, 66, 0.8], [226, 67, 0.7], [-34, 66, 0.8], [-14, 68, 0.6], [20, 70, 0.55]];
    return (
        <svg className="mu-fx fx-sway" viewBox="-100 -100 200 200" aria-hidden="true">
            <defs>
                <radialGradient id="skP2" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#FF6E9C" /><stop offset="0.55" stopColor="#FFA3C0" /><stop offset="1" stopColor="#FFE3EC" /></radialGradient>
            </defs>
            <path d="M-40 52 A66 66 0 0 0 40 52" fill="none" stroke="#6B2C3F" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            {spots.map(([a, r, sc]) => {
                const [x, y] = pt(a, r);
                return (
                    <g key={a} transform={`translate(${x} ${y}) rotate(${a + 90}) scale(${sc})`}>
                        {[0, 72, 144, 216, 288].map((d) => <path key={d} transform={`rotate(${d})`} d={PETAL} fill="url(#skP2)" />)}
                        <circle r="3" fill="#FFD36B" />
                    </g>
                );
            })}
        </svg>
    );
}

function BookFx() {
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <defs>
                <radialGradient id="bkW" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#d6384a" /><stop offset="0.6" stopColor="#9b1c2c" /><stop offset="1" stopColor="#5e0f1b" /></radialGradient>
            </defs>
            <g transform="translate(56 22)" style={{ filter: 'drop-shadow(1px 3px 3px rgba(0,0,0,.45))' }}>
                <path d="M0 -17 C 9 -19, 15 -14, 17 -6 C 20 2, 16 12, 8 16 C 0 20, -10 18, -15 10 C -20 2, -17 -12, 0 -17Z" fill="url(#bkW)" />
                <circle r="11" fill="none" stroke="#e86a78" strokeOpacity="0.55" strokeWidth="1.2" />
                <path d="M0 -6 L1.8 -1.6 L6.4 -1.4 L2.8 1.4 L4 6 L0 3.4 L-4 6 L-2.8 1.4 L-6.4 -1.4 L-1.8 -1.6 Z" fill="#e86a78" fillOpacity="0.75" />
            </g>
        </svg>
    );
}

function SuitFx() {
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            {[1, -1].map((m) => (
                <g key={m} transform={`scale(${m} 1)`}>
                    <path d="M-34 56 A64 64 0 0 0 -64 4" fill="none" stroke="#C9A24B" strokeWidth="1.8" strokeLinecap="round" />
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                        const a = 112 + i * 17;
                        const [x, y] = pt(a, 64);
                        return <ellipse key={i} cx={x} cy={y} rx="9" ry="3.6" transform={`rotate(${a + (i % 2 ? 30 : -30)} ${x} ${y})`} fill={i % 2 ? '#E6C879' : '#C9A24B'} opacity="0.95" />;
                    })}
                </g>
            ))}
        </svg>
    );
}

function SuitWomanFx() {
    const pearls = [];
    for (let i = 0; i < 13; i += 1) pearls.push(pt(26 + i * 11.5, 66));
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <defs>
                <radialGradient id="swP2" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d9c9c2" /></radialGradient>
            </defs>
            {pearls.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.6" fill="url(#swP2)" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))' }} />)}
            <circle r="76" fill="none" stroke="#E0B4A4" strokeOpacity="0.55" strokeWidth="1" />
        </svg>
    );
}

export const RING_FX = { marvel: MarvelFx, professional: SuitFx, suitwoman: SuitWomanFx, cyberpunk: CyberFx, anime: SakuraFx, bookreader: BookFx };

/* ------------------------------ IEEE RMC: signal rings and a circuit grid in the role's accent ------------------------------ */

export const DESIGN_ART = { neoncity: NeonCityArt, sakura: SakuraArt, book: BookArt, armor: ArmorArt, suit: SuitArt, suitwoman: SuitWomanArt };

/* ------------------------------ Styles ------------------------------ */

export const THEME_CSS = `
.mu-card[data-theme='professional'] .mu-particles, .mu-card[data-theme='suitwoman'] .mu-particles { display: none; }

/* ----- frames around the photo ----- */
.mu-ring .mu-fx { position: absolute; left: 50%; top: 50%; width: 214px; height: 214px; margin: -107px 0 0 -107px; z-index: 3; pointer-events: none; overflow: visible; }
.mu-card[data-theme='marvel'] .mu-ring .mu-fx, .mu-card[data-theme='cyberpunk'] .mu-ring .mu-fx { width: 186px; height: 186px; margin: -93px 0 0 -93px; }
.fx-cw { transform-origin: 0 0; animation: fxSpin 30s linear infinite; }
.fx-ccw { transform-origin: 0 0; animation: fxSpin 21s linear infinite reverse; }
.fx-fast { animation-duration: 9s; }
.fx-sway { animation: fxSway 6s ease-in-out infinite; }
.fx-flick { animation: fxFlick 3.4s steps(1) infinite; }
@keyframes fxSpin { to { transform: rotate(360deg); } }
@keyframes fxSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes fxFlick { 0%, 90%, 100% { opacity: 1; } 93% { opacity: .2; } 96% { opacity: .8; } }
@keyframes bkOpen { from { opacity: 0; transform: perspective(1400px) rotateY(-62deg); transform-origin: 0 50%; } to { opacity: 1; transform: none; } }
@keyframes amPulse { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
.mu-card[data-theme='bookreader'] .mu-enter { animation: bkOpen 1000ms cubic-bezier(.22,.61,.36,1) forwards; }
.mu-card[data-theme='marvel'] .mu-ring::after { animation: amPulse 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fx-cw, .fx-ccw, .fx-sway, .fx-flick, .sk-lantern, .nb-rain, .mu-card[data-theme='bookreader'] .mu-enter, .mu-card[data-theme='marvel'] .mu-ring::after { animation: none !important; } }

/* ===== Cyberpunk ===== */
.mu-card[data-theme='cyberpunk'] { font-family: 'Rajdhani', system-ui, sans-serif; }
.mu-card[data-theme='cyberpunk'] .mu-face { background: linear-gradient(180deg, #0a0820 0%, #07061A 52%, #12082a 100%); }
.mu-card[data-theme='cyberpunk'] .mu-banner { background: radial-gradient(circle at 50% 118%, #FFE27A 0 20%, #FF6B9A 21% 36%, transparent 37%), linear-gradient(180deg, #1a0a4a 0%, #6b1f8f 55%, #FF2E9A 100%); animation: none; }
.mu-card[data-theme='cyberpunk'] .mu-banner::before { background: repeating-linear-gradient(0deg, rgba(5,6,26,0.55) 0 2px, transparent 2px 7px); opacity: .9; }
.mu-card[data-theme='cyberpunk'] .mu-name { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(20px, 5.6vw, 26px); letter-spacing: .04em; text-shadow: 2px 0 rgba(255,46,154,.75), -2px 0 rgba(25,227,255,.75); animation: nbGlitch 7s steps(1) infinite; }
.mu-card[data-theme='cyberpunk'] .mu-handle, .mu-card[data-theme='cyberpunk'] .mu-tag, .mu-card[data-theme='cyberpunk'] .mu-panel, .mu-card[data-theme='cyberpunk'] .mu-btn { border-radius: 0; clip-path: polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px); }
.mu-card[data-theme='cyberpunk'] .mu-panel { background: linear-gradient(135deg, rgba(25,227,255,.09), rgba(255,46,154,.07)); border-color: rgba(25,227,255,.35); }
.mu-card[data-theme='cyberpunk'] .mu-panel-title { font-family: 'Orbitron', sans-serif; letter-spacing: .22em; color: #19E3FF; }
.mu-card[data-theme='cyberpunk'] .mu-btn { font-family: 'Orbitron', sans-serif; letter-spacing: .08em; font-size: 12px; }
.mu-card[data-theme='cyberpunk'] .mu-actions { border-radius: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(7,6,26,.94); border-color: rgba(25,227,255,.5); }
.mu-card[data-theme='cyberpunk'] .mu-ghost { background: #0d1030; color: #E8F6FF; border: 1.5px solid #19E3FF; }
.mu-card[data-theme='cyberpunk'] .mu-primary { background: linear-gradient(120deg, #FF2E9A, #7a3bff 60%, #19E3FF); color: #fff; }
.mu-card[data-theme='cyberpunk'] .mu-ring::before { background: conic-gradient(#FF2E9A, #19E3FF, #FFE27A, #FF2E9A); }
.nb-rain { position: absolute; inset: 0; opacity: .35; background-image: repeating-linear-gradient(100deg, rgba(25,227,255,.55) 0 1px, transparent 1px 26px); background-size: 100% 200%; animation: nbRain 1.1s linear infinite; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 40%, transparent); mask-image: linear-gradient(to bottom, transparent, #000 40%, transparent); }
@keyframes nbRain { to { background-position: -40px 100%; } }
.nb-floor { position: absolute; left: -20%; right: -20%; bottom: 0; height: 22%; transform: perspective(240px) rotateX(58deg); transform-origin: 50% 100%; opacity: .7; background-image: linear-gradient(rgba(255,46,154,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(25,227,255,.5) 1px, transparent 1px); background-size: 38px 38px; animation: nbFloor 3.2s linear infinite; -webkit-mask-image: linear-gradient(to top, #000 10%, transparent 95%); mask-image: linear-gradient(to top, #000 10%, transparent 95%); }
.nb-city { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 20%; opacity: .8; }
.nb-sweep { position: absolute; left: 0; right: 0; top: 0; height: 80px; background: linear-gradient(180deg, transparent, rgba(25,227,255,.09), transparent); animation: nbSweep 7s linear infinite; }
@keyframes nbFloor { to { background-position: 0 38px; } }
@keyframes nbSweep { from { transform: translateY(-80px); } to { transform: translateY(640px); } }
@keyframes nbGlitch { 0%, 92%, 100% { transform: none; } 93% { transform: translateX(2px); } 95% { transform: translateX(-2px) skewX(-4deg); } 97% { transform: translateX(1px); } }

/* ===== Sakura (anime) ===== */
.mu-card[data-theme='anime'] { font-family: 'Cormorant Garamond', Georgia, serif; }
.mu-card[data-theme='anime'] .mu-face { background: radial-gradient(520px 320px at 85% -6%, rgba(255,143,180,.32), transparent 70%), radial-gradient(420px 300px at 0% 100%, rgba(255,193,214,.16), transparent 70%), linear-gradient(172deg, #3b1329 0%, #2A0E1F 48%, #1c0914 100%); border-color: rgba(255,163,192,.45); }
.mu-card[data-theme='anime'] .mu-banner { background: linear-gradient(180deg, rgba(255,110,156,.28), transparent); animation: none; }
.mu-card[data-theme='anime'] .mu-banner::before { background: repeating-linear-gradient(45deg, rgba(255,255,255,.1) 0 1px, transparent 1px 13px), repeating-linear-gradient(-45deg, rgba(255,255,255,.1) 0 1px, transparent 1px 13px); }
.mu-card[data-theme='anime'] .mu-name { font-style: italic; font-weight: 700; font-size: clamp(26px, 7vw, 34px); color: #FFE3EC; text-shadow: 0 2px 18px rgba(255,110,156,.6); }
.mu-card[data-theme='anime'] .mu-handle { color: #FFB6CD; font-weight: 700; border-color: rgba(255,163,192,.5); }
.mu-card[data-theme='anime'] .mu-ring::before { background: conic-gradient(#FF6E9C, #FFE3EC, #FFA3C0, #FF6E9C); }
.mu-card[data-theme='anime'] .mu-meta, .mu-card[data-theme='anime'] .mu-bio { font-size: 15px; }
.mu-card[data-theme='anime'] .mu-tag { border-radius: 999px; border-color: rgba(255,163,192,.45); background: rgba(255,110,156,.1); }
.mu-card[data-theme='anime'] .mu-panel { border-radius: 24px; background: linear-gradient(160deg, rgba(255,193,214,.14), rgba(255,110,156,.06)); border-color: rgba(255,163,192,.4); }
.mu-card[data-theme='anime'] .mu-panel-title { font-style: italic; text-transform: none; letter-spacing: .12em; font-size: 14px; color: #FFB6CD; }
.mu-card[data-theme='anime'] .mu-btn { border-radius: 999px; font-family: inherit; font-size: 15px; font-weight: 700; }
.mu-card[data-theme='anime'] .mu-actions { background: rgba(42,14,31,.9); border-color: rgba(255,163,192,.45); }
.mu-card[data-theme='anime'] .mu-ghost { background: #3b1329; color: #FFE3EC; border: 1.5px solid rgba(255,163,192,.75); }
.mu-card[data-theme='anime'] .mu-primary { background: linear-gradient(120deg, #FF6E9C, #FFA3C0); color: #3b1329; }
.mu-card[data-theme='anime'] .mu-p[data-k='petal'] { width: calc(var(--ps) + 5px); height: calc(var(--ps) + 5px); background: linear-gradient(135deg, #FFE3EC, #FF8FB4); }
.sk-moon { position: absolute; top: 24px; left: -22px; width: 150px; height: 150px; }
.sk-branch { position: absolute; top: -6px; right: -8px; width: 72%; height: auto; transform-origin: 100% 0; }
.sk-lantern { position: absolute; top: 0; width: 46px; height: 120px; transform-origin: 50% 0; animation: skSwing 5s ease-in-out infinite; filter: drop-shadow(0 6px 10px rgba(255,60,60,.35)); }
.sk-l1 { left: 16px; } .sk-l2 { left: 62px; height: 86px; animation-delay: -2s; }
@keyframes skSwing { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
.sk-pagoda { position: absolute; right: 8px; bottom: 20%; width: 78px; opacity: .22; }
.sk-hills { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 26%; }

/* ===== Book Reader ===== */
.mu-card[data-theme='bookreader'] { font-family: 'Libre Baskerville', Georgia, serif; --ink-soft: rgba(59,42,26,.78); }
.mu-card[data-theme='bookreader'] .mu-face { background: radial-gradient(420px 260px at 90% 0%, rgba(184,134,43,.16), transparent 70%), repeating-linear-gradient(0deg, rgba(120,80,30,.05) 0 1px, transparent 1px 5px), linear-gradient(100deg, #E8D8B2 0%, #F6ECD3 7%, #F4E9D0 55%, #EAD9B0 100%); border: 1px solid #b59a64; box-shadow: 1px 0 0 #e8dab4, 2px 0 0 #bda77a, 3px 0 0 #efe3c2, 4px 0 0 #bda77a, 5px 0 0 #efe3c2, 6px 0 0 #a98f5c, 0 1px 0 #e8dab4, 0 2px 0 #bda77a, 0 3px 0 #efe3c2, 0 4px 0 #bda77a, 0 5px 0 #a98f5c, 0 22px 54px -14px rgba(60,35,10,.55); }
.mu-card[data-theme='bookreader'] .mu-banner { height: 92px; background: linear-gradient(180deg, #5a3418, #3a210f); animation: none; border-bottom: 4px double #C9A24B; }
.mu-card[data-theme='bookreader'] .mu-banner::before { background: none; content: '\\2766  \\2766  \\2766'; display: grid; place-items: center; color: #C9A24B; font-size: 20px; letter-spacing: .5em; inset: 0; opacity: .85; }
.mu-card[data-theme='bookreader'] .mu-banner::after { display: none; }
.mu-card[data-theme='bookreader'] .mu-ident { margin-top: -46px; }
.mu-card[data-theme='bookreader'] .mu-ring::before { background: conic-gradient(#8a5a20, #C9A24B, #f1dba0, #C9A24B, #8a5a20); animation-duration: 14s; }
.mu-card[data-theme='bookreader'] .mu-ring::after { box-shadow: 0 0 14px rgba(201,162,75,.5); }
.mu-card[data-theme='bookreader'] .mu-name { font-family: 'Playfair Display', Georgia, serif; font-weight: 800; color: #3B2A1A; font-size: clamp(24px, 6.4vw, 31px); }
.mu-card[data-theme='bookreader'] .mu-handle { color: #7A4B22; background: rgba(122,75,34,.08); border-color: rgba(122,75,34,.3); font-style: italic; }
.mu-card[data-theme='bookreader'] .mu-tag { border-radius: 3px; border: 1px dashed rgba(122,75,34,.5); background: transparent; font-style: italic; color: #5b3c1c; }
.mu-card[data-theme='bookreader'] .mu-meta { color: #5b4429; }
.mu-card[data-theme='bookreader'] .mu-panel { border-radius: 4px; background: rgba(255,250,236,.55); border: 1px solid rgba(122,75,34,.3); box-shadow: inset 0 0 0 3px rgba(255,250,236,.7), inset 0 0 0 4px rgba(122,75,34,.18); backdrop-filter: none; -webkit-backdrop-filter: none; }
.mu-card[data-theme='bookreader'] .mu-bio { text-align: left; color: #3B2A1A; font-size: 14px; line-height: 1.75; }
.mu-card[data-theme='bookreader'] .mu-bio::first-letter { float: left; font-family: 'Playfair Display', Georgia, serif; font-size: 3em; line-height: .85; padding: 4px 8px 0 0; color: #9b1c2c; font-weight: 800; }
.mu-card[data-theme='bookreader'] .mu-panel-title { font-family: 'Playfair Display', Georgia, serif; letter-spacing: .3em; color: #7A4B22; }
.mu-card[data-theme='bookreader'] .mu-panel-title::before, .mu-card[data-theme='bookreader'] .mu-panel-title::after { background: linear-gradient(90deg, transparent, #C9A24B); }
.mu-card[data-theme='bookreader'] .mu-btn { border-radius: 4px; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: .08em; }
.mu-card[data-theme='bookreader'] .mu-primary { background: linear-gradient(180deg, #7a4b22, #4a2a12); color: #F5DFA0; border: 1px solid #C9A24B; box-shadow: 0 6px 16px -8px #3a210f; }
.mu-card[data-theme='bookreader'] .mu-actions { border-radius: 8px; background: rgba(255,250,236,.75); border-color: rgba(122,75,34,.35); }
.mu-card[data-theme='bookreader'] .mu-ghost { background: #fffaf0; color: #3B2A1A; border: 1.5px solid rgba(122,75,34,.6); }
.bk-spine { position: absolute; top: 0; bottom: 0; left: 0; width: 34px; background: linear-gradient(90deg, rgba(60,35,10,.38), rgba(60,35,10,.1) 55%, transparent); }
.bk-gutter { position: absolute; top: 12px; bottom: 12px; left: 22px; width: 1px; background: rgba(60,35,10,.25); box-shadow: 3px 0 0 rgba(255,255,255,.4); }
.bk-ribbon { position: absolute; top: 0; left: 52px; width: 22px; height: 86px; z-index: 5; filter: drop-shadow(1px 3px 2px rgba(0,0,0,.35)); }
.bk-curl { position: absolute; right: 0; bottom: 0; width: 54px; height: 54px; filter: drop-shadow(-3px -3px 4px rgba(60,35,10,.3)); }
.bk-orn { position: absolute; width: 34px; height: 34px; opacity: .8; }
.bk-tl { top: 12px; left: 38px; } .bk-tr { top: 12px; right: 14px; transform: scaleX(-1); } .bk-bl { bottom: 14px; left: 38px; transform: scaleY(-1); }

/* ===== Iron Man ===== */
.mu-card[data-theme='marvel'] { font-family: 'Rajdhani', system-ui, sans-serif; }
.mu-card[data-theme='marvel'] .mu-face { background: radial-gradient(520px 300px at 50% 0%, rgba(200,16,46,.28), transparent 70%), radial-gradient(400px 260px at 100% 100%, rgba(79,216,255,.1), transparent 70%), linear-gradient(165deg, #1a0b0f 0%, #0B0A0F 45%, #130b06 100%); border-color: rgba(240,179,35,.55); }
.mu-card[data-theme='marvel'] .mu-banner { height: 120px; background: linear-gradient(180deg, #e0242f 0%, #a30f1f 55%, #55070f 100%); animation: none; border-bottom: 3px solid #F0B323; box-shadow: 0 8px 26px -6px rgba(240,179,35,.55); clip-path: polygon(0 0, 100% 0, 100% 78%, 92% 100%, 8% 100%, 0 78%); }
.mu-card[data-theme='marvel'] .mu-banner::before { background: repeating-linear-gradient(115deg, rgba(0,0,0,.28) 0 2px, transparent 2px 46px), linear-gradient(105deg, transparent 30%, rgba(255,255,255,.38) 44%, transparent 58%); background-size: auto, 220% 100%; animation: amSheen 5s ease-in-out infinite; }
.mu-card[data-theme='marvel'] .mu-banner::after { background: linear-gradient(90deg, transparent 38%, #F0B323 38% 62%, transparent 62%); height: 3px; bottom: 14px; top: auto; opacity: .9; }
.mu-card[data-theme='marvel'] .mu-ident { margin-top: -58px; }
.mu-card[data-theme='marvel'] .mu-ring::before { inset: -8px; background: conic-gradient(#d6f8ff, #3fd0ff, #ffffff, #3fd0ff, #d6f8ff); -webkit-mask: repeating-conic-gradient(#000 0 11deg, transparent 11deg 16deg); mask: repeating-conic-gradient(#000 0 11deg, transparent 11deg 16deg); animation-duration: 18s; }
.mu-card[data-theme='marvel'] .mu-ring::after { inset: -5px; box-shadow: 0 0 0 2px rgba(79,216,255,.7), 0 0 0 11px transparent, 0 0 0 12px rgba(240,179,35,.55), 0 0 30px 4px rgba(79,216,255,.7), 0 0 70px 8px rgba(79,216,255,.3); opacity: .95; }
.mu-card[data-theme='marvel'] .mu-name { font-family: 'Orbitron', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; font-size: clamp(19px, 5.2vw, 25px); background: linear-gradient(180deg, #FFF4D6, #F0B323); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 2px 8px rgba(240,179,35,.35)); }
.mu-card[data-theme='marvel'] .mu-handle { border-radius: 2px; color: #4FD8FF; border-color: rgba(79,216,255,.5); background: rgba(79,216,255,.07); letter-spacing: .05em; }
.mu-card[data-theme='marvel'] .mu-tag { border-radius: 2px; border-color: rgba(240,179,35,.45); background: rgba(240,179,35,.07); text-transform: uppercase; letter-spacing: .06em; font-size: 10.5px; }
.mu-card[data-theme='marvel'] .mu-meta svg { color: #F0B323; }
.mu-card[data-theme='marvel'] .mu-panel { border-radius: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: linear-gradient(145deg, rgba(255,255,255,.1), rgba(255,255,255,.02) 38%, rgba(0,0,0,.3)), rgba(24,22,30,.78); border: 1px solid rgba(240,179,35,.5); box-shadow: inset 0 1px 0 rgba(255,255,255,.18); }
.mu-card[data-theme='marvel'] .mu-panel-title { font-family: 'Orbitron', sans-serif; letter-spacing: .24em; color: #F0B323; font-size: 10px; }
.mu-card[data-theme='marvel'] .mu-btn { border-radius: 0; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); font-family: 'Orbitron', sans-serif; letter-spacing: .08em; font-size: 11.5px; }
.mu-card[data-theme='marvel'] .mu-primary { background: linear-gradient(120deg, #d4202c, #F0B323); color: #1a0508; }
.mu-card[data-theme='marvel'] .mu-actions { border-radius: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(11,10,15,.94); border-color: rgba(240,179,35,.5); }
.mu-card[data-theme='marvel'] .mu-ghost { background: #15131b; border: 1.5px solid rgba(79,216,255,.75); color: #FFEFD6; }
.am-mesh { position: absolute; inset: 0; }
.am-scan { position: absolute; left: 0; right: 0; top: 0; height: 90px; background: linear-gradient(180deg, transparent, rgba(79,216,255,.1), transparent); animation: nbSweep 6s linear infinite; }
.am-hud { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: auto; aspect-ratio: 400 / 120; opacity: .85; }
@keyframes amSheen { 0%, 25% { background-position: 0 0, 160% 0; } 70%, 100% { background-position: 0 0, -90% 0; } }

/* ===== Suit ===== */
.mu-card[data-theme='professional'] .mu-face { background: repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 8px), radial-gradient(420px 260px at 85% -4%, rgba(201,162,75,.12), transparent 70%), linear-gradient(172deg, #232b3c, #151a25 60%, #0f131c); border-color: rgba(201,162,75,.5); }
.mu-card[data-theme='professional'] .mu-banner { height: 150px; background: none; animation: none; }
.mu-card[data-theme='professional'] .mu-banner::before, .mu-card[data-theme='professional'] .mu-banner::after { display: none; }
.mu-card[data-theme='professional'] .mu-ident { margin-top: -60px; }
.mu-card[data-theme='professional'] .mu-ring::before { background: conic-gradient(#8a6a24, #E6C879, #fff3cf, #E6C879, #8a6a24); animation-duration: 16s; }
.mu-card[data-theme='professional'] .mu-ring::after { box-shadow: 0 0 16px rgba(201,162,75,.45); }
.mu-card[data-theme='professional'] .mu-name { font-family: 'Playfair Display', Georgia, serif; font-weight: 800; font-size: clamp(24px, 6.4vw, 31px); letter-spacing: .01em; }
.mu-card[data-theme='professional'] .mu-handle { color: #E6C879; border-color: rgba(201,162,75,.5); letter-spacing: .04em; }
.mu-card[data-theme='professional'] .mu-tag { border-radius: 2px; border-color: rgba(201,162,75,.4); background: rgba(201,162,75,.08); letter-spacing: .04em; }
.mu-card[data-theme='professional'] .mu-meta svg { color: #E6C879; }
.mu-card[data-theme='professional'] .mu-panel { background: #F6F3EA; border: 1px solid #d9d2bd; border-top: 3px solid #C9A24B; border-radius: 6px; box-shadow: 0 10px 24px -12px rgba(0,0,0,.6); backdrop-filter: none; -webkit-backdrop-filter: none; }
.mu-card[data-theme='professional'] .mu-bio { color: #1b1f2a; }
.mu-card[data-theme='professional'] .mu-panel-title { color: #6b5a2a; font-family: 'Playfair Display', Georgia, serif; letter-spacing: .2em; }
.mu-card[data-theme='professional'] .mu-panel-title::before, .mu-card[data-theme='professional'] .mu-panel-title::after { background: linear-gradient(90deg, transparent, #C9A24B); }
.mu-card[data-theme='professional'] .mu-btn { border-radius: 4px; letter-spacing: .08em; }
.mu-card[data-theme='professional'] .mu-primary { background: linear-gradient(180deg, #A83244, #7a1f2e); color: #fff; box-shadow: 0 8px 18px -8px #7a1f2e; }
.mu-card[data-theme='professional'] .mu-ghost { background: #1d2433; border: 1.5px solid rgba(201,162,75,.7); color: #F3F1EA; }
.st-lapels { position: absolute; top: 0; left: 0; width: 100%; height: 150px; }

.st-seam { position: absolute; left: 50%; top: 150px; bottom: 0; width: 14px; margin-left: -7px; background: radial-gradient(circle at 50% 32%, #F4DB9C 0 4.5px, #8a6a24 5px 6px, transparent 6.5px), radial-gradient(circle at 50% 56%, #F4DB9C 0 4.5px, #8a6a24 5px 6px, transparent 6.5px), radial-gradient(circle at 50% 80%, #F4DB9C 0 4.5px, #8a6a24 5px 6px, transparent 6.5px); }
.st-seam::before { content: ''; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, rgba(0,0,0,.5), rgba(255,255,255,.07) 18%, rgba(0,0,0,.5)); }
.mu-card[data-theme='suitwoman'] .mu-face { background: repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 8px), radial-gradient(420px 260px at 15% -4%, rgba(224,180,164,.16), transparent 70%), linear-gradient(172deg, #2d1a28, #1b0f19 60%, #130a12); border-color: rgba(224,180,164,.55); }
.mu-card[data-theme='suitwoman'] .mu-banner { height: 150px; background: none; animation: none; }
.mu-card[data-theme='suitwoman'] .mu-banner::before, .mu-card[data-theme='suitwoman'] .mu-banner::after { display: none; }
.mu-card[data-theme='suitwoman'] .mu-ident { margin-top: -60px; }
.mu-card[data-theme='suitwoman'] .mu-ring::before { background: conic-gradient(#a8776a, #F0CFC3, #fff4ee, #F0CFC3, #a8776a); animation-duration: 16s; }
.mu-card[data-theme='suitwoman'] .mu-ring::after { box-shadow: 0 0 16px rgba(224,180,164,.45); }
.mu-card[data-theme='suitwoman'] .mu-name { font-family: 'Playfair Display', Georgia, serif; font-weight: 800; font-size: clamp(24px, 6.4vw, 31px); }
.mu-card[data-theme='suitwoman'] .mu-handle { color: #F0CFC3; border-color: rgba(224,180,164,.5); letter-spacing: .04em; }
.mu-card[data-theme='suitwoman'] .mu-tag { border-radius: 999px; border-color: rgba(224,180,164,.45); background: rgba(224,180,164,.09); }
.mu-card[data-theme='suitwoman'] .mu-meta svg { color: #F0CFC3; }
.mu-card[data-theme='suitwoman'] .mu-panel { background: #FBF4EF; border: 1px solid #e6d6cc; border-top: 3px solid #E0B4A4; border-radius: 10px; box-shadow: 0 10px 24px -12px rgba(0,0,0,.6); backdrop-filter: none; -webkit-backdrop-filter: none; }
.mu-card[data-theme='suitwoman'] .mu-bio { color: #2a1a26; }
.mu-card[data-theme='suitwoman'] .mu-panel-title { color: #8a5a50; font-family: 'Playfair Display', Georgia, serif; letter-spacing: .2em; }
.mu-card[data-theme='suitwoman'] .mu-panel-title::before, .mu-card[data-theme='suitwoman'] .mu-panel-title::after { background: linear-gradient(90deg, transparent, #E0B4A4); }
.mu-card[data-theme='suitwoman'] .mu-btn { border-radius: 999px; letter-spacing: .06em; }
.mu-card[data-theme='suitwoman'] .mu-primary { background: linear-gradient(180deg, #B24A66, #7a2840); color: #fff; box-shadow: 0 8px 18px -8px #7a2840; }
.mu-card[data-theme='suitwoman'] .mu-ghost { background: #2a1826; border: 1.5px solid rgba(224,180,164,.75); color: #FBF4EF; }
/* Suit cards: the pale panel needs dark, heavier icons and text, and the chips sit on solid fills so the jacket art never shows through */
.mu-card[data-theme='professional'] .mu-links > button { color: #4a3a0f !important; background-color: rgba(201,162,75,.3) !important; box-shadow: inset 0 0 0 2px #B58A2E !important; }
.mu-card[data-theme='professional'] .mu-links svg { stroke-width: 2.6; }
.mu-card[data-theme='professional'] .mu-bio { font-weight: 600; color: #11151f; }
.mu-card[data-theme='professional'] .mu-panel-title { color: #4a3a0f; font-weight: 800; }
.mu-card[data-theme='professional'] .mu-tag { background: #2b3347; border-color: rgba(201,162,75,.6); color: #F3F1EA; }
.mu-card[data-theme='professional'] .mu-handle { background: #20283a; }
.mu-card[data-theme='professional'] .mu-meta { width: fit-content; margin-left: auto; margin-right: auto; padding: 3px 12px; border-radius: 999px; background: #1b2130; }
.mu-card[data-theme='suitwoman'] .mu-links > button { color: #6b1f38 !important; background-color: rgba(224,180,164,.45) !important; box-shadow: inset 0 0 0 2px #C48474 !important; }
.mu-card[data-theme='suitwoman'] .mu-links svg { stroke-width: 2.6; }
.mu-card[data-theme='suitwoman'] .mu-bio { font-weight: 600; color: #1c0f1a; }
.mu-card[data-theme='suitwoman'] .mu-panel-title { color: #6b3f36; font-weight: 800; }
.mu-card[data-theme='suitwoman'] .mu-tag { background: #3b2535; border-color: rgba(224,180,164,.6); color: #FBF1EC; }
.mu-card[data-theme='suitwoman'] .mu-handle { background: #2a1826; }
.mu-card[data-theme='suitwoman'] .mu-meta { width: fit-content; margin-left: auto; margin-right: auto; padding: 3px 12px; border-radius: 999px; background: #241421; }
/* IEEE RMC 2026 role cards: the regular card frame, drawn in the RMC theme for the role */
.mu-card[data-rmc='true'][data-theme='pathways'] .mu-face { background: radial-gradient(380px 260px at 85% 14%, rgba(247,200,115,0.28), transparent 70%), linear-gradient(165deg, #052A3A 0%, #063A52 55%, #0A4E62 100%); border-color: rgba(244,184,96,0.4); }
.mu-card[data-rmc='true'][data-theme='pathways'] .mu-handle, .mu-card[data-rmc='true'][data-theme='pathways'] .mu-tag { color: #F4B860; border-color: rgba(244,184,96,0.6); background: rgba(244,184,96,0.12); }
.mu-card[data-rmc='true'][data-theme='pathways'] .mu-panel { background: rgba(244,184,96,0.10); border-color: rgba(244,184,96,0.55); }
.mu-card[data-theme='balance'] .mu-face { background: radial-gradient(360px 240px at 85% 8%, rgba(255,255,255,0.85), transparent 70%), linear-gradient(170deg, #FBF8EA 0%, #EEF5E6 55%, #DDEFE6 100%); border-color: rgba(11,122,117,0.28); }
.mu-card[data-theme='balance'] .mu-banner, .mu-card[data-theme='unity'] .mu-banner, .mu-card[data-theme='empowerment'] .mu-banner { background: none; animation: none; }
.mu-card[data-theme='balance'] .mu-banner::before, .mu-card[data-theme='balance'] .mu-banner::after, .mu-card[data-theme='unity'] .mu-banner::before, .mu-card[data-theme='unity'] .mu-banner::after, .mu-card[data-theme='empowerment'] .mu-banner::before, .mu-card[data-theme='empowerment'] .mu-banner::after { display: none; }
.mu-card[data-theme='balance'] .mu-ring::before { background: conic-gradient(#0B7A75, #12B5A8, #D5E8B5, #0B7A75); }
.mu-card[data-theme='balance'] .mu-handle { background: rgba(255,255,255,0.88); color: #0B3B3F; border-color: rgba(11,59,63,0.25); }
.mu-card[data-theme='balance'] .mu-tag { background: rgba(255,255,255,0.75); color: #0B3B3F; border-color: rgba(11,59,63,0.25); }
.mu-card[data-theme='balance'] .mu-panel { background: rgba(255,255,255,0.5); border: 1px solid rgba(11,122,117,0.35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='balance'] .mu-panel-title { color: #0B7A75; }
.mu-card[data-theme='balance'] .mu-bio, .mu-card[data-theme='balance'] .mu-meta { color: #0B3B3F; }
.mu-card[data-theme='balance'] .mu-links > button { color: #fff !important; background-color: #0B2F3A !important; box-shadow: none !important; }
.mu-card[data-theme='balance'] .mu-primary { background: #0B7A75; color: #fff; }
.mu-card[data-theme='balance'] .mu-ghost { background: rgba(255,255,255,0.7); color: #0B3B3F; border: 1.5px solid rgba(11,59,63,0.4); }
.mu-card[data-theme='unity'] .mu-face { background: radial-gradient(380px 260px at 85% 12%, rgba(244,184,96,0.26), transparent 70%), radial-gradient(340px 260px at 0% 100%, rgba(45,212,168,0.2), transparent 70%), linear-gradient(165deg, #042A30 0%, #05404A 52%, #0A5A55 100%); border-color: rgba(244,184,96,0.45); }
.mu-card[data-theme='unity'] .mu-ring::before { background: conic-gradient(#F4B860, #F9D78A, #2DD4A8, #1B8DA6, #F4B860); }
.mu-card[data-theme='unity'] .mu-handle, .mu-card[data-theme='unity'] .mu-tag { color: #F4B860; border-color: rgba(244,184,96,0.6); background: rgba(244,184,96,0.12); }
.mu-card[data-theme='unity'] .mu-panel { background: rgba(244,184,96,0.10); border: 1px solid rgba(244,184,96,0.5); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='unity'] .mu-panel-title { color: #F4B860; }
.mu-card[data-theme='unity'] .mu-links > button { color: #F9D78A !important; background-color: rgba(3,32,40,0.75) !important; box-shadow: inset 0 0 0 1.5px rgba(244,184,96,0.7) !important; }
.mu-card[data-theme='unity'] .mu-primary { background: linear-gradient(120deg, #F4B860, #2DD4A8); color: #04242a; }
.mu-card[data-theme='unity'] .mu-ghost { background: rgba(3,32,40,0.85); color: #fff; border: 1.5px solid rgba(244,184,96,0.7); }
.mu-card[data-theme='empowerment'] .mu-face { background: radial-gradient(380px 260px at 82% 14%, rgba(243,222,138,0.22), transparent 70%), linear-gradient(165deg, #032B33 0%, #054049 52%, #0A5C5A 100%); border-color: rgba(217,245,90,0.35); }
.mu-card[data-theme='empowerment'] .mu-ring::before { background: conic-gradient(#D9F55A, #3BAE74, #12889B, #D9F55A); }
.mu-card[data-theme='empowerment'] .mu-handle, .mu-card[data-theme='empowerment'] .mu-tag { color: #D9F55A; border-color: rgba(217,245,90,0.55); background: rgba(217,245,90,0.10); }
.mu-card[data-theme='empowerment'] .mu-panel { background: rgba(217,245,90,0.08); border: 1px solid rgba(217,245,90,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-card[data-theme='empowerment'] .mu-panel-title { color: #D9F55A; }
.mu-card[data-theme='empowerment'] .mu-links > button { color: #D9F55A !important; background-color: rgba(3,43,51,0.75) !important; box-shadow: inset 0 0 0 1.5px rgba(217,245,90,0.6) !important; }
.mu-card[data-theme='empowerment'] .mu-primary { background: linear-gradient(120deg, #D9F55A, #7ED29A); color: #10222a; }
.mu-card[data-theme='empowerment'] .mu-ghost { background: rgba(3,43,51,0.85); color: #fff; border: 1.5px solid rgba(143,203,179,0.6); }
.mu-rmc-pill { position: absolute; top: 12px; left: 14px; z-index: 4; display: inline-flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 8px 14px; border-radius: 14px; line-height: 1.1; color: var(--ink); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1.5px solid color-mix(in srgb, var(--g1) 70%, transparent); box-shadow: 0 6px 18px -8px var(--g1); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mu-rmc-pill b { font-size: 12px; font-weight: 900; letter-spacing: .15em; text-transform: uppercase; }
.mu-rmc-pill i { font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; color: var(--g1); }
@media (prefers-reduced-motion: reduce) { .nb-floor, .nb-sweep, .am-scan, .mu-card[data-theme='cyberpunk'] .mu-name, .mu-card[data-theme='marvel'] .mu-banner::before { animation: none !important; } }
`;
