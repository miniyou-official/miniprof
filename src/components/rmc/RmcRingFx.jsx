// Frames drawn around the profile photo on the RMC 2026 role cards. Each role keeps its own colours and meaning:
// attendee = new growth, mentor = balance, speaker = pathways and sunrise, organizer = community.
// Decorative and aria-hidden; sized to sit on the 98px photo ring.

const rad = (d) => (d * Math.PI) / 180;
const pt = (deg, r) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r];
const LEAF = 'M0 0 C 7 -4, 12 -12, 10 -24 C 2 -20, -4 -10, 0 0 Z';

// Growth: sprouting leaves around the lower arc, a slow lime ring and a few fireflies
function EmpowermentFx() {
    const leaves = [];
    for (let i = 0; i < 11; i += 1) leaves.push(120 + i * 13);
    return (
        <svg className="rt-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="rx-cw"><circle r="82" fill="none" stroke="#D9F55A" strokeOpacity="0.8" strokeWidth="1.4" strokeDasharray="3 7" /></g>
            <path d="M-66 44 A80 80 0 0 0 66 44" fill="none" stroke="#3BAE74" strokeWidth="2.2" strokeLinecap="round" />
            {leaves.map((a, i) => {
                const [x, y] = pt(a, 66);
                return <path key={a} d={LEAF} transform={`translate(${x} ${y}) rotate(${a + 90 + (i % 2 ? 40 : -40)}) scale(${0.8 + (i % 3) * 0.12})`} fill={i % 2 ? '#D9F55A' : '#3BAE74'} />;
            })}
            <g className="rx-ccw">
                {[0, 120, 240].map((a) => { const [x, y] = pt(a, 90); return <circle key={a} cx={x} cy={y} r="3" fill="#D9F55A" style={{ filter: 'drop-shadow(0 0 4px #D9F55A)' }} />; })}
            </g>
        </svg>
    );
}

// Balance: two olive branches meeting under the photo, between two calm rings
function BalanceFx() {
    const left = [];
    for (let i = 0; i < 6; i += 1) left.push(118 + i * 14);
    return (
        <svg className="rt-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle r="84" fill="none" stroke="#0B7A75" strokeOpacity="0.55" strokeWidth="1" />
            <circle r="90" fill="none" stroke="#12B5A8" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 6" />
            {[1, -1].map((m) => (
                <g key={m} transform={`scale(${m} 1)`}>
                    <path d="M-30 64 A68 68 0 0 0 -66 8" fill="none" stroke="#0B7A75" strokeWidth="2" strokeLinecap="round" />
                    {left.map((a, i) => {
                        const [x, y] = pt(a, 67);
                        return <ellipse key={a} cx={x} cy={y} rx="9" ry="3.4" transform={`rotate(${a + (i % 2 ? 35 : -35)} ${x} ${y})`} fill={i % 2 ? '#12B5A8' : '#0B7A75'} />;
                    })}
                </g>
            ))}
            <circle cx="0" cy="68" r="3.4" fill="#D5E8B5" stroke="#0B7A75" />
        </svg>
    );
}

// Pathways: a rising sun arch with rays above the photo and a compass ring
function PathwaysFx() {
    const rays = [];
    for (let i = 0; i < 13; i += 1) rays.push(-180 + i * 15);
    return (
        <svg className="rt-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="rx-cw"><circle r="86" fill="none" stroke="#F4B860" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="1 6.2" /></g>
            <path d="M-72 -6 A72 72 0 0 1 72 -6" fill="none" stroke="#F4B860" strokeWidth="2.2" strokeLinecap="round" />
            {rays.map((a) => { const [x1, y1] = pt(a, 78); const [x2, y2] = pt(a, a % 45 === 0 ? 96 : 89); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F9D78A" strokeWidth={a % 45 === 0 ? 2.2 : 1.2} strokeLinecap="round" />; })}
            <path d="M0 -104 L4 -96 L0 -88 L-4 -96 Z" fill="#F9D78A" />
            <circle r="76" fill="none" stroke="#1B8DA6" strokeOpacity="0.55" strokeWidth="1" />
        </svg>
    );
}

// Community: a ring of small linked circles, warm and open
function CommunityFx() {
    const dots = [];
    for (let i = 0; i < 14; i += 1) dots.push(i * (360 / 14));
    const cols = ['#5B4DB5', '#E6A9CF', '#F7C9A0'];
    return (
        <svg className="rt-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="rx-cw">
                {dots.map((a, i) => { const [x, y] = pt(a, 80); return <circle key={a} cx={x} cy={y} r="9" fill="none" stroke={cols[i % 3]} strokeWidth="2.2" />; })}
            </g>
            <g className="rx-ccw">
                {[0, 90, 180, 270].map((a, i) => { const [x, y] = pt(a + 20, 92); return <circle key={a} cx={x} cy={y} r="3" fill={cols[(i + 1) % 3]} />; })}
            </g>
        </svg>
    );
}

// Unity: the speaker's sunrise arch and rays above the photo, with the attendee's lime leaves growing round the lower arc
function UnityFx() {
    const rays = [];
    for (let i = 0; i < 13; i += 1) rays.push(-180 + i * 15);
    const leaves = [];
    for (let i = 0; i < 9; i += 1) leaves.push(128 + i * 12);
    return (
        <svg className="rt-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="rx-cw"><circle r="86" fill="none" stroke="#F4B860" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="1 6.2" /></g>
            <path d="M-72 -6 A72 72 0 0 1 72 -6" fill="none" stroke="#F4B860" strokeWidth="2.2" strokeLinecap="round" />
            {rays.map((a) => { const [x1, y1] = pt(a, 78); const [x2, y2] = pt(a, a % 45 === 0 ? 96 : 89); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F9D78A" strokeWidth={a % 45 === 0 ? 2.2 : 1.2} strokeLinecap="round" />; })}
            <path d="M-60 50 A78 78 0 0 0 60 50" fill="none" stroke="#3BAE74" strokeWidth="2" strokeLinecap="round" />
            {leaves.map((a, i) => {
                const [x, y] = pt(a, 66);
                return <path key={a} d={LEAF} transform={`translate(${x} ${y}) rotate(${a + 90 + (i % 2 ? 40 : -40)}) scale(${0.8 + (i % 3) * 0.1})`} fill={i % 2 ? '#D9F55A' : '#3BAE74'} />;
            })}
            <g className="rx-ccw">
                {[20, 140, 260].map((a) => { const [x, y] = pt(a, 91); return <circle key={a} cx={x} cy={y} r="3" fill="#D9F55A" style={{ filter: 'drop-shadow(0 0 4px #D9F55A)' }} />; })}
            </g>
        </svg>
    );
}

export const RMC_RING_FX = { empowerment: EmpowermentFx, balance: BalanceFx, pathways: PathwaysFx, community: CommunityFx, unity: UnityFx };

export const RMC_RING_FX_CSS = `
.rt-ring .rt-fx { position: absolute; left: 50%; top: 50%; width: 196px; height: 196px; margin: -98px 0 0 -98px; z-index: 3; pointer-events: none; overflow: visible; }
.rx-cw { transform-origin: 0 0; animation: rxSpin 34s linear infinite; }
.rx-ccw { transform-origin: 0 0; animation: rxSpin 22s linear infinite reverse; }
@keyframes rxSpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .rx-cw, .rx-ccw { animation: none; } }
`;
