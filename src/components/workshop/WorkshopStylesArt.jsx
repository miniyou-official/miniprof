// Artwork and photo frames for the three extra Innovation Workshop styles (see workshopThemes.js):
// Boardroom (burgundy and gold), Blueprint (navy, amber and copper) and Foundry (charcoal, ivory, terracotta and emerald).
// Same 340 x 600 canvas, layers and rules as the first set: everything is aria-hidden, and on the back the artwork stays in the
// lower half so the QR code and Back button stay clear.

import { RMC_ART_CSS } from '../rmc/rmcArtCss';

const rad = (d) => (d * Math.PI) / 180;
const pt = (deg, r) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r];
const LEAF = 'M0 0 C 16 -8, 30 -28, 26 -56 C 8 -46, -4 -24, 0 0 Z';

function Svg({ children }) {
    return (
        <svg className="rt-art" viewBox="0 0 340 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            {children}
        </svg>
    );
}

// ---------------------------------------------------------------- Boardroom primitives
// An art deco sunburst
function Fan({ x, y, s = 1, color, n = 9, w = 2 }) {
    const rays = [];
    for (let i = 0; i < n; i += 1) rays.push(-170 + i * (160 / (n - 1)));
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} fill="none" strokeLinecap="round">
            {rays.map((a) => { const [x1, y1] = pt(a, 34); const [x2, y2] = pt(a, 92); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} />; })}
            <path d="M-92 0 A92 92 0 0 1 92 0" strokeWidth={w} />
            <path d="M-34 0 A34 34 0 0 1 34 0" strokeWidth={w} />
        </g>
    );
}

// Stacks of gold coins. (x, y) is the base of the first stack.
function Coins({ x, y, s = 1, fill, rim, stacks }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            {stacks.map((n, si) => (
                <g key={si} transform={`translate(${si * 36} 0)`}>
                    {Array.from({ length: n }, (_, k) => (
                        <g key={k}>
                            <path d={`M-15 ${-k * 7 - 6} v7 a15 5.5 0 0 0 30 0 v-7`} fill={fill} stroke={rim} strokeWidth="1.4" />
                            <ellipse cx="0" cy={-k * 7 - 6} rx="15" ry="5.5" fill={fill} stroke={rim} strokeWidth="1.4" />
                        </g>
                    ))}
                </g>
            ))}
        </g>
    );
}

// A boardroom frontage: pediment, four columns and a base. (x, y) is the base's left end.
function Columns({ x, y, s = 1, fill, line }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 -80 L48 -102 L96 -80 Z" fill={fill} stroke={line} strokeWidth="2" strokeLinejoin="round" />
            <rect x="0" y="-80" width="96" height="8" fill={fill} stroke={line} strokeWidth="2" />
            {[10, 32, 54, 76].map((cx) => <rect key={cx} x={cx} y="-72" width="10" height="62" fill={fill} stroke={line} strokeWidth="1.5" />)}
            <rect x="-4" y="-10" width="104" height="10" fill={fill} stroke={line} strokeWidth="2" />
        </g>
    );
}

// A laurel branch
function Branch({ x, y, r = 0, s = 1, fill, stem, flip = false }) {
    const pairs = [[-18, 42], [-36, -42], [-56, 44], [-76, -44], [-98, 40]];
    return (
        <g transform={`translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})`}>
            <g className="rt-sway">
                <path d="M0 0 C 8 -34, -6 -76, 6 -118" fill="none" stroke={stem} strokeWidth="2.4" strokeLinecap="round" />
                {pairs.map(([py, rot], i) => (
                    <g key={i} transform={`translate(0 ${py}) rotate(${rot}) scale(${rot < 0 ? -0.8 : 0.8} 0.8)`}><path d={LEAF} fill={fill} opacity={i % 2 ? 0.7 : 1} /></g>
                ))}
            </g>
        </g>
    );
}

function Diamonds({ list, fill }) {
    return <g fill={fill}>{list.map(([cx, cy, k], i) => <path key={i} d="M0 -8 L6 0 L0 8 L-6 0 Z" transform={`translate(${cx} ${cy}) scale(${k})`} opacity={0.4 + (i % 3) * 0.2} />)}</g>;
}

// Nested chevrons, like art deco steps
function Chevrons({ x, y, s = 1, color, n = 4 }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            {Array.from({ length: n }, (_, i) => <path key={i} d={`M-${30 + i * 0} ${i * 12} L0 ${-14 + i * 12} L30 ${i * 12}`} opacity={1 - i * 0.2} />)}
        </g>
    );
}

// ---------------------------------------------------------------- Blueprint primitives
function Grid({ id, color, opacity = 0.14, size = 22 }) {
    return (
        <>
            <defs><pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse"><path d={`M${size} 0 H0 V${size}`} fill="none" stroke={color} strokeWidth="1" /></pattern></defs>
            <rect width="340" height="600" fill={`url(#${id})`} opacity={opacity} />
        </>
    );
}

// A funding line chart that climbs to an arrow. (x, y) is the left end of the baseline.
function LineChart({ x, y, s = 1, line, area, dot }) {
    const pts = [[0, 0], [22, -16], [44, -8], [66, -36], [88, -30], [112, -66]];
    const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join(' ');
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={`${d} L112 0 L0 0 Z`} fill={area} />
            <path d={d} fill="none" stroke={line} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={i === 5 ? 5.5 : 3.4} fill={i === 5 ? dot : line} />)}
            <path d="M118 -78 L 108 -64 L 124 -64 Z" fill={dot} stroke={dot} strokeWidth="2" strokeLinejoin="round" />
        </g>
    );
}

function Candles({ x, y, s = 1, up, down }) {
    const c = [[10, 34, 0], [26, 18, 1], [14, 46, 0], [34, 22, 1], [22, 58, 0], [40, 30, 1]];
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            {c.map(([off, h, isUp], i) => (
                <g key={i} transform={`translate(${i * 20} ${-off})`}>
                    <line x1="6" x2="6" y1={-h - 8} y2="10" stroke={isUp ? up : down} strokeWidth="2" />
                    <rect x="0" y={-h} width="12" height={h * 0.6} rx="2" fill={isUp ? up : down} opacity={isUp ? 1 : 0.6} />
                </g>
            ))}
        </g>
    );
}

// A compass dial
function Dial({ x, y, s = 1, color, hi }) {
    const ticks = [];
    for (let i = 0; i < 24; i += 1) ticks.push(i * 15);
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round">
            <circle r="42" stroke={color} strokeWidth="2" />
            <circle r="28" stroke={color} strokeWidth="1.2" opacity="0.7" />
            {ticks.map((a) => { const [x1, y1] = pt(a, 42); const [x2, y2] = pt(a, a % 45 === 0 ? 50 : 46); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={a % 45 === 0 ? 2.4 : 1.2} />; })}
            <path d="M0 -26 L6 0 L0 26 L-6 0 Z" fill={hi} stroke="none" opacity="0.9" />
            <line x1="-60" y1="0" x2="60" y2="0" stroke={color} strokeWidth="1" strokeDasharray="3 5" />
        </g>
    );
}

// A measured line with end ticks, as on a drawing
function DimLine({ x, y, w, color }) {
    return (
        <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
            <line x1={x} y1={y} x2={x + w} y2={y} />
            <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
            <line x1={x + w} y1={y - 6} x2={x + w} y2={y + 6} />
        </g>
    );
}

function Brackets({ x, y, w, h, color }) {
    const L = 16;
    return (
        <g fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d={`M${x} ${y + L} V${y} H${x + L}`} /><path d={`M${x + w - L} ${y} H${x + w} V${y + L}`} />
            <path d={`M${x} ${y + h - L} V${y + h} H${x + L}`} /><path d={`M${x + w - L} ${y + h} H${x + w} V${y + h - L}`} />
        </g>
    );
}

// A paper plane climbing away from a dotted trail
function Plane({ x, y, s = 1, color, trail }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-120 70 C -80 70, -60 30, -20 24" fill="none" stroke={trail} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
            <path d="M0 0 L66 -28 L34 26 L24 8 Z" fill={color} />
            <path d="M24 8 L66 -28" stroke={trail} strokeWidth="2" opacity="0.7" />
        </g>
    );
}

// ---------------------------------------------------------------- Foundry primitives
function gearPath(r1, r2, n) {
    const pts = [];
    const w = (Math.PI * 2) / n;
    for (let i = 0; i < n; i += 1) {
        const a = i * w;
        [[0.06, r1], [0.18, r2], [0.5, r2], [0.62, r1]].forEach(([f, r]) => pts.push([Math.cos(a + w * f) * r, Math.sin(a + w * f) * r]));
    }
    return `M${pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L')} Z`;
}

function Gear({ x, y, s = 1, r = 40, n = 12, fill, hole, stroke, spin = 1 }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <g style={{ transformOrigin: '0 0', animation: `fxSpin ${spin > 0 ? 40 : 55}s linear infinite ${spin > 0 ? '' : 'reverse'}` }}>
                <path d={gearPath(r * 0.82, r, n)} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
                <circle r={r * 0.32} fill={hole} stroke={stroke} strokeWidth="2" />
            </g>
        </g>
    );
}

// A brick wall in a running bond. (x, y) is the top-left corner.
function Bricks({ x, y, s = 1, rows = 4, cols = 5, fill, line }) {
    const w = 34;
    const h = 15;
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (
                <rect key={`${r}-${c}`} x={c * w + (r % 2 ? w / 2 : 0)} y={r * h} width={w - 3} height={h - 3} rx="2" fill={fill} stroke={line} strokeWidth="1" opacity={0.55 + ((r + c) % 3) * 0.15} />
            )))}
        </g>
    );
}

// Nested arches, like an architectural elevation
function Arches({ x, y, s = 1, color }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
            {[44, 30, 16].map((r) => <path key={r} d={`M${-r} 0 V${-r} A${r} ${r} 0 0 1 ${r} ${-r} V0`} />)}
            <line x1="-52" y1="0" x2="52" y2="0" />
        </g>
    );
}

function IsoBlock({ x, y, s = 1, top, left, right }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-24 -28 L0 -16 L0 12 L-24 0 Z" fill={left} />
            <path d="M24 -28 L0 -16 L0 12 L24 0 Z" fill={right} />
            <path d="M0 -40 L24 -28 L0 -16 L-24 -28 Z" fill={top} />
        </g>
    );
}

// ---------------------------------------------------------------- Boardroom scenes
const BG = { gold: '#D4AF37', gold2: '#E6C25A', pale: '#F2D98A', wine: '#8E1B33', deep: '#4A0E1C' };
const boardroom = {
    speaker: {
        front: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="288" cy="120" r="84" fill={BG.gold} fillOpacity="0.12" /></g>
            <g className="rt-l2"><Fan x={288} y={150} s={0.78} color={BG.gold2} /></g>
            <g className="rt-l3"><Coins x={226} y={598} s={0.7} fill={BG.gold} rim="#8A6A22" stacks={[3, 5, 2]} /></g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><Fan x={264} y={470} s={0.95} color={BG.gold2} w={2.4} /></g>
            <g className="rt-l2"><Coins x={40} y={560} s={1} fill={BG.gold} rim="#8A6A22" stacks={[3, 6, 4, 7]} /></g>
        </Svg>),
    },
    organizer: {
        front: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="290" cy="90" r="84" fill="#C9A24B" fillOpacity="0.1" /></g>
            <g className="rt-l2"><Columns x={262} y={118} s={0.62} fill="rgba(201,162,75,0.12)" line="#C9A24B" /></g>
            <g className="rt-l3"><Chevrons x={290} y={590} s={0.9} color="#C9A24B" n={4} /></g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l2"><Columns x={170} y={500} s={1.2} fill="rgba(201,162,75,0.12)" line="#C9A24B" /></g>
            <g className="rt-l1"><Chevrons x={70} y={440} s={1.3} color="#C9A24B" n={5} /></g>
        </Svg>),
    },
    panelist: {
        front: () => (<Svg>
            <g className="rt-l1"><circle cx="290" cy="80" r="80" fill="#FFFFFF" opacity="0.7" /><Fan x={290} y={150} s={0.7} color="#C9A24B" w={1.8} /></g>
            <g className="rt-l3">
                <Branch x={20} y={596} r={6} s={1} fill="#8E1B33" stem="#C9A24B" />
                <Branch x={324} y={598} r={-6} s={0.85} fill="#C9A24B" stem="#8E1B33" flip />
            </g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><circle cx="270" cy="440" r="110" fill="#FFFFFF" opacity="0.6" /></g>
            <g className="rt-l2"><Coins x={150} y={540} s={0.95} fill="#E8D29A" rim="#B88A2A" stacks={[2, 4, 3, 5]} /></g>
            <g className="rt-l3"><Branch x={24} y={598} r={6} s={1} fill="#8E1B33" stem="#C9A24B" /></g>
        </Svg>),
    },
    attendee: {
        front: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="290" cy="100" r="86" fill={BG.pale} fillOpacity="0.16" /></g>
            <g className="rt-l2"><Diamonds list={[[250, 60, 1.1], [300, 52, 0.8], [322, 120, 1.2], [262, 150, 0.7], [286, 96, 1.6]]} fill={BG.pale} /></g>
            <g className="rt-l3"><Coins x={236} y={598} s={0.62} fill={BG.pale} rim="#B88A2A" stacks={[2, 3, 5]} /></g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="260" cy="410" r="110" fill={BG.pale} fillOpacity="0.14" /></g>
            <g className="rt-l2">
                <Coins x={40} y={540} s={1} fill={BG.pale} rim="#B88A2A" stacks={[2, 3, 5, 7]} />
                <Diamonds list={[[70, 380, 1.2], [160, 360, 1], [290, 350, 1.3], [230, 420, 0.8]]} fill={BG.pale} />
            </g>
        </Svg>),
    },
};

// ---------------------------------------------------------------- Blueprint scenes
const BP = { amber: '#FFB020', copper: '#E8914A', sky: '#5AB8FF', ink: '#0B1F44', cu2: '#C96F2B', gold: '#FFC857' };
const blueprint = {
    speaker: {
        front: () => (<Svg>
            <Grid id="bps-f" color="#5A8BD8" opacity={0.16} />
            <g className="rt-l1"><circle className="rt-pulse" cx="290" cy="110" r="84" fill={BP.amber} fillOpacity="0.12" /></g>
            <g className="rt-l2"><LineChart x={224} y={132} s={0.68} line={BP.amber} area="rgba(255,176,32,0.16)" dot="#FFE2A0" /></g>
        </Svg>),
        back: () => (<Svg>
            <Grid id="bps-b" color="#5A8BD8" opacity={0.16} />
            <g className="rt-l2"><LineChart x={40} y={540} s={1.8} line={BP.amber} area="rgba(255,176,32,0.14)" dot="#FFE2A0" /><Candles x={250} y={540} s={0.7} up={BP.amber} down={BP.sky} /></g>
        </Svg>),
    },
    organizer: {
        front: () => (<Svg>
            <Grid id="bpo-f" color="#5AB8FF" opacity={0.2} />
            <g className="rt-l1"><Brackets x={240} y={40} w={88} h={100} color={BP.copper} /></g>
            <g className="rt-l2"><Candles x={252} y={128} s={0.62} up={BP.copper} down={BP.sky} /></g>
            <g className="rt-l3"><DimLine x={20} y={586} w={120} color={BP.copper} /></g>
        </Svg>),
        back: () => (<Svg>
            <Grid id="bpo-b" color="#5AB8FF" opacity={0.2} />
            <g className="rt-l2"><Candles x={40} y={540} s={1.6} up={BP.copper} down={BP.sky} /><DimLine x={40} y={560} w={260} color={BP.copper} /></g>
        </Svg>),
    },
    panelist: {
        front: () => (<Svg>
            <Grid id="bpm-f" color="#0B1F44" opacity={0.09} />
            <g className="rt-l1"><circle cx="290" cy="84" r="80" fill="#FFFFFF" opacity="0.7" /></g>
            <g className="rt-l2"><Dial x={286} y={96} s={0.85} color={BP.ink} hi={BP.cu2} /></g>
            <g className="rt-l3"><LineChart x={196} y={594} s={0.6} line={BP.cu2} area="rgba(201,111,43,0.14)" dot={BP.ink} /></g>
        </Svg>),
        back: () => (<Svg>
            <Grid id="bpm-b" color="#0B1F44" opacity={0.09} />
            <g className="rt-l2"><Dial x={80} y={460} s={1.1} color={BP.ink} hi={BP.cu2} /><LineChart x={170} y={540} s={1.1} line={BP.cu2} area="rgba(201,111,43,0.14)" dot={BP.ink} /></g>
        </Svg>),
    },
    attendee: {
        front: () => (<Svg>
            <Grid id="bpa-f" color="#9CC8FF" opacity={0.14} />
            <g className="rt-l1"><circle className="rt-pulse" cx="290" cy="100" r="86" fill={BP.sky} fillOpacity="0.16" /></g>
            <g className="rt-l2"><Plane x={290} y={104} s={0.62} color={BP.gold} trail="#FFFFFF" /></g>
        </Svg>),
        back: () => (<Svg>
            <Grid id="bpa-b" color="#9CC8FF" opacity={0.14} />
            <g className="rt-l1"><circle className="rt-pulse" cx="260" cy="420" r="110" fill={BP.sky} fillOpacity="0.14" /></g>
            <g className="rt-l2"><Plane x={290} y={440} s={0.9} color={BP.gold} trail="#FFFFFF" /><LineChart x={36} y={560} s={1.3} line={BP.gold} area="rgba(255,200,87,0.14)" dot="#FFFFFF" /></g>
        </Svg>),
    },
};

// ---------------------------------------------------------------- Foundry scenes
const FD = { terra: '#EF7F52', terra2: '#E0693C', em: '#3FD1A0', em2: '#1E8E6A', ivory: '#F4EEE2', steel: '#4A5156', peach: '#F5A07A' };
const foundry = {
    speaker: {
        front: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="292" cy="96" r="84" fill={FD.terra2} fillOpacity="0.12" /></g>
            <g className="rt-l2"><Gear x={292} y={98} s={0.85} r={44} n={12} fill="rgba(239,127,82,0.2)" hole="#1E2123" stroke={FD.terra} /><Gear x={246} y={150} s={0.7} r={24} n={9} fill="rgba(47,190,138,0.2)" hole="#1E2123" stroke="#2DBE8A" spin={-1} /></g>
            <g className="rt-l3"><Bricks x={216} y={548} s={0.9} rows={3} cols={4} fill="rgba(239,127,82,0.35)" line={FD.terra} /></g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><Bricks x={150} y={440} s={1.3} rows={5} cols={4} fill="rgba(239,127,82,0.3)" line={FD.terra} /></g>
            <g className="rt-l2"><Gear x={80} y={470} s={1.3} r={44} n={12} fill="rgba(239,127,82,0.2)" hole="#1E2123" stroke={FD.terra} /><Gear x={150} y={410} s={1} r={22} n={9} fill="rgba(47,190,138,0.2)" hole="#1E2123" stroke="#2DBE8A" spin={-1} /></g>
        </Svg>),
    },
    organizer: {
        front: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="290" cy="100" r="84" fill={FD.em} fillOpacity="0.1" /></g>
            <g className="rt-l2"><Arches x={290} y={150} s={0.95} color={FD.em} /></g>
            <g className="rt-l3"><Gear x={296} y={590} s={0.9} r={34} n={10} fill="rgba(224,105,60,0.18)" hole="#121415" stroke={FD.terra2} /></g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><Arches x={90} y={520} s={1.4} color={FD.em} /><Arches x={250} y={520} s={1.4} color={FD.em} /></g>
            <g className="rt-l2"><Gear x={170} y={440} s={1} r={26} n={9} fill="rgba(224,105,60,0.18)" hole="#121415" stroke={FD.terra2} /></g>
        </Svg>),
    },
    panelist: {
        front: () => (<Svg>
            <g className="rt-l1"><circle cx="290" cy="80" r="80" fill="#FFFFFF" opacity="0.7" /></g>
            <g className="rt-l2"><Gear x={290} y={98} s={0.8} r={42} n={12} fill="rgba(30,142,106,0.14)" hole={FD.ivory} stroke={FD.em2} /></g>
            <g className="rt-l3"><Bricks x={206} y={552} s={0.85} rows={3} cols={4} fill="rgba(224,105,60,0.22)" line={FD.terra2} /></g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><circle cx="270" cy="440" r="110" fill="#FFFFFF" opacity="0.6" /></g>
            <g className="rt-l2"><Arches x={90} y={540} s={1.3} color={FD.em2} /><Gear x={240} y={460} s={1} r={40} n={12} fill="rgba(30,142,106,0.14)" hole={FD.ivory} stroke={FD.em2} /></g>
        </Svg>),
    },
    attendee: {
        front: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="290" cy="104" r="86" fill={FD.terra} fillOpacity="0.16" /></g>
            <g className="rt-l2">
                <IsoBlock x={290} y={150} s={0.8} top={FD.peach} left="#B5512A" right="#E0693C" />
                <IsoBlock x={256} y={126} s={0.6} top="#F7D9A8" left="#8A6A4A" right="#C9A27A" />
                <IsoBlock x={290} y={110} s={0.6} top="#FFFFFF" left="#B5512A" right="#E0693C" />
            </g>
        </Svg>),
        back: () => (<Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="260" cy="420" r="110" fill={FD.terra} fillOpacity="0.14" /></g>
            <g className="rt-l2">
                {[[60, 540, 0.8], [112, 520, 0.9], [164, 498, 1], [216, 474, 1.1], [268, 448, 1.2]].map(([bx, by, k], i) => <IsoBlock key={i} x={bx} y={by} s={k} top={i === 4 ? '#FFFFFF' : FD.peach} left="#B5512A" right="#E0693C" />)}
            </g>
        </Svg>),
    },
};

const SCENES = { boardroom, blueprint, foundry };
const SCRIMS = {
    boardroom: { speaker: '#3A0A16', organizer: '#240810', panelist: '#EFDFC4', attendee: '#6A1228' },
    blueprint: { speaker: '#07142B', organizer: '#040A18', panelist: '#DCE6F4', attendee: '#0B2250' },
    foundry: { speaker: '#1B1E20', organizer: '#0E1011', panelist: '#EAE2D2', attendee: '#231F1B' },
};

function StyleScene({ style, role, face = 'front', frontScrim = '34%', backScrim = '26%' }) {
    const Scene = SCENES[style][role][face] || SCENES[style][role].front;
    const light = role === 'panelist';
    return (
        <>
            <style>{RMC_ART_CSS}</style>
            {face === 'back' ? <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: 'linear-gradient(to bottom, transparent 28%, #000 70%)', maskImage: 'linear-gradient(to bottom, transparent 28%, #000 70%)' }}><Scene /></div> : <Scene />}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: face === 'back' ? backScrim : frontScrim, pointerEvents: 'none', background: `linear-gradient(to top, ${SCRIMS[style][role]} 8%, transparent 100%)`, opacity: light ? 0.5 : 0.72 }} />
        </>
    );
}

// Keyed by the card's decoration name (see WS_EXTRA_CARD_STYLE in workshopThemes.js)
export const WS_EXTRA_ART = {};
['boardroom', 'blueprint', 'foundry'].forEach((style) => {
    ['speaker', 'organizer', 'panelist', 'attendee'].forEach((role) => {
        WS_EXTRA_ART[`ws${style}${role}`] = (props) => <StyleScene style={style} role={role} {...props} />;
    });
});

// ---------------------------------------------------------------- Photo frames
// One frame idea per style, with its own colours and count for each role.
const FRAME_COLOR = {
    boardroom: { speaker: ['#E6C25A', '#FFF1C2'], organizer: ['#C9A24B', '#E8D29A'], panelist: ['#8E1B33', '#C9A24B'], attendee: ['#F2D98A', '#FFFFFF'] },
    blueprint: { speaker: ['#FFB020', '#FFE2A0'], organizer: ['#E8914A', '#5AB8FF'], panelist: ['#0B1F44', '#C96F2B'], attendee: ['#FFC857', '#5AB8FF'] },
    foundry: { speaker: ['#EF7F52', '#2DBE8A'], organizer: ['#3FD1A0', '#E0693C'], panelist: ['#1E8E6A', '#D9663D'], attendee: ['#F5A07A', '#F7D9A8'] },
};
const FRAME_COUNT = { speaker: 12, organizer: 8, panelist: 16, attendee: 6 };

function Frame({ style, role }) {
    const [c1, c2] = FRAME_COLOR[style][role];
    const n = FRAME_COUNT[role];
    const marks = Array.from({ length: n }, (_, i) => i * (360 / n));
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            {style === 'boardroom' && (
                <>
                    <circle r="84" fill="none" stroke={c1} strokeOpacity="0.6" strokeWidth="1.2" />
                    <circle r="90" fill="none" stroke={c2} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="1 5" />
                    <g className="fx-cw">{marks.map((a) => { const [x, y] = pt(a, 87); return <path key={a} d="M0 -6 L4.4 0 L0 6 L-4.4 0 Z" transform={`translate(${x} ${y}) rotate(${a + 90})`} fill={c1} />; })}</g>
                </>
            )}
            {style === 'blueprint' && (
                <>
                    <circle r="82" fill="none" stroke={c1} strokeOpacity="0.55" strokeWidth="1.2" />
                    <g className="fx-ccw">{marks.map((a, i) => { const [x1, y1] = pt(a, 84); const [x2, y2] = pt(a, i % 2 ? 91 : 96); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 4 === 0 ? c2 : c1} strokeWidth={i % 2 ? 1.2 : 2.2} strokeLinecap="round" />; })}</g>
                    <path d="M-60 -58 A84 84 0 0 1 60 -58" fill="none" stroke={c2} strokeWidth="2.4" strokeLinecap="round" />
                </>
            )}
            {style === 'foundry' && (
                <>
                    <circle r="80" fill="none" stroke={c2} strokeOpacity="0.5" strokeWidth="1.2" />
                    <g className="fx-cw"><path d={gearPath(86, 95, n + 8)} fill="none" stroke={c1} strokeWidth="2" strokeLinejoin="round" /></g>
                </>
            )}
        </svg>
    );
}

export const WS_EXTRA_RING_FX = {};
['boardroom', 'blueprint', 'foundry'].forEach((style) => {
    ['speaker', 'organizer', 'panelist', 'attendee'].forEach((role) => {
        WS_EXTRA_RING_FX[`ws_${style}_${role}`] = () => <Frame style={style} role={role} />;
    });
});
