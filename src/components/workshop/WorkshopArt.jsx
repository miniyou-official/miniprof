// Original, decorative SVG artwork for the four Innovation Workshop role cards. Everything here is aria-hidden.
// Drawn on the same 340 x 600 canvas as the RMC artwork, in the same layers (rt-l1 slow, rt-l2 medium, rt-l3 fast),
// from the workshop poster: the lightbulb with a sprout, the rising bar chart and arrow, the timeline dots and the
// rounded takeaway panels.

import { RMC_ART_CSS } from '../rmc/rmcArtCss';

const LEAF = 'M0 0 C 16 -8, 30 -28, 26 -56 C 8 -46, -4 -24, 0 0 Z';
const BULB = 'M-32 64 C -54 44, -64 22, -64 -4 C -64 -42, -36 -70, 0 -70 C 36 -70, 64 -42, 64 -4 C 64 22, 54 44, 32 64 Z';

function Svg({ children }) {
    return (
        <svg className="rt-art" viewBox="0 0 340 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            {children}
        </svg>
    );
}

// A small sprout: a stem with leaf pairs. The outer <g> positions it, the inner <g> sways.
function Sprout({ x, y, r = 0, s = 1, fills, stem, delay = 0 }) {
    const pairs = [[-24, 38], [-50, -38], [-76, 40]];
    return (
        <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
            <g className="rt-sway" style={{ '--sd': `${delay}s` }}>
                <path d="M0 0 C 4 -30, -4 -64, 2 -104" fill="none" stroke={stem} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
                {pairs.map(([py, rot], i) => (
                    <g key={i} transform={`translate(0 ${py}) rotate(${rot}) scale(${rot < 0 ? -0.85 : 0.85} 0.85)`}>
                        <path d={LEAF} fill={fills[i % fills.length]} />
                    </g>
                ))}
                <g transform="translate(2 -104) rotate(4) scale(1)"><path d={LEAF} fill={fills[0]} /></g>
            </g>
        </g>
    );
}

// The poster's lightbulb: a glass bulb with a sprout growing inside it
function Bulb({ x, y, s = 1, glass, fill = 'none', leaf, stem, base, glow }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            {glow && <circle className="rt-pulse" r="106" fill={glow} fillOpacity="0.2" />}
            <path d={BULB} fill={fill} stroke={glass} strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M-30 64 Q0 46 30 64 Z" fill={leaf} opacity="0.9" />
            <path d="M0 62 C 1 44, -1 26, 0 8" fill="none" stroke={stem} strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(0 10)">
                <path d={LEAF} transform="rotate(14) scale(0.62)" fill={leaf} />
                <path d={LEAF} transform="rotate(-14) scale(-0.62 0.62)" fill={leaf} opacity="0.85" />
            </g>
            <g fill={base}>
                <rect x="-27" y="68" width="54" height="9" rx="4" />
                <rect x="-22" y="81" width="44" height="9" rx="4" />
                <rect x="-13" y="93" width="26" height="8" rx="4" />
            </g>
        </g>
    );
}

// The poster's rising bar chart with its growth arrow. (x, y) is the left end of the baseline.
function Bars({ x, y, s = 1, fill, hi, arrow }) {
    const heights = [34, 58, 86, 118];
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            {heights.map((h, i) => <rect key={h} x={i * 34} y={-h} width="24" height={h} rx="5" fill={i === 3 ? hi : fill} />)}
            <path d="M-4 -22 L 38 -66 L 72 -50 L 118 -122" fill="none" stroke={arrow} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M122 -136 L 120.5 -115.9 L 105.1 -125.1 Z" fill={arrow} stroke={arrow} strokeWidth="2" strokeLinejoin="round" />
        </g>
    );
}

// The poster's programme timeline: a vertical line of dots with a short row beside each
function Timeline({ x, y, s = 1, n = 5, gap = 50, line, dot, bg }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d={`M0 0 L0 ${(n - 1) * gap}`} stroke={line} strokeWidth="3" strokeLinecap="round" />
            {Array.from({ length: n }, (_, i) => (
                <g key={i}>
                    <rect x="-34" y={i * gap - 3} width={i % 2 ? 20 : 28} height="6" rx="3" fill={line} opacity="0.5" />
                    <circle cx="0" cy={i * gap} r="7.5" fill={bg} stroke={dot} strokeWidth="3" />
                </g>
            ))}
        </g>
    );
}

// The poster's rounded "key takeaways" tiles: two by two, one filled
function Tiles({ x, y, s = 1, stroke, fill }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={stroke} strokeWidth="2.5">
            <rect x="0" y="0" width="32" height="32" rx="9" fill={fill} stroke="none" />
            <rect x="40" y="0" width="32" height="32" rx="9" />
            <rect x="0" y="40" width="32" height="32" rx="9" />
            <rect x="40" y="40" width="32" height="32" rx="9" />
        </g>
    );
}

// Idea to scale: a dotted climbing path with a node for each step
function Ascent({ x, y, s = 1, line, node, hi }) {
    const pts = [[0, 0, 7], [80, -40, 9], [160, -92, 11], [240, -152, 13]];
    return (
        <g transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 C 40 0, 40 -40, 80 -40 S 120 -92, 160 -92 S 200 -152, 240 -152" fill="none" stroke={line} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 9" />
            {pts.map(([px, py, r], i) => <circle key={i} cx={px} cy={py} r={r} fill={i === 3 ? hi : node} />)}
            <path d="M252 -170 L 262 -150 L 240 -156 Z" fill={hi} stroke={hi} strokeWidth="2" strokeLinejoin="round" />
        </g>
    );
}

function Dots({ list, fill }) {
    return <g fill={fill}>{list.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} opacity={0.35 + (i % 3) * 0.2} />)}</g>;
}

// ---- Speaker: brightest lime on deep teal. A glowing bulb above, a rising bar chart below.
const SP = { lime: '#C8E83A', mint: '#9ED8B0', glass: '#E9F9A8', leaves: ['#C8E83A', '#9ED8B0', '#1FA58A', '#B6E02E'] };
function SpeakerFront() {
    return (
        <Svg>
            <g className="rt-l1">
                <circle className="rt-pulse" cx="292" cy="96" r="86" fill={SP.lime} fillOpacity="0.14" />
                <Bars x={196} y={596} s={0.62} fill="#1FA58A" hi={SP.lime} arrow={SP.lime} />
            </g>
            <g className="rt-l2"><Bulb x={284} y={94} s={0.58} glass={SP.glass} fill="rgba(200,232,58,0.12)" leaf={SP.lime} stem={SP.mint} base={SP.mint} /></g>
            <g className="rt-l3">
                <Sprout x={20} y={560} r={6} s={1.1} fills={SP.leaves} stem={SP.mint} delay={0} />
                <Sprout x={326} y={604} r={-8} s={0.9} fills={SP.leaves} stem={SP.mint} delay={1.1} />
            </g>
        </Svg>
    );
}
function SpeakerBack() {
    return (
        <Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="70" cy="440" r="96" fill={SP.lime} fillOpacity="0.12" /></g>
            <g className="rt-l2">
                <Bulb x={64} y={416} s={0.6} glass={SP.glass} fill="rgba(200,232,58,0.12)" leaf={SP.lime} stem={SP.mint} base={SP.mint} />
                <Bars x={156} y={518} s={0.95} fill="#1FA58A" hi={SP.lime} arrow={SP.lime} />
            </g>
            <g className="rt-l3"><Sprout x={330} y={604} r={-8} s={0.9} fills={SP.leaves} stem={SP.mint} delay={0.8} /></g>
        </Svg>
    );
}

// ---- Organizer: the darkest teal with mint lines. The poster's takeaway tiles and programme timeline.
const OR = { mint: '#8DEBC2', lime: '#B6E02E', bg: '#042326', leaves: ['#8DEBC2', '#B6E02E', '#2FB59A', '#5FD3A8'] };
function OrganizerFront() {
    return (
        <Svg>
            <g className="rt-l1">
                <circle className="rt-pulse" cx="292" cy="80" r="84" fill={OR.mint} fillOpacity="0.1" />
                <Timeline x={322} y={132} n={4} gap={38} line={OR.mint} dot={OR.lime} bg={OR.bg} />
            </g>
            <g className="rt-l2"><Tiles x={256} y={36} s={0.9} stroke={OR.mint} fill={OR.lime} /></g>
            <g className="rt-l3">
                <Sprout x={20} y={560} r={6} s={1.1} fills={OR.leaves} stem={OR.mint} delay={0} />
                <Sprout x={300} y={604} r={-8} s={0.9} fills={OR.leaves} stem={OR.mint} delay={1.2} />
            </g>
        </Svg>
    );
}
function OrganizerBack() {
    // A programme timeline laid on its side, each stop growing into a bar
    const stops = [0, 1, 2, 3, 4, 5];
    return (
        <Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="270" cy="430" r="100" fill={OR.mint} fillOpacity="0.1" /></g>
            <g className="rt-l2">
                <path d="M30 470 L310 470" stroke={OR.mint} strokeWidth="3" strokeLinecap="round" />
                {stops.map((i) => (
                    <g key={i}>
                        <rect x={30 + i * 56 - 9} y={470 - 22 - i * 16} width="18" height={22 + i * 16} rx="5" fill={i === 5 ? OR.lime : '#2FB59A'} opacity={i === 5 ? 1 : 0.6} />
                        <circle cx={30 + i * 56} cy="470" r="8" fill={OR.bg} stroke={OR.lime} strokeWidth="3" />
                    </g>
                ))}
            </g>
            <g className="rt-l3"><Sprout x={16} y={604} r={6} s={0.9} fills={OR.leaves} stem={OR.mint} delay={0.5} /></g>
        </Svg>
    );
}

// ---- Panelist: light mint with teal and soft green, calm and open. A bulb outline, a sprout, a gentle rise.
const ME = { teal: '#0E6B63', green: '#8CC63F', soft: '#BFE3B0', leaves: ['#0E6B63', '#5FB86A', '#8CC63F', '#BFE3B0'] };
function PanelistFront() {
    return (
        <Svg>
            <g className="rt-l1">
                <circle cx="292" cy="70" r="84" fill="#FFFFFF" opacity="0.7" />
                <Bars x={206} y={596} s={0.5} fill={ME.soft} hi={ME.green} arrow={ME.teal} />
            </g>
            <g className="rt-l2"><Bulb x={284} y={94} s={0.53} glass={ME.teal} fill="rgba(255,255,255,0.55)" leaf={ME.green} stem={ME.teal} base={ME.teal} /></g>
            <g className="rt-l3">
                <Sprout x={20} y={560} r={6} s={1.1} fills={ME.leaves} stem={ME.teal} delay={0} />
                <Sprout x={326} y={604} r={-8} s={0.9} fills={ME.leaves} stem={ME.teal} delay={1.1} />
            </g>
        </Svg>
    );
}
function PanelistBack() {
    return (
        <Svg>
            <g className="rt-l1"><circle cx="270" cy="430" r="110" fill="#FFFFFF" opacity="0.6" /></g>
            <g className="rt-l2"><Bars x={150} y={520} s={0.95} fill={ME.soft} hi={ME.green} arrow={ME.teal} /></g>
            <g className="rt-l3">
                <Sprout x={22} y={604} r={6} s={1.05} fills={ME.leaves} stem={ME.teal} delay={0.3} />
                <Sprout x={64} y={604} r={-10} s={0.7} fills={ME.leaves} stem={ME.teal} delay={1.4} />
            </g>
        </Svg>
    );
}

// ---- Attendee: fresh and bright. A seedling and confetti above, the climb from idea to scale below.
const AT = { lime: '#E2FF5C', mint: '#7BE0B5', white: '#FFFFFF', leaves: ['#E2FF5C', '#7BE0B5', '#B9F0D2', '#FFFFFF'] };
function AttendeeFront() {
    return (
        <Svg>
            <g className="rt-l1">
                <circle className="rt-pulse" cx="292" cy="96" r="84" fill={AT.lime} fillOpacity="0.16" />
                <Dots list={[[246, 52, 4], [326, 40, 3], [262, 150, 3], [318, 168, 4], [236, 104, 2.5]]} fill={AT.lime} />
            </g>
            <g className="rt-l2"><Sprout x={292} y={176} r={0} s={0.7} fills={AT.leaves} stem={AT.white} delay={0.4} /></g>
            <g className="rt-l3">
                <Sprout x={20} y={560} r={6} s={1.1} fills={AT.leaves} stem={AT.mint} delay={0} />
                <Sprout x={326} y={604} r={-8} s={0.9} fills={AT.leaves} stem={AT.mint} delay={1} />
            </g>
        </Svg>
    );
}
function AttendeeBack() {
    return (
        <Svg>
            <g className="rt-l1"><circle className="rt-pulse" cx="260" cy="400" r="110" fill={AT.lime} fillOpacity="0.14" /></g>
            <g className="rt-l2">
                <Ascent x={40} y={500} s={1} line={AT.white} node={AT.mint} hi={AT.lime} />
                <Dots list={[[60, 380, 4], [140, 420, 3], [300, 350, 4], [200, 340, 2.5]]} fill={AT.lime} />
            </g>
            <g className="rt-l3"><Sprout x={20} y={604} r={6} s={0.95} fills={AT.leaves} stem={AT.mint} delay={0.6} /></g>
        </Svg>
    );
}

const SCENES = {
    speaker: { front: SpeakerFront, back: SpeakerBack },
    organizer: { front: OrganizerFront, back: OrganizerBack },
    panelist: { front: PanelistFront, back: PanelistBack },
    attendee: { front: AttendeeFront, back: AttendeeBack },
};

// The artwork for one role. On the back it stays in the lower half so the QR code and Back button stay clear.
function WsScene({ role, scrim, face = 'front', frontScrim = '34%', backScrim = '28%', opacity = 0.7 }) {
    const Scene = SCENES[role][face] || SCENES[role].front;
    return (
        <>
            <style>{RMC_ART_CSS}</style>
            {face === 'back' ? <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: 'linear-gradient(to bottom, transparent 28%, #000 70%)', maskImage: 'linear-gradient(to bottom, transparent 28%, #000 70%)' }}><Scene /></div> : <Scene />}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: face === 'back' ? backScrim : frontScrim, pointerEvents: 'none', background: `linear-gradient(to top, ${scrim} 8%, transparent 100%)`, opacity }} />
        </>
    );
}

// Keyed by the card's decoration name (see CARD_STYLE in card/cardThemes.js)
export const WS_ART = {
    wsspeaker: (props) => <WsScene role="speaker" scrim="#052F31" frontScrim="36%" {...props} />,
    wsorganizer: (props) => <WsScene role="organizer" scrim="#031D20" frontScrim="36%" opacity={0.75} {...props} />,
    wspanelist: (props) => <WsScene role="panelist" scrim="#DDEFD6" frontScrim="26%" backScrim="22%" opacity={0.5} {...props} />,
    wsattendee: (props) => <WsScene role="attendee" scrim="#0A5F59" frontScrim="38%" opacity={0.75} {...props} />,
};
