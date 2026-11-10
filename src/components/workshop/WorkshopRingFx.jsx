// Frames drawn around the profile photo on the Innovation Workshop role cards, one for each role:
// speaker = an idea burst, organizer = linked programme dots, panelist = a calm ring with sprouting leaves,
// attendee = rising arrows. Decorative and aria-hidden; they use the card's .mu-fx sizing and spin classes.

const rad = (d) => (d * Math.PI) / 180;
const pt = (deg, r) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r];
const LEAF = 'M0 0 C 7 -4, 12 -12, 10 -24 C 2 -20, -4 -10, 0 0 Z';

function SpeakerFx() {
    const rays = [];
    for (let i = 0; i < 11; i += 1) rays.push(-165 + i * 15);
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="fx-cw"><circle r="86" fill="none" stroke="#C8E83A" strokeOpacity="0.65" strokeWidth="1.3" strokeDasharray="1 6.2" /></g>
            {rays.map((a) => { const [x1, y1] = pt(a, 78); const [x2, y2] = pt(a, a % 45 === 0 ? 97 : 90); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E9F9A8" strokeWidth={a % 45 === 0 ? 2.4 : 1.4} strokeLinecap="round" />; })}
            <circle r="76" fill="none" stroke="#1FA58A" strokeOpacity="0.6" strokeWidth="1" />
        </svg>
    );
}

function OrganizerFx() {
    const dots = [];
    for (let i = 0; i < 12; i += 1) dots.push(i * 30);
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle r="84" fill="none" stroke="#8DEBC2" strokeOpacity="0.5" strokeWidth="1.2" />
            <g className="fx-cw">
                {dots.map((a, i) => { const [x, y] = pt(a, 84); return <circle key={a} cx={x} cy={y} r={i % 3 === 0 ? 4.4 : 3} fill={i % 3 === 0 ? '#B6E02E' : '#8DEBC2'} />; })}
            </g>
            <g className="fx-ccw"><circle r="92" fill="none" stroke="#B6E02E" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 7" /></g>
        </svg>
    );
}

function PanelistFx() {
    const left = [];
    for (let i = 0; i < 5; i += 1) left.push(150 + i * 15);
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle r="84" fill="none" stroke="#0E6B63" strokeOpacity="0.55" strokeWidth="1" />
            <circle r="90" fill="none" stroke="#8CC63F" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 6" />
            {[1, -1].map((m) => (
                <g key={m} transform={`scale(${m} 1)`}>
                    <path d="M-55 38 A67 67 0 0 1 -60 -34" fill="none" stroke="#0E6B63" strokeWidth="2" strokeLinecap="round" />
                    {left.map((a, i) => {
                        const [x, y] = pt(a, 67);
                        return <path key={a} d={LEAF} transform={`translate(${x} ${y}) rotate(${a + 90 + (i % 2 ? 40 : -40)}) scale(${0.8 + (i % 3) * 0.1})`} fill={i % 2 ? '#8CC63F' : '#0E6B63'} />;
                    })}
                </g>
            ))}
        </svg>
    );
}

function AttendeeFx() {
    return (
        <svg className="mu-fx" viewBox="-100 -100 200 200" aria-hidden="true">
            <g className="fx-cw"><circle r="84" fill="none" stroke="#E2FF5C" strokeOpacity="0.8" strokeWidth="1.4" strokeDasharray="3 7" /></g>
            <g className="fx-ccw">
                {[0, 90, 180, 270].map((a) => { const [x, y] = pt(a, 91); return <path key={a} d="M-6 4 L0 -5 L6 4" transform={`translate(${x} ${y}) rotate(${a + 90})`} fill="none" stroke="#E2FF5C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />; })}
                {[45, 135, 225, 315].map((a) => { const [x, y] = pt(a, 91); return <circle key={a} cx={x} cy={y} r="2.6" fill="#7BE0B5" style={{ filter: 'drop-shadow(0 0 4px #7BE0B5)' }} />; })}
            </g>
        </svg>
    );
}

export const WS_RING_FX = { ws_speaker: SpeakerFx, ws_organizer: OrganizerFx, ws_panelist: PanelistFx, ws_attendee: AttendeeFx };
