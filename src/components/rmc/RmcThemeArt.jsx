// Original, decorative SVG artwork for the four RMC themes. Everything here is aria-hidden.
// Each scene is drawn on a 340 x 600 canvas that matches the card, in separate layers
// (rt-l1 slow, rt-l2 medium, rt-l3 fast) so the card can shift them a little with the pointer.

const LEAF = 'M0 0 C 16 -8, 30 -28, 26 -56 C 8 -46, -4 -24, 0 0 Z';

// A leafy stem. The outer <g> positions it, the inner <g> sways.
function Sprig({ x, y, r = 0, s = 1, fills, stem, delay = 0 }) {
  const pairs = [[-18, 40], [-34, -38], [-58, 42], [-76, -40], [-102, 38], [-122, -36]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <g className="rt-sway" style={{ '--sd': `${delay}s` }}>
        <path d="M0 0 C 6 -40, -6 -90, 4 -150" fill="none" stroke={stem} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        {pairs.map(([py, rot], i) => (
          <g key={i} transform={`translate(0 ${py}) rotate(${rot}) scale(${rot < 0 ? -0.9 : 0.9} 0.9)`}>
            <path d={LEAF} fill={fills[i % fills.length]} />
          </g>
        ))}
        <g transform="translate(4 -150) rotate(4) scale(1.1)"><path d={LEAF} fill={fills[0]} /></g>
      </g>
    </g>
  );
}

// Adult with a child on their shoulder, side view.
function MotherChildProfile({ x, y, s = 1, fill, child, rim }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      <g fill={fill} stroke={rim} strokeWidth="1" strokeOpacity="0.7">
        <path d="M28 130 C 28 92, 58 76, 78 76 C 102 76, 132 92, 132 130 Z" />
        <rect x="70" y="60" width="16" height="22" rx="6" />
        <ellipse cx="78" cy="40" rx="20" ry="24" />
        <path d="M58 40 L50 47 L58 50 Z" />
        <circle cx="100" cy="24" r="13" />
        <path d="M58 34 C 56 8, 100 4, 100 36 C 94 26, 76 20, 58 34 Z" />
      </g>
      <g fill={child} stroke={rim} strokeWidth="1" strokeOpacity="0.7">
        <path d="M12 130 C 12 104, 24 96, 36 96 C 50 96, 60 104, 62 130 Z" />
        <circle cx="36" cy="78" r="16" />
        <path d="M24 70 C 26 56, 44 54, 50 66 C 42 62, 32 62, 24 70 Z" />
      </g>
      <path d="M50 100 Q 64 84 74 74" fill="none" stroke={child} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

// Adult and child walking hand in hand, full figure.
function WalkingPair({ x, y, s = 1, fill, rim }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={rim} strokeWidth="1" strokeOpacity="0.7" strokeLinejoin="round">
      <circle cx="78" cy="46" r="15" />
      <path d="M60 78 Q78 64 96 78 L108 152 Q112 184 118 212 L38 212 Q46 184 50 152 Z" />
      <circle cx="146" cy="112" r="10" />
      <path d="M134 126 Q146 120 158 126 L162 168 L158 212 L134 212 L130 168 Z" />
      <path d="M100 86 Q124 108 138 134" fill="none" stroke={fill} strokeWidth="7" strokeLinecap="round" />
      <rect x="36" y="150" width="14" height="18" rx="3" />
    </g>
  );
}

// A row of buildings. Heights come from a fixed list so the render is stable.
function Skyline({ x, y, w, h, fill, opacity = 1 }) {
  const bars = [0.5, 0.8, 0.62, 1, 0.7, 0.9, 0.55, 0.78, 0.6, 0.95, 0.68, 0.5];
  const bw = w / bars.length;
  return (
    <g transform={`translate(${x} ${y})`} fill={fill} opacity={opacity}>
      {bars.map((b, i) => (
        <rect key={i} x={i * bw} y={h - h * b} width={bw - 2} height={h * b} />
      ))}
    </g>
  );
}

// A head and shoulders bust, used for the community group.
function Bust({ cx, base, r, cloth, skin, hair, hairStyle = 'bun' }) {
  return (
    <g>
      <path d={`M${cx - r * 2.1} ${base} C ${cx - r * 2.1} ${base - r * 1.5}, ${cx - r * 1.1} ${base - r * 2.1}, ${cx} ${base - r * 2.1} C ${cx + r * 1.1} ${base - r * 2.1}, ${cx + r * 2.1} ${base - r * 1.5}, ${cx + r * 2.1} ${base} Z`} fill={cloth} />
      <rect x={cx - r * 0.3} y={base - r * 2.5} width={r * 0.6} height={r * 0.6} fill={skin} />
      {hairStyle === 'long' && <path d={`M${cx - r * 1.1} ${base - r * 3.6} C ${cx - r * 1.5} ${base - r * 2}, ${cx - r * 1.3} ${base - r * 1.6}, ${cx - r * 1.1} ${base - r * 1.4} L ${cx + r * 1.1} ${base - r * 1.4} C ${cx + r * 1.3} ${base - r * 1.6}, ${cx + r * 1.5} ${base - r * 2}, ${cx + r * 1.1} ${base - r * 3.6} Z`} fill={hair} />}
      <ellipse cx={cx} cy={base - r * 3.1} rx={r * 0.95} ry={r * 1.15} fill={skin} />
      <path d={`M${cx - r} ${base - r * 3.3} C ${cx - r} ${base - r * 4.6}, ${cx + r} ${base - r * 4.6}, ${cx + r} ${base - r * 3.3} C ${cx + r * 0.4} ${base - r * 3.9}, ${cx - r * 0.4} ${base - r * 3.9}, ${cx - r} ${base - r * 3.3} Z`} fill={hair} />
      {hairStyle === 'bun' && <circle cx={cx + r * 0.2} cy={base - r * 4.5} r={r * 0.6} fill={hair} />}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

function Svg({ children, className }) {
  return (
    <svg className={`rt-art ${className || ''}`} viewBox="0 0 340 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

// THEME 1: Empowerment & New Beginnings (dark green, golden moon, side-view silhouette)
function EmpowermentFront() {
  const g = ['#3BAE74', '#7ED29A', '#1E7D70', '#2A9B6A'];
  return (
    <Svg>
      <defs>
        <radialGradient id="t1moon" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FBEFB0" /><stop offset="0.7" stopColor="#F3DE8A" /><stop offset="1" stopColor="#E9C85F" />
        </radialGradient>
      </defs>
      <g className="rt-l1">
        <circle className="rt-pulse" cx="288" cy="104" r="84" fill="#F3DE8A" opacity="0.14" />
        <circle cx="288" cy="104" r="58" fill="url(#t1moon)" opacity="0.95" />
      </g>
      <g className="rt-l2">
        <MotherChildProfile x={240} y={40} s={0.7} fill="#04252D" child="#063640" rim="#F3DE8A" />
      </g>
      <g className="rt-l3">
        <Sprig x={22} y={540} r={6} s={1.15} fills={g} stem="#7ED29A" delay={0} />
        <Sprig x={-6} y={604} r={-4} s={1.2} fills={g} stem="#7ED29A" delay={1.2} />
        <Sprig x={330} y={560} r={-14} s={1.15} fills={g} stem="#7ED29A" delay={0.6} />
      </g>
    </Svg>
  );
}
function EmpowermentBack() {
  const g = ['#3BAE74', '#7ED29A', '#1E7D70', '#2A9B6A'];
  return (
    <Svg>
      <g className="rt-l1"><circle className="rt-pulse" cx="300" cy="170" r="110" fill="#F3DE8A" opacity="0.13" /></g>
      <g className="rt-l2"><MotherChildProfile x={206} y={70} s={1.1} fill="#04252D" child="#063640" rim="#F3DE8A" /></g>
      <g className="rt-l3">
        <Sprig x={16} y={600} r={8} s={0.95} fills={g} stem="#7ED29A" delay={0.4} />
        <Sprig x={330} y={600} r={-12} s={0.95} fills={g} stem="#7ED29A" delay={1.4} />
      </g>
    </Svg>
  );
}

// THEME 2: Balance & Growth (cream, watercolour leaves, quiet skyline)
function BalanceFront() {
  const g = ['#1FA39A', '#62C2A8', '#9ED8B0', '#CFE6A8'];
  return (
    <Svg>
      <g className="rt-l1">
        <Skyline x={150} y={420} w={200} h={70} fill="#7FB8AE" opacity={0.22} />
        <circle cx="290" cy="60" r="70" fill="#FFFFFF" opacity="0.6" />
      </g>
      <g className="rt-l2">
        <WalkingPair x={262} y={384} s={0.36} fill="#1E6F73" rim="#0B7A75" />
      </g>
      <g className="rt-l3">
        <Sprig x={12} y={540} r={-6} s={1.1} fills={g} stem="#1FA39A" delay={0} />
        <Sprig x={332} y={548} r={10} s={1.1} fills={g} stem="#1FA39A" delay={1.1} />
        <Sprig x={44} y={606} r={10} s={1.0} fills={g} stem="#1FA39A" delay={2} />
        <Sprig x={300} y={606} r={-10} s={1.0} fills={g} stem="#1FA39A" delay={0.7} />
      </g>
    </Svg>
  );
}
function BalanceBack() {
  const g = ['#1FA39A', '#62C2A8', '#9ED8B0', '#CFE6A8'];
  return (
    <Svg>
      <g className="rt-l1"><Skyline x={170} y={150} w={190} h={130} fill="#7FB8AE" opacity={0.2} /></g>
      <g className="rt-l2"><WalkingPair x={262} y={190} s={0.4} fill="#1E6F73" rim="#0B7A75" /></g>
      <g className="rt-l3">
        <Sprig x={12} y={600} r={-6} s={0.95} fills={g} stem="#1FA39A" delay={0.3} />
        <Sprig x={330} y={600} r={-8} s={0.95} fills={g} stem="#1FA39A" delay={1.3} />
      </g>
    </Svg>
  );
}

// THEME 3: Pathways & Possibilities (teal, golden archway, winding road)
function PathwaysFront() {
  const g = ['#5FC08A', '#8FD9A8', '#2A9B8A', '#3BAE74'];
  return (
    <Svg>
      <defs>
        <linearGradient id="t3arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9D78A" /><stop offset="0.6" stopColor="#F2A65A" stopOpacity="0.9" /><stop offset="1" stopColor="#F2A65A" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id="t3clip"><path d="M242 184 L242 100 C242 64 264 42 292 42 C320 42 342 64 342 100 L342 184 Z" /></clipPath>
      </defs>
      <g className="rt-l1">
        <path d="M234 190 L234 100 C234 56 262 34 292 34 C324 34 350 56 350 100 L350 190 Z" fill="#0A3B4D" opacity="0.7" />
        <g clipPath="url(#t3clip)">
          <rect x="230" y="30" width="130" height="170" fill="url(#t3arch)" />
          <Skyline x={242} y={130} w={100} h={56} fill="#C77B3E" opacity={0.55} />
        </g>
      </g>
      <g className="rt-l2"><WalkingPair x={262} y={128} s={0.26} fill="#052A3A" rim="#F9D78A" /></g>
      <g className="rt-l3">
        <Sprig x={18} y={540} r={8} s={1.1} fills={g} stem="#8FD9A8" delay={0} />
        <Sprig x={-4} y={604} r={-3} s={1.2} fills={g} stem="#8FD9A8" delay={1.2} />
        <Sprig x={332} y={560} r={-12} s={1.1} fills={g} stem="#8FD9A8" delay={0.7} />
      </g>
    </Svg>
  );
}
function PathwaysBack() {
  const g = ['#5FC08A', '#8FD9A8', '#2A9B8A', '#3BAE74'];
  return (
    <Svg>
      <defs>
        <linearGradient id="t3road" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F4B860" stopOpacity="0.9" /><stop offset="1" stopColor="#F9D78A" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g className="rt-l1">
        <Skyline x={120} y={400} w={220} h={70} fill="#F4B860" opacity={0.18} />
        <path className="rt-road" d="M120 600 C 220 560, 90 520, 190 490 C 260 470, 200 440, 250 420 L 262 424 C 224 446, 280 474, 200 504 C 120 534, 250 566, 190 600 Z" fill="url(#t3road)" opacity="0.5" />
      </g>
      <g className="rt-l3">
        <Sprig x={16} y={600} r={8} s={0.95} fills={g} stem="#8FD9A8" delay={0.2} />
        <Sprig x={332} y={600} r={-10} s={0.95} fills={g} stem="#8FD9A8" delay={1.3} />
      </g>
    </Svg>
  );
}

// THEME 4: Community & Support (lavender, soft sun, a group of people)
function CommunityFront() {
  const g = ['#6B5BD0', '#A58DDB', '#C9A6E8', '#8A7BE0'];
  return (
    <Svg>
      <g className="rt-l1">
        <circle className="rt-pulse" cx="290" cy="80" r="86" fill="#F7C9A0" opacity="0.35" />
        <circle cx="290" cy="80" r="46" fill="#FBE2C8" opacity="0.8" />
      </g>
      <g className="rt-l2" opacity="0.92">
        <Bust cx={52} base={482} r={10.5} cloth="#5C4BC0" skin="#E8B9A2" hair="#2B1E6E" hairStyle="bun" />
        <Bust cx={112} base={482} r={11.5} cloth="#C86DB5" skin="#D9A58C" hair="#3A2468" hairStyle="long" />
        <Bust cx={172} base={482} r={13} cloth="#8E7CE0" skin="#F0C7B0" hair="#2B1E6E" hairStyle="bun" />
        <Bust cx={232} base={482} r={11.5} cloth="#4C6BC9" skin="#DDAE95" hair="#1F1650" hairStyle="long" />
        <Bust cx={290} base={482} r={10.5} cloth="#9B5BD0" skin="#E8B9A2" hair="#3A2468" hairStyle="bun" />
      </g>
      <g className="rt-l3">
        <Sprig x={10} y={540} r={-8} s={1.1} fills={g} stem="#6B5BD0" delay={0} />
        <Sprig x={334} y={540} r={12} s={1.1} fills={g} stem="#6B5BD0" delay={1} />
      </g>
    </Svg>
  );
}
function CommunityBack() {
  const g = ['#6B5BD0', '#A58DDB', '#C9A6E8', '#8A7BE0'];
  return (
    <Svg>
      <g className="rt-l1">
        <circle className="rt-pulse" cx="290" cy="90" r="100" fill="#F7C9A0" opacity="0.32" />
      </g>
      <g className="rt-l2" opacity="0.9">
        <Bust cx={20} base={330} r={18} cloth="#5C4BC0" skin="#E8B9A2" hair="#2B1E6E" hairStyle="long" />
        <Bust cx={322} base={330} r={18} cloth="#C86DB5" skin="#D9A58C" hair="#3A2468" hairStyle="bun" />
      </g>
      <g className="rt-l3">
        <Sprig x={10} y={600} r={-6} s={0.95} fills={g} stem="#6B5BD0" delay={0.3} />
        <Sprig x={334} y={600} r={10} s={0.95} fills={g} stem="#6B5BD0" delay={1.2} />
      </g>
    </Svg>
  );
}

// THEME 5: Unity & Leadership (organizers). A mix of the attendee (green, golden glow, lime leaves) and the speaker (sunrise arch, road) designs.
function UnityFront() {
  const g = ['#D9F55A', '#7ED29A', '#3BAE74', '#2A9B6A'];
  return (
    <Svg>
      <defs>
        <linearGradient id="t5arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9D78A" /><stop offset="0.6" stopColor="#F2A65A" stopOpacity="0.9" /><stop offset="1" stopColor="#D9F55A" stopOpacity="0.25" />
        </linearGradient>
        <clipPath id="t5clip"><path d="M242 184 L242 100 C242 64 264 42 292 42 C320 42 342 64 342 100 L342 184 Z" /></clipPath>
      </defs>
      <g className="rt-l1" transform="translate(77 7.5) scale(0.78)">
        <path d="M234 190 L234 100 C234 56 262 34 292 34 C324 34 350 56 350 100 L350 190 Z" fill="#04252D" opacity="0.7" />
        <g clipPath="url(#t5clip)">
          <rect x="230" y="30" width="130" height="170" fill="url(#t5arch)" />
          <Skyline x={242} y={130} w={100} h={56} fill="#C77B3E" opacity={0.55} />
        </g>
      </g>
      <g className="rt-l2" transform="translate(77 7.5) scale(0.78)"><WalkingPair x={262} y={128} s={0.26} fill="#04252D" rim="#F9D78A" /></g>
      <g className="rt-l3">
        <Sprig x={22} y={540} r={6} s={1.15} fills={g} stem="#7ED29A" delay={0} />
        <Sprig x={-6} y={604} r={-4} s={1.2} fills={g} stem="#7ED29A" delay={1.2} />
        <Sprig x={330} y={560} r={-14} s={1.15} fills={g} stem="#7ED29A" delay={0.6} />
      </g>
    </Svg>
  );
}
function UnityBack() {
  const g = ['#D9F55A', '#7ED29A', '#3BAE74', '#2A9B6A'];
  return (
    <Svg>
      <defs>
        <linearGradient id="t5road" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F4B860" stopOpacity="0.9" /><stop offset="1" stopColor="#D9F55A" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g className="rt-l1">
        <circle className="rt-pulse" cx="300" cy="170" r="110" fill="#F3DE8A" opacity="0.13" />
        <Skyline x={120} y={400} w={220} h={70} fill="#F4B860" opacity={0.18} />
        <path className="rt-road" d="M120 600 C 220 560, 90 520, 190 490 C 260 470, 200 440, 250 420 L 262 424 C 224 446, 280 474, 200 504 C 120 534, 250 566, 190 600 Z" fill="url(#t5road)" opacity="0.5" />
      </g>
      <g className="rt-l2"><MotherChildProfile x={206} y={70} s={1.1} fill="#04252D" child="#063640" rim="#F3DE8A" /></g>
      <g className="rt-l3">
        <Sprig x={16} y={600} r={8} s={0.95} fills={g} stem="#7ED29A" delay={0.4} />
        <Sprig x={332} y={600} r={-12} s={0.95} fills={g} stem="#7ED29A" delay={1.4} />
      </g>
    </Svg>
  );
}

export const THEME_ART = {
  empowerment: { front: EmpowermentFront, back: EmpowermentBack },
  balance: { front: BalanceFront, back: BalanceBack },
  pathways: { front: PathwaysFront, back: PathwaysBack },
  community: { front: CommunityFront, back: CommunityBack },
  unity: { front: UnityFront, back: UnityBack },
};
