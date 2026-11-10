// Decorative, aria-hidden artwork behind the profile card. It is drawn with the user's own
// card colours (CSS variables --g1 / --g2), so every theme keeps its palette.

import { THEME_ART } from '../rmc/RmcThemeArt';
import { RMC_ART_CSS } from '../rmc/rmcArtCss';
import { DESIGN_ART } from './themeDesigns';
import { WS_ART } from '../workshop/WorkshopArt';
import { WS_EXTRA_ART } from '../workshop/WorkshopStylesArt';

const LEAF = 'M0 0 C 16 -8, 30 -28, 26 -56 C 8 -46, -4 -24, 0 0 Z';

// A leafy stem. The outer <g> positions it, the inner <g> sways.
function Sprig({ x, y, r = 0, s = 1, delay = 0, flip = false }) {
    const pairs = [[-18, 40], [-38, -38], [-62, 42], [-84, -40], [-110, 38]];
    return (
        <g transform={`translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})`}>
            <g className="mu-sway" style={{ '--sd': `${delay}s` }}>
                <path d="M0 0 C 6 -40, -6 -90, 4 -140" fill="none" stroke="var(--g1)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                {pairs.map(([py, rot], i) => (
                    <g key={i} transform={`translate(0 ${py}) rotate(${rot}) scale(${rot < 0 ? -0.9 : 0.9} 0.9)`}>
                        <path d={LEAF} fill={i % 2 ? 'var(--g2)' : 'var(--g1)'} opacity={i % 2 ? 0.42 : 0.55} />
                    </g>
                ))}
                <g transform="translate(4 -140) rotate(4) scale(1.05)"><path d={LEAF} fill="var(--g1)" opacity="0.6" /></g>
            </g>
        </g>
    );
}

// Community: flowing layered waves along the bottom, plus a soft glow and leafy sprigs in the corners
function CommunityArt() {
    return (
        <>
            <div className="mu-orb" style={{ top: '-70px', right: '-60px', width: 260, height: 260 }} />
            <svg className="mu-wave mu-l1" viewBox="0 0 400 320" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="muCw1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="var(--g1)" stopOpacity="0.3" />
                        <stop offset="1" stopColor="var(--g2)" stopOpacity="0.14" />
                    </linearGradient>
                    <linearGradient id="muCw2" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="var(--g2)" stopOpacity="0.2" />
                        <stop offset="1" stopColor="var(--g1)" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path className="mu-drift" d="M0 120 C 70 60, 130 150, 200 110 C 270 70, 330 130, 400 80 L400 320 L0 320 Z" fill="url(#muCw2)" />
                <path className="mu-drift mu-drift-2" d="M0 190 C 80 140, 150 230, 230 180 C 300 138, 350 200, 400 160 L400 320 L0 320 Z" fill="url(#muCw1)" />
                <path d="M0 120 C 70 60, 130 150, 200 110 C 270 70, 330 130, 400 80" fill="none" stroke="var(--g2)" strokeOpacity="0.35" strokeWidth="1" />
                <path d="M0 190 C 80 140, 150 230, 230 180 C 300 138, 350 200, 400 160" fill="none" stroke="var(--g1)" strokeOpacity="0.4" strokeWidth="1" />
            </svg>
            <svg className="mu-sprigs mu-l2" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                <Sprig x={30} y={162} r={-6} s={0.9} delay={0} />
                <Sprig x={66} y={166} r={14} s={0.55} delay={1.4} />
                <Sprig x={370} y={162} r={6} s={0.9} delay={0.7} flip />
                <Sprig x={334} y={166} r={-14} s={0.55} delay={2.1} flip />
            </svg>
            <svg className="mu-arc mu-l3" viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="170" cy="30" r="64" fill="none" stroke="var(--g2)" strokeOpacity="0.28" strokeWidth="1" />
                <circle cx="170" cy="30" r="92" fill="none" stroke="var(--g1)" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 6" />
            </svg>
        </>
    );
}

// Pathways: the exact "Pathways & Possibilities" artwork from the RMC speaker design (arch window, skyline, leaves)
function PathwaysArt({ face = 'front' }) {
    const Scene = THEME_ART.pathways[face] || THEME_ART.pathways.front;
    return (
        <>
            <style>{RMC_ART_CSS}</style>
            <Scene />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: face === 'back' ? '34%' : '46%', pointerEvents: 'none', background: 'linear-gradient(to top, #052A3A 8%, transparent 100%)', opacity: 0.8 }} />
        </>
    );
}

// The RMC role artwork, drawn exactly as on the RMC cards: Balance (mentor), Unity (organizer), Empowerment (attendee)
function RmcScene({ theme, scrim, face = 'front', frontScrim = '40%', backScrim = '30%', opacity = 0.6 }) {
    const Scene = THEME_ART[theme][face] || THEME_ART[theme].front;
    return (
        <>
            <style>{RMC_ART_CSS}</style>
            {/* On the back the artwork stays in the lower half so the QR code and Back button stay clear */}
            {face === 'back' ? <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: 'linear-gradient(to bottom, transparent 28%, #000 70%)', maskImage: 'linear-gradient(to bottom, transparent 28%, #000 70%)' }}><Scene /></div> : <Scene />}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: face === 'back' ? backScrim : frontScrim, pointerEvents: 'none', background: `linear-gradient(to top, ${scrim} 8%, transparent 100%)`, opacity }} />
        </>
    );
}
const BalanceArt = (props) => <RmcScene theme="balance" scrim="#E6F1E6" frontScrim="26%" backScrim="22%" opacity={0.45} {...props} />;
const UnityArt = (props) => <RmcScene theme="unity" scrim="#042A30" frontScrim="34%" backScrim="30%" opacity={0.7} {...props} />;
const EmpowermentArt = (props) => <RmcScene theme="empowerment" scrim="#032B33" frontScrim="40%" backScrim="30%" opacity={0.75} {...props} />;

function GridArt() {
    return <div className="mu-grid" />;
}

function BracketsArt() {
    return (
        <>
            <span className="mu-corner mu-c-tl" /><span className="mu-corner mu-c-tr" />
            <span className="mu-corner mu-c-bl" /><span className="mu-corner mu-c-br" />
        </>
    );
}

function BlobsArt() {
    return (
        <>
            <div className="mu-orb mu-l1" style={{ top: '38%', left: '-90px', width: 240, height: 240, background: 'var(--g2)' }} />
            <div className="mu-orb mu-l2" style={{ bottom: '-70px', right: '-60px', width: 260, height: 260, background: 'var(--g1)' }} />
        </>
    );
}

function GlowArt() {
    return <div className="mu-orb mu-l1" style={{ bottom: '-110px', left: '10%', width: '80%', height: 260, background: 'var(--g1)', opacity: 0.3 }} />;
}

function PaperArt() {
    return (
        <>
            <div className="mu-paper-frame" />
            <div className="mu-orb mu-l1" style={{ top: '30%', right: '-80px', width: 220, height: 220, background: 'var(--g2)', opacity: 0.12 }} />
        </>
    );
}

function RingsArt() {
    return (
        <svg className="mu-rings mu-l2" viewBox="0 0 220 220" aria-hidden="true">
            <circle cx="110" cy="110" r="40" fill="none" stroke="var(--g2)" strokeOpacity="0.4" strokeWidth="1.5" />
            <circle cx="110" cy="110" r="64" fill="none" stroke="var(--g1)" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="3 7" />
            <circle cx="110" cy="110" r="88" fill="none" stroke="var(--g2)" strokeOpacity="0.2" strokeWidth="1" />
        </svg>
    );
}

const ART = { pathways: PathwaysArt, balance: BalanceArt, unity: UnityArt, empowerment: EmpowermentArt, community: CommunityArt, grid: GridArt, brackets: BracketsArt, blobs: BlobsArt, glow: GlowArt, paper: PaperArt, rings: RingsArt, ...DESIGN_ART, ...WS_ART, ...WS_EXTRA_ART };

export default function CardArt({ deco, face = 'front' }) {
    const Art = ART[deco] || GridArt;
    return (
        <div className="mu-art" aria-hidden="true">
            <Art face={face} />
        </div>
    );
}
