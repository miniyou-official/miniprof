'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, BadgeCheck, BarChart3, Check, Crown, Eye, FileText, Globe, Link2, Megaphone, MousePointerClick, Palette, QrCode, ScanLine, Search, Send, ShoppingBag, Sparkles, Timer, X as XMark } from 'lucide-react';
import { SiBehance, SiGithub, SiInstagram, SiLinkedin, SiSpotify, SiTelegram, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PLANS, formatRupees, yearlySaving } from '@/lib/billing/plans';
import { PRO_FAQ } from '@/components/pro/proFeatures';

// Black, white and one fluoro blue
const BLUE = '#1AD1FF';
const BLUE_DEEP = '#0A9FD6'; // readable on white
const INK = '#05060A';
const PAPER = '#F4F7FB';

const reveal = {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

const LOOKS = {
    blue: { bg: '#0B0D14', head: 'linear-gradient(135deg, #1AD1FF 0%, #2A6BFF 100%)', ring: '#1AD1FF', text: '#1AD1FF' },
    white: { bg: '#F4F6FA', head: 'linear-gradient(135deg, #FFFFFF 0%, #C9D2E3 100%)', ring: '#05060A', text: '#05060A' },
    night: { bg: '#05060A', head: 'linear-gradient(135deg, #12151F 0%, #2B3350 100%)', ring: '#FFFFFF', text: '#FFFFFF' },
    glow: { bg: '#07101A', head: 'linear-gradient(135deg, #0A2540 0%, #1AD1FF 100%)', ring: '#7BE6FF', text: '#7BE6FF' },
};

// ---------- Deterministic QR pattern (same on server and client) ----------
const QR_N = 25;
const QR_CELLS = (() => {
    let s = 11;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const out = [];
    const finder = (r, c) => {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        return edge || core;
    };
    for (let r = 0; r < QR_N; r++) {
        for (let c = 0; c < QR_N; c++) {
            const tl = r < 7 && c < 7;
            const tr = r < 7 && c >= QR_N - 7;
            const bl = r >= QR_N - 7 && c < 7;
            if (tl || tr || bl) {
                const lr = tl || tr ? r : r - (QR_N - 7);
                const lc = tl || bl ? c : c - (QR_N - 7);
                if (finder(lr, lc)) out.push({ r, c, f: true });
                continue;
            }
            if (r >= 9 && r <= 15 && c >= 9 && c <= 15) continue; // room for the logo
            if (rnd() > 0.5) out.push({ r, c, f: false });
        }
    }
    return out;
})();

// ---------- Hooks ----------
// Counts only ever go up
function useClimb(start, maxStep, ms = 1700) {
    const [v, setV] = useState(start);
    useEffect(() => {
        const id = setInterval(() => setV((p) => p + 1 + Math.floor(Math.random() * maxStep)), ms);
        return () => clearInterval(id);
    }, [maxStep, ms]);
    return v;
}

function useInView(threshold = 0.3) {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setSeen(true); io.disconnect(); }
        }, { threshold });
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);
    return [ref, seen];
}

// ---------- The MiniYou mark, animated ----------
function Logo({ size = 36, className = '' }) {
    // The glow pulses by fading a soft layer (cheap). Animating a drop-shadow filter repaints the logo every frame.
    return (
        <span className="relative inline-grid place-items-center" style={{ lineHeight: 0 }}>
            <span className="logo-glow pointer-events-none absolute -inset-[30%] rounded-full" aria-hidden="true" />
            <img src="/miniyou-logo.png" alt="MiniYou" width={Math.round(size * 1.12)} height={size} className={`logo-img w-auto select-none ${className}`} style={{ height: size }} draggable={false} />
        </span>
    );
}

function Emblem({ size = 92 }) {
    return (
        <div className="relative grid place-items-center" style={{ width: size * 1.7, height: size * 1.7 }}>
            <span className="emblem-ring absolute inset-0 rounded-full" />
            <span className="emblem-ring emblem-ring-2 absolute inset-[14%] rounded-full" />
            <span className="emblem-orbit absolute inset-0"><i /></span>
            <span className="emblem-orbit emblem-orbit-2 absolute inset-[8%]"><i /></span>
            <span className="absolute inset-[22%] rounded-full bg-[#1AD1FF]/20 blur-2xl" />
            <Logo size={size} className="relative" />
        </div>
    );
}

// ---------- A profile card ----------
function MiniCard({ name, role, avatar, look = 'blue', url, className = '' }) {
    const l = LOOKS[look];
    const dark = look !== 'white';
    return (
        <div className={`relative w-[280px] overflow-hidden rounded-[28px] border ${className}`} style={{ background: l.bg, borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }}>
            <div className="h-24" style={{ background: l.head }} />
            <div className="absolute left-1/2 top-12 -translate-x-1/2">
                <img src={avatar} alt="" className="h-24 w-24 rounded-full border-4 object-cover" style={{ borderColor: l.ring, background: '#111' }} />
            </div>
            <div className="px-6 pb-7 pt-16 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: l.text }}>{role}</p>
                <h3 className="mt-1 truncate text-2xl font-bold tracking-tight" style={{ color: dark ? '#fff' : '#05060A' }}>{name}</h3>
                <p className="mt-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>{url}</p>
                <div className="mt-5 flex items-center justify-center gap-4" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
                    <SiGithub size={20} /><SiLinkedin size={20} /><SiInstagram size={20} /><SiYoutube size={20} />
                </div>
            </div>
        </div>
    );
}

// ---------- 3D tilt with a glare that follows the pointer ----------
function Tilt({ children, max = 12, className = '' }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 160, damping: 16 });
    const sy = useSpring(y, { stiffness: 160, damping: 16 });
    const rotY = useTransform(sx, [-0.5, 0.5], [-max, max]);
    const rotX = useTransform(sy, [-0.5, 0.5], [max, -max]);
    const gx = useTransform(sx, [-0.5, 0.5], [0, 100]);
    const gy = useTransform(sy, [-0.5, 0.5], [0, 100]);
    const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.16), transparent 55%)`;
    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { x.set(0); y.set(0); };
    return (
        <div style={{ perspective: 1100 }} className={className}>
            <motion.div onPointerMove={onMove} onPointerLeave={onLeave} style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }} className="relative">
                {children}
                <motion.div className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ background: glare }} />
            </motion.div>
        </div>
    );
}

// ---------- Numbers that glide instead of jumping ----------
function SmoothNumber({ value, ms = 1600, prefix = '', suffix = '', className = '' }) {
    const [shown, setShown] = useState(value);
    const from = useRef(value);
    useEffect(() => {
        const start = performance.now();
        const a = from.current;
        let raf = 0;
        const tick = (t) => {
            const pr = Math.min((t - start) / ms, 1);
            const e = 1 - Math.pow(1 - pr, 3);
            const v = a + (value - a) * e;
            from.current = v;
            setShown(Math.round(v));
            if (pr < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, ms]);
    return <span className={`tabular-nums ${className}`}>{prefix}{shown.toLocaleString('en-IN')}{suffix}</span>;
}

// Counts up once when it scrolls into view
function CountUp({ to, from = 0, ms = 1800, prefix = '', suffix = '', className = '' }) {
    const [ref, seen] = useInView(0.4);
    return <span ref={ref}><SmoothNumber value={seen ? to : from} ms={ms} prefix={prefix} suffix={suffix} className={className} /></span>;
}

// ---------- Where views come from: a donut that settles, and a calm live feed ----------
const SOURCES = [['QR scans', BLUE, QrCode], ['Direct link', '#2A6BFF', Link2], ['Shared in chats', '#E8EEF8', Send]];
const CITIES = ['Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata', 'Kochi'];
const DONUT_C = 2 * Math.PI * 40;

function LiveSources() {
    const [total, setTotal] = useState(4820);
    const [shares, setShares] = useState([46, 38, 16]);
    const [ready, setReady] = useState(false);
    const [feed, setFeed] = useState(() => [{ id: 2, city: 'Mumbai', src: 2 }, { id: 1, city: 'Bengaluru', src: 1 }, { id: 0, city: 'Chennai', src: 0 }]);
    const nid = useRef(3);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 350);
        return () => clearTimeout(t);
    }, []);
    useEffect(() => {
        const id = setInterval(() => {
            setTotal((t) => t + 1 + Math.floor(Math.random() * 3));
            setFeed((f) => [{ id: nid.current++, city: CITIES[Math.floor(Math.random() * CITIES.length)], src: Math.floor(Math.random() * 3) }, ...f].slice(0, 3));
            setShares((sh) => {
                const i = Math.floor(Math.random() * 3);
                const j = (i + 1 + Math.floor(Math.random() * 2)) % 3;
                const d = 1 + Math.floor(Math.random() * 2);
                const n = [...sh];
                if (n[j] - d >= 8) { n[i] += d; n[j] -= d; }
                return n;
            });
        }, 3000);
        return () => clearInterval(id);
    }, []);

    let acc = 0;
    return (
        <div>
            <div className="mt-5 flex items-center gap-5">
                <div className="relative h-[128px] w-[128px] shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                        {SOURCES.map(([n, c], k) => {
                            const len = Math.max(0, (shares[k] / 100) * DONUT_C - 3);
                            const off = -(acc / 100) * DONUT_C;
                            acc += shares[k];
                            return <circle key={n} cx="50" cy="50" r="40" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${ready ? len : 0} ${DONUT_C}`} strokeDashoffset={off} style={{ transition: 'stroke-dasharray 1.8s cubic-bezier(0.22,1,0.36,1), stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)', filter: k === 0 ? `drop-shadow(0 0 5px ${BLUE})` : 'none' }} />;
                        })}
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                        <div>
                            <SmoothNumber value={total} ms={2200} className="text-xl font-black tracking-tight" />
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">views</p>
                        </div>
                    </div>
                </div>
                <ul className="flex-1 space-y-2.5">
                    {SOURCES.map(([n, c], k) => (
                        <li key={n} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-white/70"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{n}</span>
                            <SmoothNumber value={shares[k]} ms={1800} suffix="%" className="font-bold text-white" />
                        </li>
                    ))}
                </ul>
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Opening right now</p>
            <ul className="mt-2 h-[150px] overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                    {feed.map((f) => (
                        <motion.li key={f.id} layout initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="mb-2 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${BLUE}1f`, color: BLUE }}>
                                {f.src === 0 ? <QrCode size={15} /> : f.src === 1 ? <Link2 size={15} /> : <Send size={15} />}
                            </span>
                            <span className="min-w-0 flex-1 leading-tight">
                                <span className="block truncate text-[13px] font-semibold">Someone in {f.city}</span>
                                <span className="text-[11px] text-white/40">opened your card</span>
                            </span>
                            <span className="text-[11px] text-white/40">just now</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    );
}

const CHIP = 'flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#0B0D14]/95 px-3.5 py-2.5 shadow-[0_10px_40px_-10px_rgba(26,209,255,0.5)]';

function ChipViews() {
    const v = useClimb(12480, 5, 2600);
    return (
        <div className={CHIP}>
            <Eye size={16} style={{ color: BLUE }} />
            <SmoothNumber value={v} ms={2200} className="text-sm font-bold text-white" />
            <ArrowUp size={14} style={{ color: BLUE }} />
            <span className="text-[11px] text-white/45">views</span>
        </div>
    );
}

// ---------- Small pieces ----------
function Eyebrow({ children, light = false }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${light ? 'border-black/10 bg-white text-black/60' : 'border-white/10 bg-white/[0.04] text-white/70'}`}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: light ? BLUE_DEEP : BLUE, boxShadow: `0 0 10px ${light ? BLUE_DEEP : BLUE}` }} />
            {children}
        </span>
    );
}

// Deterministic particles
const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
    x: (i * 37 + 11) % 100,
    y: (i * 53 + 7) % 100,
    s: 2 + (i % 3),
    d: 6 + (i % 7) * 1.7,
    o: 0.25 + (i % 4) * 0.12,
}));

const MARQUEE = ['Digital Profile Card', 'One link', 'Your QR code', 'All your socials', 'Made to share', 'Looks like you', 'Free to start', 'Share in a second'];

const STEPS_OLD = [
    ['01', 'Claim your link', 'Sign up in seconds with email or Google and pick the name that becomes your address.'],
    ['02', 'Build your card', 'Add your photo, bio and every link that matters, then choose a look that fits you.'],
    ['03', 'Share it anywhere', 'Send the link or let people scan your QR code. Your card works on any phone.'],
];

const STEPS = [
    ['01', 'Claim your link', 'Sign up with email or Google and pick your name. That name is your address.', '8s'],
    ['02', 'Customise your card', 'It is already built for you. Add your photo and links, then pick a look that suits you.', '14s'],
    ['03', 'Share it anywhere', 'Send the link or show your QR code. It opens on any phone, no app needed.', '5s'],
];
const STEP_TOTAL = 27;

// The clock for the 30 second section starts the moment someone starts scrolling.
// It keeps its own state so its ticks do not re-render the whole page.
function StopwatchClock() {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        let start = 0;
        let id;
        const begin = () => {
            if (start) return;
            start = Date.now();
            id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
            window.removeEventListener('scroll', begin);
        };
        window.addEventListener('scroll', begin, { passive: true });
        return () => { window.removeEventListener('scroll', begin); clearInterval(id); };
    }, []);
    return <Stopwatch elapsed={elapsed} />;
}

function Stopwatch({ elapsed }) {
    const C = 2 * Math.PI * 54;
    const frac = Math.min(elapsed, 30) / 30;
    const over = elapsed >= 30;
    return (
        <div className="mx-auto w-full max-w-[270px] rounded-3xl p-6 text-center text-white" style={{ background: `radial-gradient(120% 90% at 100% 0%, ${BLUE}33, transparent 60%), ${INK}`, boxShadow: `0 40px 80px -40px ${BLUE}` }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">You have been scrolling for</p>
            <div className="relative mx-auto mt-3 h-[150px] w-[150px]">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={over ? '#FFFFFF' : BLUE} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${frac * C} ${C}`} style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.6s ease', filter: `drop-shadow(0 0 8px ${BLUE})` }} />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                    <div>
                        <p className="text-5xl font-black tabular-nums tracking-tight">{elapsed}<span className="text-xl text-white/50">s</span></p>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">target: 30s</p>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-sm font-bold leading-snug" style={{ color: over ? '#FFFFFF' : 'rgba(255,255,255,0.75)' }}>
                {elapsed === 0 && 'Your clock starts when you scroll.'}
                {elapsed > 0 && !over && `${30 - elapsed}s left. Your card could be live by then.`}
                {over && `${elapsed} seconds in. You could have made and shared your card by now.`}
            </p>
            <a href="/signup" className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold transition-transform hover:scale-[1.03] ${over ? 'text-black' : 'border border-white/20 text-white/80 hover:bg-white/10'}`} style={over ? { background: BLUE, boxShadow: `0 12px 36px -10px ${BLUE}` } : undefined}>
                {over ? 'Make it now' : 'Start the clock yourself'} <ArrowRight size={16} />
            </a>
        </div>
    );
}

const CARD_LIGHT = 'rounded-3xl border border-black/[0.07] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_30px_60px_-35px_rgba(5,6,10,0.3)]';

// ---------- Theme showcase: four card styles, in the spirit of our community cards ----------
const SHOWCASE = [
    {
        name: 'Rise', dark: true, avatar: '/card3.png', person: 'Ananya Iyer', role: 'Community Lead', kind: 'firefly', shape: 'rounded-full',
        bg: 'radial-gradient(300px 220px at 85% 8%, rgba(26,209,255,0.30), transparent 70%), linear-gradient(165deg, #04121C 0%, #06263A 55%, #0A3D5C 100%)',
        ink: '#FFFFFF', soft: '#A9DDF0', accent: '#1AD1FF', border: 'rgba(26,209,255,0.35)', glow: 'rgba(26,209,255,0.55)',
        linkBg: 'rgba(26,209,255,0.10)', linkBd: 'rgba(26,209,255,0.45)', linkInk: '#FFFFFF', pillBg: 'rgba(4,18,28,0.75)', pillInk: '#1AD1FF', ring: ['#1AD1FF', '#2A6BFF', '#7BE6FF'],
    },
    {
        name: 'Clarity', dark: false, avatar: '/avatar-guy.png', person: 'Rohan Das', role: 'Product Manager', kind: 'mote', shape: 'rounded-lg',
        bg: 'radial-gradient(300px 200px at 85% 5%, #FFFFFF, transparent 70%), linear-gradient(170deg, #F8FBFF 0%, #EAF3FB 55%, #D6E9F7 100%)',
        ink: '#0B2540', soft: '#4F6D88', accent: '#0A9FD6', border: 'rgba(10,159,214,0.28)', glow: 'rgba(10,159,214,0.4)',
        linkBg: '#0B2540', linkBd: '#0B2540', linkInk: '#FFFFFF', pillBg: 'rgba(255,255,255,0.9)', pillInk: '#0A9FD6', ring: ['#0A9FD6', '#2A6BFF', '#BFE6F7'],
    },
    {
        name: 'Horizon', dark: true, avatar: '/card1.png', person: 'Meera Pillai', role: 'Keynote Speaker', kind: 'dust', shape: 'rounded-xl',
        bg: 'radial-gradient(300px 220px at 85% 10%, rgba(255,196,107,0.26), transparent 70%), linear-gradient(165deg, #0B1030 0%, #141C4E 55%, #1F2A6B 100%)',
        ink: '#FFFFFF', soft: '#C7CCF0', accent: '#FFC46B', border: 'rgba(255,196,107,0.4)', glow: 'rgba(255,196,107,0.4)',
        linkBg: 'rgba(255,196,107,0.10)', linkBd: 'rgba(255,196,107,0.55)', linkInk: '#FFFFFF', pillBg: 'rgba(11,16,48,0.8)', pillInk: '#FFC46B', ring: ['#FFC46B', '#7C8CFF', '#FFE2A8'],
    },
    {
        name: 'Bloom', dark: false, avatar: '/avatar-girl.png', person: 'Isha Kapoor', role: 'Event Organizer', kind: 'petal', shape: 'rounded-full',
        bg: 'radial-gradient(300px 220px at 85% 8%, rgba(255,226,196,0.75), transparent 70%), linear-gradient(175deg, #FFEFF2 0%, #FFCFD8 48%, #FF9BB2 100%)',
        ink: '#5A1230', soft: '#9B4660', accent: '#D61F5E', border: 'rgba(214,31,94,0.3)', glow: 'rgba(255,120,150,0.5)',
        linkBg: '#5A1230', linkBd: '#5A1230', linkInk: '#FFFFFF', pillBg: 'rgba(255,255,255,0.85)', pillInk: '#D61F5E', ring: ['#D61F5E', '#FF9BB2', '#FFE2C4'],
    },
];

const HAVE = [
    [SiInstagram, 'Instagram', '#FF5C9A'], [SiLinkedin, 'LinkedIn', '#4C9BFF'], [SiGithub, 'GitHub', '#FFFFFF'], [SiYoutube, 'YouTube', '#FF3B3B'], [SiWhatsapp, 'WhatsApp', '#34D27B'],
    [Globe, 'Portfolio', '#1AD1FF'], [FileText, 'Resume', '#FFC46B'], [SiBehance, 'Behance', '#4D7CFF'], [SiTelegram, 'Telegram', '#3AB4F2'], [ShoppingBag, 'Shop', '#FF8FB1'], [SiSpotify, 'Spotify', '#1ED760'], [SiX, 'X', '#FFFFFF'],
];

const SPARKS = Array.from({ length: 9 }, (_, i) => ({ l: (i * 29 + 8) % 92, b: (i * 17 + 4) % 60, s: 3 + (i % 3) * 1.5, d: 5 + (i % 5) * 1.4 }));

const BRAND_ICONS = [
    [SiLinkedin, '#4C9BFF', '#0A66C2'], [SiInstagram, '#FF5C9A', '#E1306C'], [SiGithub, '#FFFFFF', '#181717'], [SiYoutube, '#FF3B3B', '#E60000'], [SiX, '#FFFFFF', '#000000'],
];

function ThemeCard({ t }) {
    return (
        <div className="relative h-[352px] w-[280px] overflow-hidden rounded-[28px] border" style={{ background: t.bg, borderColor: t.border, color: t.ink, boxShadow: `0 34px 80px -34px ${t.glow}` }}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {SPARKS.map((sp, i) => (
                    <span key={i} className="particle absolute" style={{
                        left: `${sp.l}%`, bottom: `${sp.b}%`, width: sp.s, height: sp.s, '--t': `${sp.d}s`, animationDelay: `${-sp.d / 2}s`, opacity: 0.8,
                        background: t.kind === 'petal' ? '#fff' : t.accent,
                        borderRadius: t.kind === 'petal' ? '60% 0 60% 0' : '9999px',
                        filter: t.kind === 'mote' ? 'blur(1.2px)' : 'none',
                        boxShadow: t.kind === 'firefly' ? `0 0 10px 2px ${t.accent}` : t.kind === 'dust' ? `0 0 6px ${t.accent}` : 'none',
                    }} />
                ))}
            </div>
            <div className="relative flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-base font-extrabold leading-none">Mini<span style={{ color: t.accent }}>You</span></p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.22em]" style={{ color: t.soft }}>Digital Profile Card</p>
                    </div>
                    
                </div>
                <div className="mt-5 flex flex-col items-center text-center">
                    <span className="rounded-full p-[3px]" style={{ background: `conic-gradient(${t.ring[0]}, ${t.ring[1]}, ${t.ring[2]}, ${t.ring[0]})` }}>
                        <img src={t.avatar} alt="" className="h-[84px] w-[84px] rounded-full border-[3px] object-cover" style={{ borderColor: t.dark ? '#06101c' : '#fff', background: '#111' }} />
                    </span>
                    <h3 className="mt-3 text-[1.35rem] font-extrabold leading-tight tracking-tight">{t.person}</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: t.soft }}>{t.role}</p>
                </div>
                <div className="mt-6 flex items-center justify-center gap-3">
                    {BRAND_ICONS.map(([Icon, onDark, onLight], i) => (
                        <span key={i} className={`grid h-11 w-11 place-items-center border ${t.shape}`} style={{ background: t.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)', borderColor: t.linkBd, color: t.dark ? onDark : onLight }}><Icon size={19} /></span>
                    ))}
                </div>
                <div className="mt-auto flex items-center justify-center pt-3">
                    <span className="text-[10.5px] font-medium" style={{ color: t.soft }}>miniyou.co.in/you</span>
                </div>
            </div>
        </div>
    );
}

// ---------- Pricing ----------
const FREE_FEATURES = ['Your own MiniYou link', 'All your links on one card', 'QR code to share', 'Free themes'];

const MEGA_POINTS = ['A shoutout of your card across MiniYou', 'You command the card and the message', 'Reach people beyond your own link'];

const stagger = (i) => ({ initial: { opacity: 0, x: -14 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] } });

function PricingSection() {
    const [yearly, setYearly] = useState(true);
    const [auto, setAuto] = useState(true);
    // flips between the plans on its own until someone taps a plan
    useEffect(() => {
        if (!auto) return;
        const id = setInterval(() => setYearly((y) => !y), 4800);
        return () => clearInterval(id);
    }, [auto]);
    const choose = (val) => { setAuto(false); setYearly(val); };
    const save = yearlySaving();
    const fullYear = PLANS.monthly.price * 12;
    const pct = Math.round((save / fullYear) * 100);
    const perMonth = Math.round(PLANS.yearly.price / 12);
    const price = yearly ? PLANS.yearly.price : PLANS.monthly.price;

    return (
        <section id="pricing" className="relative overflow-hidden px-5 py-24 text-[#05060A] sm:py-32" style={{ background: PAPER }}>
            <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-35" style={{ background: `radial-gradient(closest-side, ${BLUE}, ${BLUE}66 45%, transparent 100%)` }} />
            <div className="relative mx-auto max-w-6xl">
                <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
                    <Eyebrow light>Pricing</Eyebrow>
                    <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">Start free. <span className="blue-grad">Go Pro</span> when you want more.</h2>
                </motion.div>

                <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
                    {/* Free */}
                    <motion.div {...reveal} className={`${CARD_LIGHT} flex flex-col p-8`}>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/45">Free</p>
                        <p className="mt-3 text-5xl font-black tracking-tight"><CountUp to={0} from={99} prefix="₹" /></p>
                        <p className="mt-1 text-sm text-black/45">Forever. No card needed.</p>
                        <ul className="mt-7 space-y-3.5 text-sm text-black/75">
                            {FREE_FEATURES.map((x, i) => (
                                <motion.li key={x} {...stagger(i)} className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `${BLUE}2a` }}><Check size={13} style={{ color: BLUE_DEEP }} /></span>{x}</motion.li>
                            ))}
                        </ul>
                        <a href="/signup" className="mt-auto inline-flex h-12 w-full items-center justify-center rounded-full border border-black/15 pt-0 text-sm font-semibold transition-colors hover:bg-black/5" style={{ marginTop: 32 }}>Start free</a>
                    </motion.div>

                    {/* Pro */}
                    <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="relative lg:-my-4">
                        <div className="relative h-full overflow-hidden rounded-[28px] p-[2px]" style={{ boxShadow: `0 50px 100px -40px ${BLUE}` }}>
                            <span className="pro-spin absolute left-1/2 top-1/2 h-[220%] w-[220%]" style={{ background: `conic-gradient(from 0deg, transparent 0 55%, ${BLUE} 78%, #ffffff 88%, transparent 96%)` }} />
                            <div className="relative flex h-full flex-col overflow-hidden rounded-[26px] p-8 text-white" style={{ background: `radial-gradient(120% 80% at 100% 0%, ${BLUE}33, transparent 60%), ${INK}` }}>
                                <span className="pro-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/2" />
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>Pro</p>
                                    <span className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black" style={{ background: BLUE }}>Most popular</span>
                                </div>

                                <div className="mt-5">
                                    <div className="relative flex rounded-full border border-white/15 bg-white/[0.06] p-1">
                                        {[[false, 'Monthly'], [true, 'Yearly']].map(([val, label]) => (
                                            <button key={label} onClick={() => choose(val)} aria-pressed={yearly === val} className={`relative min-h-[44px] flex-1 rounded-full px-3 py-2 text-sm font-bold transition-colors ${yearly === val ? 'text-black' : 'text-white/60 hover:text-white'}`}>
                                                {yearly === val && <motion.span layoutId="plan-pill" className="absolute inset-0 rounded-full" style={{ background: BLUE, boxShadow: `0 8px 24px -8px ${BLUE}` }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                                                <span className="relative flex items-center justify-center gap-1.5">
                                                    {label}
                                                    {val && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${yearly ? 'bg-black text-white' : 'bg-white/15 text-white'}`}>Save {pct}%</span>}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex h-4 items-center justify-center">
                                        {auto ? (
                                            <p className="flex items-center gap-2 text-[11px] text-white/45">
                                                <span className="relative h-[3px] w-10 overflow-hidden rounded-full bg-white/15"><span key={String(yearly)} className="auto-bar absolute inset-y-0 left-0 w-full rounded-full" style={{ background: BLUE }} /></span>
                                                Tap to choose your plan
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-white/45">{yearly ? 'Yearly plan selected' : 'Monthly plan selected'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-end gap-2">
                                    <SmoothNumber value={price} ms={900} prefix="₹" className="text-6xl font-black tracking-tight" />
                                    <AnimatedUnit yearly={yearly} />
                                </div>

                                <div className="relative mt-3 min-h-[92px]">
                                    {yearly ? (
                                        <motion.div key="y" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                                <span className="text-white/40 line-through decoration-white/40">{formatRupees(fullYear)}</span>
                                                <span className="rounded-full px-2.5 py-0.5 text-xs font-extrabold text-black" style={{ background: BLUE }}>You save <SmoothNumber value={save} ms={1200} prefix="₹" /></span>
                                            </p>
                                            <p className="mt-2 text-sm text-white/65">That is just <SmoothNumber value={perMonth} ms={1200} prefix="₹" className="font-bold text-white" /> a month, billed once a year.</p>
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${BLUE}, #fff)` }} initial={{ width: 0 }} animate={{ width: `${pct * 3}%` }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="m" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                            <p className="text-sm text-white/65">Billed monthly. Cancel any time.</p>
                                            <button onClick={() => setYearly(true)} className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10">
                                                <Sparkles size={13} style={{ color: BLUE }} /> Go yearly and save {formatRupees(save)}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* the numbers */}
                                <div className="mt-5 grid grid-cols-3 gap-2">
                                    {[[<CountUp key="a" to={6} suffix="+" />, 'Pro themes'], [<span key="b">Live</span>, 'Animated backgrounds'], [<span key="c">∞</span>, 'Link buttons']].map(([n, l], i) => (
                                        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3 text-center">
                                            <p className="text-2xl font-black" style={{ color: BLUE }}>{n}</p>
                                            <p className="mt-0.5 text-[10px] uppercase leading-tight tracking-wider text-white/45">{l}</p>
                                        </div>
                                    ))}
                                </div>

                                <ProShowcase />

                                <a href="/dashboard?tab=pro" className="relative mt-8 inline-flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 text-sm font-extrabold uppercase tracking-wide text-black transition-transform hover:scale-[1.03]" style={{ background: BLUE, boxShadow: `0 14px 44px -10px ${BLUE}` }}>
                                    Go Pro <ArrowRight size={18} />
                                </a>
                                <p className="mt-3 text-center text-[11px] text-white/40">Cancel any time. Prices include GST.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* MegaYou */}
                    <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.2 }} className="relative flex flex-col overflow-hidden rounded-3xl p-8 text-white" style={{ background: 'linear-gradient(165deg, #0A2540 0%, #0A5CD6 72%, #1AD1FF 130%)', boxShadow: '0 40px 80px -40px rgba(10,92,214,0.8)' }}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">MegaYou</p>
                            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur">Coming soon</span>
                        </div>

                        {/* megaphone with soft ripples and avatars drifting out */}
                        <div className="relative mx-auto mt-6 grid h-40 w-40 place-items-center">
                            <span className="ripple absolute inset-0 rounded-full border border-white/40" style={{ animationDelay: '0s' }} />
                            <span className="ripple absolute inset-0 rounded-full border border-white/40" style={{ animationDelay: '1.2s' }} />
                            <span className="ripple absolute inset-0 rounded-full border border-white/40" style={{ animationDelay: '2.4s' }} />
                            <span className="absolute inset-6 rounded-full bg-white/15 blur-xl" />
                            <span className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-white text-[#0A5CD6] shadow-[0_10px_40px_-8px_rgba(255,255,255,0.7)]"><Megaphone size={32} /></span>
                            {['/card1.png', '/card2.png', '/card3.png'].map((src, i) => (
                                <img key={src} src={src} alt="" className="orbit-av absolute h-9 w-9 rounded-full border-2 border-white object-cover" style={{ '--a': `${i * 120}deg`, animationDelay: `${-i * 2.4}s`, background: '#111' }} />
                            ))}
                        </div>

                        <h3 className="mt-6 text-2xl font-black leading-tight tracking-tight">You command your card.<br />We get it viralised.</h3>
                        <p className="mt-2 text-sm text-white/70">We promote your card to everyone on MiniYou, a proper shoutout, so the right people find you.</p>

                        <ul className="mt-6 space-y-3 text-sm">
                            {MEGA_POINTS.map((x, i) => (
                                <motion.li key={x} {...stagger(i)} className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/20"><Check size={13} /></span>{x}</motion.li>
                            ))}
                        </ul>

                        <a href="/contact" className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-extrabold text-[#0A3C8F] transition-transform hover:scale-[1.03]" style={{ marginTop: 32 }}>
                            Get early access <ArrowRight size={17} />
                        </a>
                        <p className="mt-3 text-center text-[11px] text-white/55">Early access. Pricing is announced at launch.</p>
                    </motion.div>
                </div>

                <div className="mx-auto mt-14 max-w-2xl">
                    <h3 className="text-center text-xl font-black tracking-tight sm:text-2xl">Questions about Pro</h3>
                    <div className="mt-5 space-y-3">
                        {PRO_FAQ.map(([q, ans]) => (
                            <details key={q} className="group rounded-2xl border border-black/10 bg-white px-5 py-4">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-bold">
                                    {q}
                                    <span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-45">+</span>
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed text-[#05060A]/70">{ans}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function AnimatedUnit({ yearly }) {
    return (
        <span className="relative mb-2 inline-block h-6 w-16 overflow-hidden text-base font-medium text-white/55">
            <motion.span key={yearly ? 'y' : 'm'} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="absolute left-0 top-0">/ {yearly ? 'year' : 'month'}</motion.span>
        </span>
    );
}

// ---------- Header logo: the rings and orbit switch on once the header turns solid ----------
function NavLogo({ on }) {
    return (
        <span className={`nav-emblem relative grid place-items-center ${on ? 'on' : ''}`} style={{ width: 46, height: 46 }}>
            <span className="nr absolute inset-0"><span className="auto-ring absolute inset-0 rounded-full" /></span>
            <span className="nr absolute inset-[5px]"><span className="auto-ring auto-ring-dash absolute inset-0 rounded-full" /></span>
            <span className="nr absolute inset-0"><span className="emblem-orbit absolute inset-0"><i /></span></span>
            <span className="nr absolute inset-[8px] rounded-full bg-[#1AD1FF]/30 blur-md" />
            <Logo size={32} className="nav-logo relative" />
        </span>
    );
}

// ---------- Every link, one address: apps orbiting the MiniYou mark ----------
const ORBIT_APPS = [
    [SiInstagram, '#E1306C'], [SiLinkedin, '#4C9BFF'], [SiGithub, '#FFFFFF'], [SiYoutube, '#FF3B3B'],
    [SiX, '#FFFFFF'], [SiWhatsapp, '#34D27B'], [SiTelegram, '#3AB4F2'], [SiSpotify, '#1ED760'],
];

function LinkOrbit() {
    const R = 112;
    return (
        <div className="relative mx-auto h-[300px] w-[300px]">
            <div className="pointer-events-none absolute inset-4 rounded-full opacity-70 blur-2xl" style={{ background: `radial-gradient(circle, ${BLUE}40, transparent 65%)` }} />
            <div className="orbit-spin absolute inset-0">
                <svg viewBox="0 0 300 300" className="absolute inset-0" aria-hidden="true">
                    <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(26,209,255,0.18)" strokeDasharray="2 7" />
                    {ORBIT_APPS.map(([, c], i) => {
                        const a = (i / ORBIT_APPS.length) * Math.PI * 2 - Math.PI / 2;
                        const x2 = 150 + Math.cos(a) * R, y2 = 150 + Math.sin(a) * R;
                        return (
                            <g key={i}>
                                <line x1="150" y1="150" x2={x2} y2={y2} stroke={BLUE} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="4 8" className="spoke-flow" style={{ animationDelay: `${-i * 0.35}s` }} />
                                <circle r="3.2" fill={c} style={{ filter: `drop-shadow(0 0 5px ${c})` }}>
                                    <animateMotion dur="2.8s" begin={`${-i * 0.35}s`} repeatCount="indefinite" path={`M${x2.toFixed(1)},${y2.toFixed(1)} L150,150`} />
                                </circle>
                            </g>
                        );
                    })}
                </svg>
                {ORBIT_APPS.map(([Icon, c], i) => {
                    const a = (i / ORBIT_APPS.length) * Math.PI * 2 - Math.PI / 2;
                    return (
                        <span key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(${Math.cos(a) * R - 21}px, ${Math.sin(a) * R - 21}px)` }}>
                            <span className="orbit-counter grid h-[42px] w-[42px] place-items-center rounded-full border border-white/15 bg-[#0B0D14] shadow-[0_8px_26px_-8px_rgba(26,209,255,0.6)]" style={{ color: c }}>
                                <Icon size={19} />
                            </span>
                        </span>
                    );
                })}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Emblem size={44} />
            </div>
        </div>
    );
}

function AddressPill({ dark = false }) {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        const id = setInterval(() => setCopied((c) => !c), 2600);
        return () => clearInterval(id);
    }, []);
    return (
        <span className={`inline-flex items-center gap-3 rounded-full border py-2 pl-4 pr-2 text-sm font-semibold ${dark ? 'border-white/15 bg-white/[0.06] text-white' : 'border-black/10 bg-[#F4F7FB]'}`}>
            miniyou.co.in/you
            <span className="relative inline-flex h-7 w-[84px] items-center justify-center overflow-hidden rounded-full text-xs font-bold text-black" style={{ background: BLUE }}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={copied ? 'c' : 'n'} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-1">
                        {copied ? <><Check size={13} />Copied</> : 'Copy link'}
                    </motion.span>
                </AnimatePresence>
            </span>
        </span>
    );
}

// ---------- Share it in one tap: a chat that sends your card ----------
function ChatScene() {
    const [stage, setStage] = useState(0);
    useEffect(() => {
        const times = [600, 1700, 3000, 4300, 5700, 6800, 10600];
        let timers = [];
        let alive = true;
        const run = () => {
            timers = times.map((t, i) => setTimeout(() => alive && setStage(i + 1), t));
            timers.push(setTimeout(() => { if (!alive) return; setStage(0); run(); }, times[times.length - 1] + 1400));
        };
        run();
        return () => { alive = false; timers.forEach(clearTimeout); };
    }, []);
    const enter = {
        layout: 'position',
        initial: { opacity: 0, y: 24, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
        transition: { type: 'spring', stiffness: 300, damping: 26 },
    };
    const read = stage >= 4;
    return (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-black/[0.06]" style={{ background: 'linear-gradient(180deg, #E6F0FA, #F6FAFE)' }}>
            <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white/90 px-4 py-3">
                <span className="relative shrink-0">
                    <img src="/avatar-guy.png" alt="" className="h-10 w-10 rounded-full border border-black/10 object-cover" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-bold">Gudugudu</p>
                    <p className="text-[11px] font-medium text-emerald-600">online</p>
                </div>
            </div>

            <div className="flex h-[462px] flex-col justify-end gap-2 overflow-hidden p-4">
                <AnimatePresence initial={false} mode="popLayout">
                    {stage >= 1 && (
                        <motion.div key="m1" {...enter} className="max-w-[82%] self-start">
                            <div className="rounded-2xl rounded-bl-[6px] bg-white px-3.5 py-2.5 text-[13.5px] shadow-sm">Hey! Can you send me your details?</div>
                            <p className="mt-1 pl-1 text-[10px] text-black/40">10:41</p>
                        </motion.div>
                    )}
                    {stage === 2 && (
                        <motion.div key="typing" {...enter} className="flex w-fit items-center gap-1 self-end rounded-2xl rounded-br-[6px] px-4 py-3" style={{ background: `${BLUE}66` }}>
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-black/60" />
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-black/60" style={{ animationDelay: '0.15s' }} />
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-black/60" style={{ animationDelay: '0.3s' }} />
                        </motion.div>
                    )}
                    {stage >= 3 && (
                        <motion.div key="m2" {...enter} className="w-[88%] max-w-[290px] self-end rounded-2xl rounded-br-[6px] p-1.5 text-black shadow-[0_10px_30px_-12px_rgba(26,209,255,0.7)]" style={{ background: BLUE }}>
                            <p className="px-2 pb-1.5 pt-1 text-[13px] font-semibold underline decoration-black/30 underline-offset-2">miniyou.co.in/you</p>
                            <div className="overflow-hidden rounded-xl bg-[#0B0D14] text-white">
                                <div className="h-10" style={{ background: 'linear-gradient(135deg, #1AD1FF, #2A6BFF)' }} />
                                <div className="relative px-3 pb-3 pt-7">
                                    <img src="/card3.png" alt="" className="absolute -top-6 left-3 h-12 w-12 rounded-full border-[3px] border-[#0B0D14] object-cover" style={{ background: '#111', boxShadow: `0 0 0 2px ${BLUE}` }} />
                                    <p className="text-sm font-bold leading-tight">Your Name</p>
                                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: BLUE }}>Digital Profile Card</p>
                                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                                        <span className="rounded-lg bg-white py-1.5 text-center text-[11px] font-bold text-black">Open card</span>
                                        <span className="rounded-lg border border-white/25 py-1.5 text-center text-[11px] font-bold">Save MiniMe</span>
                                    </div>
                                </div>
                            </div>
                            <p className="px-2 pb-0.5 pt-1.5 text-right text-[10px] font-semibold" style={{ color: read ? '#0B3B8F' : 'rgba(5,6,10,0.55)' }}>10:42 {read ? '✓✓' : '✓'}</p>
                        </motion.div>
                    )}
                    {stage >= 4 && (
                        <motion.div key="t1" {...enter} className="flex items-center gap-2 self-center rounded-full border border-black/[0.06] bg-white px-3 py-1.5 shadow-sm">
                            <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `${BLUE}2a`, color: BLUE_DEEP }}><Eye size={11} /></span>
                            <span className="text-[11px] font-semibold">Gudugudu opened your card</span>
                        </motion.div>
                    )}
                    {stage >= 5 && (
                        <motion.div key="m3" {...enter} className="max-w-[82%] self-start">
                            <div className="rounded-2xl rounded-bl-[6px] bg-white px-3.5 py-2.5 text-[13.5px] shadow-sm">Wow, this looks great. Saved!</div>
                            <p className="mt-1 pl-1 text-[10px] text-black/40">10:43</p>
                        </motion.div>
                    )}
                    {stage >= 6 && (
                        <motion.div key="t2" {...enter} className="flex items-center gap-2 self-center rounded-full border border-black/[0.06] bg-white px-3 py-1.5 shadow-sm">
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Check size={11} /></span>
                            <span className="text-[11px] font-semibold">Saved to contacts</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ---------- The old way: hunting for details, then one link ----------
const CHAOS = [
    { t: 'card', x: -118, y: -78, r: -14, label: 'Visiting card' },
    { t: 'chat', x: 74, y: -92, r: 7, label: 'Send me ur LinkedIn?' },
    { t: 'note', x: -126, y: 18, r: -7, label: 'Save my number?' },
    { t: 'chat', x: 70, y: 6, r: -5, label: "What's your insta?" },
    { t: 'card', x: -40, y: 84, r: 9, label: 'Lost it :(' },
    { t: 'chat', x: 96, y: 86, r: -8, label: 'Which link?' },
];

function HassleScene() {
    const [clean, setClean] = useState(false);
    useEffect(() => {
        let t;
        const loop = (c) => { setClean(c); t = setTimeout(() => loop(!c), c ? 3800 : 5400); };
        loop(false);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="relative mt-6 h-[352px] overflow-hidden rounded-2xl border border-black/[0.06]" style={{ background: 'linear-gradient(180deg, #F1F5FA, #E6EDF6)' }}>
            <p className="absolute left-4 top-3 z-10 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
                {clean ? <><Check size={13} style={{ color: BLUE_DEEP }} />Found in one tap</> : <><Search size={13} className="hunt" />Searching...</>}
            </p>

            <div className="absolute inset-0 origin-center scale-[0.76] sm:scale-100">
            {CHAOS.map((c, i) => (
                <motion.div key={i} className="absolute left-1/2 top-1/2" style={{ marginLeft: -56, marginTop: -22 }}
                    animate={clean ? { x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 } : { x: c.x, y: c.y, scale: 1, opacity: 1, rotate: c.r }}
                    transition={{ duration: clean ? 0.8 : 0.9, delay: clean ? i * 0.05 : 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="wobble" style={{ animationDelay: `${-i * 0.4}s` }}>
                        {c.t === 'card' && (
                            <div className="relative w-[118px] rounded-md border border-black/10 bg-white p-2 shadow-md">
                                <div className="h-1.5 w-12 rounded bg-black/70" /><div className="mt-1.5 h-1 w-16 rounded bg-black/20" /><div className="mt-1 h-1 w-10 rounded bg-black/15" />
                                <p className="mt-1.5 text-[9px] font-semibold text-black/45">{c.label}</p>
                                {c.label === 'Lost it :(' && <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white"><XMark size={12} /></span>}
                            </div>
                        )}
                        {c.t === 'chat' && <div className="w-fit max-w-[150px] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[11px] font-medium shadow-md">{c.label}</div>}
                        {c.t === 'note' && <div className="w-[104px] rotate-[-2deg] bg-[#FFF1A8] px-2.5 py-2.5 text-[11px] font-semibold text-black/70 shadow-md">{c.label}</div>}
                    </div>
                </motion.div>
            ))}
            </div>

            <AnimatePresence>
                {clean && (
                    <motion.div key="one" initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.35 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="mx-auto w-[210px] overflow-hidden rounded-2xl bg-[#0B0D14] text-white shadow-[0_30px_60px_-20px_rgba(26,209,255,0.6)]">
                            <div className="h-12" style={{ background: 'linear-gradient(135deg, #1AD1FF, #2A6BFF)' }} />
                            <div className="-mt-6 flex flex-col items-center pb-4">
                                <img src="/card3.png" alt="" className="h-12 w-12 rounded-full border-2 object-cover" style={{ borderColor: BLUE, background: '#111' }} />
                                <p className="mt-1.5 text-sm font-bold">Your Name</p>
                                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: BLUE }}>miniyou.co.in/you</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm font-extrabold">One link. Done.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---------- Scan. Open. Done.: a phone hunts for the QR, locks on, scans it, and the link opens as a card ----------
function ScanScene({ on }) {
    return (
        <div className={`scan-scene relative mx-auto h-[430px] w-[350px] max-[380px]:origin-top max-[380px]:scale-[0.88] ${on ? 'on' : ''}`}>
            {/* the QR on a poster */}
            <div className="absolute left-0 top-[64px] w-[190px] rounded-[26px] border border-white/15 bg-[#0B0D14] p-5 shadow-[0_30px_90px_-30px_rgba(26,209,255,0.6)]">
                <div className={`qr sc-pring sc-anim relative rounded-xl ${on ? 'in' : ''}`} style={{ width: 150, height: 150 }}>
                    <div className="absolute inset-0 grid overflow-hidden rounded-xl" style={{ gridTemplateColumns: `repeat(${QR_N}, 1fr)`, gridTemplateRows: `repeat(${QR_N}, 1fr)` }}>
                        {QR_CELLS.map(({ r, c, f }) => (
                            <span key={`${r}-${c}`} className="qr-cell m-[0.5px] rounded-[2px]" style={{ gridRow: r + 1, gridColumn: c + 1, background: f ? BLUE : '#fff', boxShadow: f ? `0 0 8px ${BLUE}` : 'none', '--d': `${(r + c) * 22}ms` }} />
                        ))}
                    </div>
                    <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-[#0B0D14] p-1" style={{ width: 46, height: 46 }}>
                        <Logo size={30} />
                    </div>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                        <div className="sc-pbeam sc-anim absolute inset-x-0 h-[8px]" style={{ background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)`, boxShadow: `0 0 22px 5px ${BLUE}` }} />
                    </div>
                    <span className="sc-badge sc-anim absolute -right-3 -top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-black" style={{ background: BLUE, boxShadow: `0 8px 24px -6px ${BLUE}` }}><Check size={18} strokeWidth={3.4} /></span>
                </div>
                <p className="mt-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">Scan me</p>
            </div>

            {/* the phone */}
            <div className="sc-phone sc-anim absolute right-0 top-[24px] h-[360px] w-[180px]">
                <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-80 blur-2xl" style={{ background: 'radial-gradient(circle, rgba(42,107,255,0.38), rgba(26,209,255,0.14) 50%, transparent 70%)' }} />
                <div className="relative z-10 h-full w-full overflow-hidden rounded-[34px] border-[7px] border-[#1B1E2B] bg-black shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
                    <div className="absolute left-1/2 top-2 z-30 h-1.5 w-14 -translate-x-1/2 rounded-full bg-[#1B1E2B]" />

                    {/* live camera view */}
                    <div className="sc-cam sc-anim absolute inset-0 z-[1]" style={{ background: 'radial-gradient(circle at 50% 42%, #16263F, #060A12 72%)' }}>
                        <div className="absolute inset-y-0 left-1/3 w-px bg-white/[0.06]" /><div className="absolute inset-y-0 left-2/3 w-px bg-white/[0.06]" />
                        <div className="absolute inset-x-0 top-1/3 h-px bg-white/[0.06]" /><div className="absolute inset-x-0 top-2/3 h-px bg-white/[0.06]" />
                        <div className="sc-camqr sc-anim absolute left-1/2 top-[40%] h-[118px] w-[118px] -ml-[59px] -mt-[59px] rounded-lg bg-[#0B0D14] p-[7px]">
                            <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${QR_N}, 1fr)`, gridTemplateRows: `repeat(${QR_N}, 1fr)` }}>
                                {QR_CELLS.map(({ r, c, f }) => (
                                    f
                                        ? <span key={`${r}-${c}`} style={{ gridRow: r + 1, gridColumn: c + 1, background: BLUE }} />
                                        : <span key={`${r}-${c}`} className="sc-qcell sc-anim" style={{ gridRow: r + 1, gridColumn: c + 1, background: '#fff', animationDelay: `${(0.8 + (r / QR_N) * 1.25).toFixed(2)}s` }} />
                                ))}
                            </div>
                            <div className="sc-beam sc-anim absolute -inset-x-2 top-0 h-[5px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)`, boxShadow: `0 0 20px 5px ${BLUE}` }} />
                        </div>
                        <div className="sc-brk sc-brkcol sc-anim absolute left-1/2 top-[40%] h-[150px] w-[150px]" style={{ marginLeft: -75, marginTop: -75 }}>
                            <i className="absolute left-0 top-0 h-7 w-7 rounded-tl-xl border-l-[3px] border-t-[3px]" />
                            <i className="absolute right-0 top-0 h-7 w-7 rounded-tr-xl border-r-[3px] border-t-[3px]" />
                            <i className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-xl border-b-[3px] border-l-[3px]" />
                            <i className="absolute bottom-0 right-0 h-7 w-7 rounded-br-xl border-b-[3px] border-r-[3px]" />
                        </div>
                    </div>

                    {/* the QR banner that drops from the top, like a native camera */}
                    <div className="sc-banner sc-anim absolute left-[10px] right-[10px] top-[22px] z-[5] flex h-[46px] items-center gap-2 rounded-2xl px-2.5" style={{ background: 'rgba(14,26,44,0.94)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 16px 36px -14px rgba(0,0,0,0.8)' }}>
                        <Logo size={20} />
                        <span className="min-w-0 flex-1 leading-tight"><span className="block text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: BLUE }}>Link detected</span><span className="block text-[10.5px] font-bold text-white">miniyou.co.in/you</span></span>
                    </div>

                    {/* the banner grows into the card */}
                    <div className="sc-layer sc-anim absolute inset-0 z-[6]" style={{ background: 'radial-gradient(circle at 50% 20%, #12294A, #05080F 78%)' }}>
                        <div className="absolute left-[10px] right-[10px] top-[22px] flex h-[46px] items-center gap-2 px-2.5">
                            <Logo size={20} />
                            <span className="min-w-0 flex-1 text-[10.5px] font-bold text-white">miniyou.co.in/you</span>
                        </div>
                        <div className="sc-cardin sc-anim absolute left-1/2 top-[92px] -ml-[78px]" style={{ width: 157, height: 200 }}>
                            <div className="origin-top-left scale-[0.56]" style={{ width: 280 }}>
                                <MiniCard name="Your Name" role="Digital Profile Card" avatar="/card3.png" look="blue" url="miniyou.co.in/you" className="shadow-[0_30px_80px_-10px_rgba(26,209,255,0.7)]" />
                            </div>
                        </div>
                    </div>

                    <div className="sc-flash sc-anim pointer-events-none absolute inset-0 z-[9] bg-white" />
                </div>
            </div>
        </div>
    );
}

// The animated scene. (A walkthrough video used to be probed for here; that request returned a 404 on the live site.)
function ScanVideo({ on }) {
    return <ScanScene on={on} />;
}

// ---------- Pro features, shown instead of listed ----------
const PRO_ITEMS = [
    { k: 'themes', Icon: Palette, t: 'Exclusive Pro themes', d: 'Armor, Storybook and more' },
    { k: 'bg', Icon: Sparkles, t: 'Animated backgrounds', d: 'Live animation behind your card' },
    { k: 'analytics', Icon: BarChart3, t: 'Full analytics', d: 'Views, clicks and daily insights' },
    { k: 'badge', Icon: BadgeCheck, t: 'ProYou badge', d: 'Stand out the moment it opens' },
    { k: 'links', Icon: MousePointerClick, t: 'Custom link buttons', d: 'Any URL, your label, your colour' },
    { k: 'clean', Icon: Crown, t: 'More on your card', d: 'Six interests, your city and a role' },
];

const PRO_THEME_FANS = [['#FF6B9D', '#C44DFF'], ['#FF6B00', '#FFD700'], ['#8B5CF6', '#06B6D4'], ['#92400E', '#D97706'], ['#DC2626', '#FF7800']];

function ProVisual({ k }) {
    if (k === 'themes') {
        return (
            <div className="relative h-full w-full">
                {PRO_THEME_FANS.map(([a, b], i) => (
                    <span key={i} className="pv-fan absolute left-1/2 top-1/2 h-[78px] w-[52px] rounded-xl border border-white/25" style={{ '--r': `${(i - 2) * 15}deg`, '--x': `${(i - 2) * 30}px`, background: `linear-gradient(160deg, ${a}, ${b})`, animationDelay: `${i * 0.06}s`, boxShadow: '0 10px 24px -10px rgba(0,0,0,0.6)' }}>
                        <span className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full bg-white/70" />
                        <span className="absolute inset-x-2 bottom-3 h-1.5 rounded bg-white/50" />
                    </span>
                ))}
            </div>
        );
    }
    if (k === 'bg') {
        return (
            <div className="relative mx-auto h-full w-[150px] overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14]">
                <span className="pv-blob absolute -left-6 -top-6 h-20 w-20 rounded-full opacity-80 blur-xl" style={{ background: '#FF6B9D' }} />
                <span className="pv-blob pv-blob-2 absolute -bottom-8 -right-6 h-24 w-24 rounded-full opacity-80 blur-xl" style={{ background: BLUE }} />
                <span className="pv-blob absolute left-10 top-8 h-14 w-14 rounded-full opacity-70 blur-xl" style={{ background: '#8B5CF6', animationDelay: '-2s' }} />
                <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-[70%] rounded-full border-2 border-white/80 bg-white/20" />
                <span className="absolute inset-x-6 bottom-5 h-2 rounded bg-white/50" />
            </div>
        );
    }
    if (k === 'analytics') {
        return (
            <div className="mx-auto flex h-full w-[190px] items-end gap-3">
                <div className="flex h-full flex-1 items-end gap-1.5">
                    {[38, 56, 44, 72, 60, 92].map((h, i) => <span key={i} className="pv-bar flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === 5 ? BLUE : 'rgba(26,209,255,0.45)', animationDelay: `${i * 0.08}s`, boxShadow: i === 5 ? `0 0 14px ${BLUE}` : 'none' }} />)}
                </div>
                <div className="space-y-2 pb-1 text-[10px] uppercase tracking-wider text-white/50">
                    <p><span className="block text-base font-black normal-case text-white">1,284</span>views</p>
                    <p><span className="block text-base font-black normal-case" style={{ color: BLUE }}>342</span>clicks</p>
                </div>
            </div>
        );
    }
    if (k === 'badge') {
        return (
            <div className="relative mx-auto grid h-full place-items-center">
                <div className="relative">
                    <img src="/card3.png" alt="" className="h-[74px] w-[74px] rounded-full border-[3px] object-cover" style={{ borderColor: BLUE, background: '#111' }} />
                    <span className="pv-pop absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black" style={{ background: BLUE, boxShadow: `0 6px 18px -4px ${BLUE}` }}><BadgeCheck size={12} />ProYou</span>
                    <Sparkles size={16} className="pv-twinkle absolute -right-6 -top-1" style={{ color: BLUE }} />
                    <Sparkles size={12} className="pv-twinkle absolute -left-6 top-6 text-white/70" style={{ animationDelay: '0.6s' }} />
                </div>
            </div>
        );
    }
    if (k === 'links') {
        return (
            <div className="mx-auto flex h-full w-[190px] flex-col justify-center gap-2.5">
                {[['My Portfolio', '#1AD1FF', '#000'], ['Book a call', '#FFC46B', '#000'], ['Shop my work', '#FF6B9D', '#000']].map(([l, c, ink], i) => (
                    <span key={l} className="pv-slide flex items-center justify-between rounded-full px-4 py-2 text-xs font-extrabold" style={{ background: c, color: ink, animationDelay: `${i * 0.12}s` }}>{l}<ArrowRight size={13} /></span>
                ))}
            </div>
        );
    }
    return (
        <div className="mx-auto flex h-full w-[150px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14] p-3">
            <img src="/card3.png" alt="" className="h-10 w-10 rounded-full border-2 object-cover" style={{ borderColor: BLUE, background: '#111' }} />
            <span className="mt-1.5 h-1.5 w-16 rounded bg-white/60" />
            <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 pv-brand">Made with MiniYou</span>
            <span className="pv-just -mt-3 text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: BLUE }}>Just you</span>
        </div>
    );
}

function ProShowcase() {
    const [i, setI] = useState(0);
    const [auto, setAuto] = useState(true);
    useEffect(() => {
        if (!auto) return;
        const id = setInterval(() => setI((p) => (p + 1) % PRO_ITEMS.length), 3400);
        return () => clearInterval(id);
    }, [auto]);
    const item = PRO_ITEMS[i];
    return (
        <div className="mt-6">
            <div className="relative h-[132px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div key={item.k} className="pv-enter h-full"><ProVisual k={item.k} /></div>
            </div>
            <div className="mt-3 flex justify-between gap-1.5">
                {PRO_ITEMS.map(({ k, Icon, t }, n) => (
                    <button key={k} onClick={() => { setAuto(false); setI(n); }} aria-label={t} aria-pressed={n === i}
                        className="grid h-11 flex-1 place-items-center rounded-xl border transition-all" style={n === i ? { background: BLUE, color: '#000', borderColor: BLUE, boxShadow: `0 8px 22px -8px ${BLUE}` } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Icon size={17} />
                    </button>
                ))}
            </div>
            <div className="mt-4 min-h-[44px]">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={item.k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                        <p className="text-base font-extrabold">{item.t}</p>
                        <p className="text-sm text-white/55">{item.d}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ---------- Hero stage ----------
// Four different card designs, each with its own layout (not one card with new names)
function SplitCard({ p }) {
    return (
        <div className="flex h-[340px] w-[280px] flex-col rounded-[28px] border border-black/[0.08] bg-white p-5 text-[#05060A]">
            <div className="flex items-center gap-3">
                <img src={p.avatar} alt="" className="h-14 w-14 rounded-2xl border-2 object-cover" style={{ borderColor: BLUE_DEEP, background: '#111' }} />
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE_DEEP }}>{p.role}</p>
                    <h3 className="truncate text-xl font-extrabold tracking-tight">{p.name}</h3>
                </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-black/55">{p.bio}</p>
            <div className="mt-4 space-y-2">
                {[[SiLinkedin, 'LinkedIn'], [SiGithub, 'Publications'], [SiYoutube, 'Talks']].map(([Icon, l]) => (
                    <div key={l} className="flex items-center justify-between rounded-xl bg-[#F4F7FB] px-3.5 py-2.5 text-sm font-semibold">
                        <span className="flex items-center gap-2.5"><Icon size={16} className="text-black/60" />{l}</span>
                        <ArrowRight size={14} className="text-black/30" />
                    </div>
                ))}
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-[11px] font-medium text-black/45">miniyou.co.in/{p.handle}</span>
            </div>
        </div>
    );
}

function NeonCard({ p }) {
    return (
        <div className="w-[280px] rounded-[28px] p-[1.5px]" style={{ background: `linear-gradient(135deg, ${BLUE}, #2A6BFF 55%, #7BE6FF)` }}>
            <div className="flex h-[340px] flex-col rounded-[27px] bg-[#05060A] p-5 text-white">
                <div className="flex items-start justify-between">
                    <img src={p.avatar} alt="" className="h-[72px] w-[72px] rounded-2xl object-cover" style={{ boxShadow: `0 0 0 2px ${BLUE}, 0 0 28px ${BLUE}88`, background: '#111' }} />
                    <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BLUE }}>Open to work</span>
                </div>
                <h3 className="mt-4 text-2xl font-black tracking-tight">{p.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{p.role}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                    {[['12.4k', 'Views'], ['6', 'Links'], ['340', 'Scans']].map(([v, l]) => (
                        <div key={l} className="rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-center">
                            <p className="text-lg font-black" style={{ color: BLUE }}>{v}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">{l}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-auto flex items-center justify-between pt-3 text-white/60">
                    <div className="flex gap-3.5"><SiGithub size={18} /><SiLinkedin size={18} /><SiInstagram size={18} /></div>
                    <span className="text-[11px] text-white/40">miniyou.co.in/{p.handle}</span>
                </div>
            </div>
        </div>
    );
}

function PosterCard({ p }) {
    return (
        <div className="relative flex h-[340px] w-[280px] flex-col justify-between overflow-hidden rounded-[28px] p-5 text-white" style={{ background: 'linear-gradient(160deg, #0A2540 0%, #123C75 45%, #1AD1FF 120%)' }}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60" style={{ background: `radial-gradient(closest-side, ${BLUE}, transparent 100%)` }} />
            <div className="relative flex items-start justify-between">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">{p.role}</span>
                <img src={p.avatar} alt="" className="h-16 w-16 rounded-full border-[3px] border-white object-cover" style={{ background: '#111' }} />
            </div>
            <div className="relative">
                <h3 className="text-[2.1rem] font-black leading-[0.95] tracking-[-0.03em]">{p.name.split(' ')[0]}<br />{p.name.split(' ').slice(1).join(' ')}</h3>
                <p className="mt-2 text-xs text-white/70">{p.bio}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-white/80">
                    <div className="flex gap-3.5"><SiInstagram size={18} /><SiYoutube size={18} /><SiLinkedin size={18} /></div>
                    <span className="text-[11px] text-white/60">miniyou.co.in/{p.handle}</span>
                </div>
            </div>
        </div>
    );
}

const HERO_PEOPLE = [
    { name: 'Priya Nair', role: 'Product Designer', handle: 'priya', design: 'classic', avatar: '/card3.png', bio: '' },
    { name: 'Arjun Mehta', role: 'Full-stack Developer', handle: 'arjun', design: 'neon', avatar: '/card1.png', bio: '' },
    { name: 'Dr. Kavya Rao', role: 'Researcher', handle: 'kavya', design: 'split', avatar: '/avatar-girl.png', bio: 'Studying how people trust digital identity. Open to collaborations and talks.' },
    { name: 'Sam Fernandes', role: 'Photographer', handle: 'samf', design: 'poster', avatar: '/avatar-guy.png', bio: 'Weddings, travel and street stories.' },
];

function HeroCard({ p }) {
    const glow = 'shadow-[0_40px_90px_-20px_rgba(26,209,255,0.55)]';
    if (p.design === 'split') return <div className={`rounded-[28px] ${glow}`}><SplitCard p={p} /></div>;
    if (p.design === 'neon') return <div className={`rounded-[28px] ${glow}`}><NeonCard p={p} /></div>;
    if (p.design === 'poster') return <div className={`rounded-[28px] ${glow}`}><PosterCard p={p} /></div>;
    return <MiniCard name={p.name} role={p.role} avatar={p.avatar} look="blue" url={`miniyou.co.in/${p.handle}`} className={glow} />;
}

function HeroStage() {
    const [pi, setPi] = useState(0);
    // on phones the two side cards tuck in closer so all three cards fit the screen
    const [phone, setPhone] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px)');
        const update = () => setPhone(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    // The cards only rotate while the hero is on screen and the tab is visible
    const stageRef = useRef(null);
    const [active, setActive] = useState(true);
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return undefined;
        let inView = true;
        const apply = () => setActive(inView && !document.hidden);
        const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; apply(); });
        io.observe(el);
        document.addEventListener('visibilitychange', apply);
        return () => { io.disconnect(); document.removeEventListener('visibilitychange', apply); };
    }, []);
    useEffect(() => {
        if (!active) return undefined;
        const id = setInterval(() => setPi((p) => (p + 1) % HERO_PEOPLE.length), 3200);
        return () => clearInterval(id);
    }, [active]);
    const person = HERO_PEOPLE[pi];
    const { scrollY } = useScroll();
    const lift = useTransform(scrollY, [0, 700], [0, -70]);
    return (
        <motion.div ref={stageRef} style={{ y: lift }} className="relative mx-auto flex h-[420px] w-full max-w-[480px] items-center justify-center sm:h-[470px]">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-10 rounded-full opacity-70" style={{ background: `radial-gradient(circle at 50% 55%, ${BLUE}66, transparent 62%)` }} />

            <div className="relative mb-2 flex w-full justify-center">
                <motion.div className="absolute bottom-6 left-1/2 -ml-[140px]" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: phone ? -44 : -112, rotate: phone ? -9 : -8, y: phone ? 24 : 18, scale: phone ? 0.93 : 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 80, damping: 14 }}>
                    <MiniCard name="Nila Rao" role="Designer" avatar="/card2.png" look="white" url="miniyou.co.in/nila" />
                </motion.div>
                <motion.div className="absolute bottom-6 left-1/2 -ml-[140px]" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: phone ? 44 : 112, rotate: phone ? 9 : 8, y: phone ? 24 : 18, scale: phone ? 0.93 : 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 80, damping: 14 }}>
                    <MiniCard name="Arjun K" role="Developer" avatar="/card1.png" look="night" url="miniyou.co.in/arjun" />
                </motion.div>

                <div className="fade-up relative z-20" style={{ '--d': '0.25s' }}>
                    <Tilt max={14}>
                        <div className="hero-float">
                            <div key={pi} className="person-swap"><HeroCard p={person} /></div>
                        </div>
                    </Tilt>

                    {/* floating depth chips */}
                    <div className="chip-a absolute -right-8 -top-5 z-30 sm:-right-16"><ChipViews /></div>
                    <div className="chip-b absolute -left-44 top-[56%] z-30 hidden sm:block">
                        <div className={CHIP}>
                            <ScanLine size={16} style={{ color: BLUE }} />
                            <span className="text-sm font-bold text-white">QR scanned</span>
                            <span className="text-[11px] text-white/45">just now</span>
                        </div>
                    </div>
                    <div className="chip-c absolute -bottom-3 right-2 z-30 sm:-right-10">
                        <div className={CHIP}>
                            <Link2 size={16} style={{ color: BLUE }} />
                            <span className="text-sm font-bold text-white">+1 link added</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ---------- Page ----------
export default function LandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [qrRef, qrSeen] = useInView(0.35);
    const heroRef = useRef(null);
    const stepsRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const { scrollYProgress: stepsProgress } = useScroll({ target: stepsRef, offset: ['start 70%', 'end 60%'] });

    // Detect OAuth redirect — Supabase sends tokens in URL hash to Site URL
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('code'))) {
            router.replace('/auth/callback' + hash);
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const isOAuthReturn = document.referrer.includes('supabase.co') || params.has('code');
        if (isOAuthReturn) router.replace('/auth/callback');
    }, [router]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Sections that are off-screen pause their looping animations, and so does the whole page when the tab is hidden.
    // (IntersectionObserver marks each section; the CSS rule is in the style block below.)
    const rootRef = useRef(null);
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => { e.target.dataset.paused = e.isIntersecting ? 'false' : 'true'; });
        }, { rootMargin: '160px 0px' });
        root.querySelectorAll('section, footer, [data-pause]').forEach((el) => io.observe(el));
        const onVis = () => { root.dataset.paused = document.hidden ? 'true' : 'false'; };
        document.addEventListener('visibilitychange', onVis);
        return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
    }, []);

    // Pointer-following spotlight in the hero (no re-render)
    // It moves one small layer with transform. Changing a CSS variable on the hero would restyle everything inside it.
    const spotRef = useRef(null);
    const spotRaf = useRef(0);
    const onHeroMove = (e) => {
        if (spotRaf.current || e.pointerType === 'touch') return;
        const { clientX, clientY } = e;
        spotRaf.current = requestAnimationFrame(() => {
            spotRaf.current = 0;
            const el = heroRef.current;
            const spot = spotRef.current;
            if (!el || !spot) return;
            const r = el.getBoundingClientRect();
            spot.style.transform = `translate3d(${clientX - r.left - r.width / 2}px, ${clientY - r.top - r.height * 0.3}px, 0)`;
        });
    };
    useEffect(() => () => { if (spotRaf.current) cancelAnimationFrame(spotRaf.current); }, []);

    return (
        <div ref={rootRef} className="relative min-h-screen overflow-x-clip text-white" style={{ background: INK }}>
            <style jsx global>{`
                @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes sheen { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
                @keyframes heroFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes floatSlow { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes spinRev { to { transform: rotate(-360deg); } }
                @keyframes logoPulse {
                    0%, 100% { filter: drop-shadow(0 0 6px rgba(26,209,255,0.55)) drop-shadow(0 0 18px rgba(26,209,255,0.25)); }
                    50% { filter: drop-shadow(0 0 12px rgba(26,209,255,0.95)) drop-shadow(0 0 34px rgba(26,209,255,0.55)); }
                }
                @keyframes chipFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
                @keyframes tickUp { 0% { transform: translateY(6px); opacity: 0.2; color: ${BLUE}; } 100% { transform: none; opacity: 1; } }
                @keyframes tickDown { 0% { transform: translateY(-6px); opacity: 0.2; } 100% { transform: none; opacity: 1; } }
                @keyframes drift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-22px); } }
                @keyframes cellIn { from { opacity: 0; transform: scale(0.1) rotate(25deg); } to { opacity: 1; transform: none; } }
                @keyframes beam { 0% { top: -14%; } 100% { top: 100%; } }
                @keyframes phonePulse { 0%, 55%, 100% { box-shadow: 0 0 0 rgba(26,209,255,0); } 70% { box-shadow: 0 0 70px rgba(26,209,255,0.6); } }
                @keyframes auroraA { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(60px, 40px) scale(1.15); } }
                @keyframes auroraB { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-70px, 30px) scale(1.2); } }

                @keyframes chartSlide { from { transform: translateX(var(--s)); } to { transform: translateX(0); } }
                @keyframes chartPulse { 0% { transform: scale(0.4); opacity: 0.7; } 100% { transform: scale(1.6); opacity: 0; } }
                @keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                @keyframes plusPop { 0% { transform: translateY(8px) scale(0.7); opacity: 0; } 25% { transform: none; opacity: 1; } 100% { opacity: 1; } }
                @keyframes livePing { 0%, 100% { box-shadow: 0 0 0 0 rgba(26,209,255,0.7); } 50% { box-shadow: 0 0 0 6px rgba(26,209,255,0); } }
                @keyframes bubbleLoop {
                    0% { opacity: 0; transform: translateY(14px) scale(0.94); }
                    5% { opacity: 1; transform: none; }
                    88% { opacity: 1; transform: none; }
                    95%, 100% { opacity: 0; transform: translateY(-6px); }
                }
                .chart-slide { animation: chartSlide var(--ms, 2400ms) linear; }
                .chart-pulse { transform-box: fill-box; transform-origin: center; animation: chartPulse 1.4s ease-out infinite; }
                .bar-grow { transform-origin: bottom; animation: barGrow 0.5s ease-out; }
                .plus-pop { animation: plusPop 0.8s ease-out; }
                .live-dot { animation: livePing 1.6s ease-in-out infinite; }
                .bubble { opacity: 0; animation: bubbleLoop 9s ease-in-out var(--d) infinite; }
                @keyframes personSwap { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
                .person-swap { animation: personSwap 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
                @keyframes proSpin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                @keyframes proSheen { 0% { transform: translateX(0) skewX(-18deg); opacity: 0; } 20% { opacity: 1; } 60%, 100% { transform: translateX(380%) skewX(-18deg); opacity: 0; } }
                @keyframes rippleOut { 0% { transform: scale(0.45); opacity: 0.75; } 100% { transform: scale(1.5); opacity: 0; } }
                @keyframes orbitAv { from { transform: rotate(var(--a)) translateX(78px) rotate(calc(var(--a) * -1)); } to { transform: rotate(calc(var(--a) + 360deg)) translateX(78px) rotate(calc((var(--a) + 360deg) * -1)); } }
                @keyframes marqueeRev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
                .pro-spin { animation: proSpin 7s linear infinite; }
                .pro-sheen { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent); animation: proSheen 5.5s ease-in-out infinite; }
                .ripple { animation: rippleOut 3.6s ease-out infinite; }
                .orbit-av { left: 50%; top: 50%; margin: -18px 0 0 -18px; animation: orbitAv 22s linear infinite; }
                .marquee-track-rev { animation: marqueeRev 40s linear infinite; }
                @keyframes autoBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                .auto-bar { transform-origin: left; animation: autoBar 4.8s linear forwards; }
                @keyframes dashFlow { to { stroke-dashoffset: -24; } }
                @keyframes wobble { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(3px, -4px) rotate(2deg); } 50% { transform: translate(-3px, 2px) rotate(-2deg); } 75% { transform: translate(2px, 3px) rotate(1.5deg); } }
                @keyframes huntMove { 0%, 100% { transform: translateX(0) rotate(0); } 50% { transform: translateX(6px) rotate(-12deg); } }
                @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.45; } 30% { transform: translateY(-4px); opacity: 1; } }
                @keyframes pvFan { from { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) translateX(0); } to { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r)) translateX(var(--x)); } }
                @keyframes pvBlob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(26px, 16px) scale(1.2); } }
                @keyframes pvBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                @keyframes pvPop { 0% { transform: translateX(-50%) scale(0); } 70% { transform: translateX(-50%) scale(1.15); } 100% { transform: translateX(-50%) scale(1); } }
                @keyframes pvTwinkle { 0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); } 50% { opacity: 1; transform: scale(1.15) rotate(20deg); } }
                @keyframes pvSlide { from { opacity: 0; transform: translateX(-26px); } to { opacity: 1; transform: none; } }
                @keyframes pvEnter { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
                @keyframes pvBrand { 0%, 35% { opacity: 1; text-decoration: none; } 55%, 100% { opacity: 0; } }
                @keyframes pvJust { 0%, 50% { opacity: 0; transform: translateY(6px); } 70%, 100% { opacity: 1; transform: none; } }
                .spoke-flow { animation: dashFlow 1.4s linear infinite; }
                .orbit-spin { animation: spin 46s linear infinite; }
                .orbit-counter { animation: spinRev 46s linear infinite; }
                .wobble { animation: wobble 2.4s ease-in-out infinite; }
                .hunt { animation: huntMove 1.2s ease-in-out infinite; }
                .typing-dot { animation: typingDot 1s ease-in-out infinite; }
                .pv-fan { animation: pvFan 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .pv-blob { animation: pvBlob 5s ease-in-out infinite; }
                .pv-blob-2 { animation-duration: 6.5s; animation-delay: -2.5s; }
                .pv-bar { transform-origin: bottom; animation: pvBar 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .pv-pop { animation: pvPop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
                .pv-twinkle { animation: pvTwinkle 1.8s ease-in-out infinite; }
                .pv-slide { animation: pvSlide 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .pv-enter { animation: pvEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
                .pv-brand { animation: pvBrand 2.6s ease-in-out infinite; }
                .pv-just { animation: pvJust 2.6s ease-in-out infinite; }
                .nav-emblem .nr { opacity: 0; transform: scale(0.5); transition: opacity 0.8s ease, transform 1s cubic-bezier(0.22, 1, 0.36, 1); }
                .nav-emblem.on .nr { opacity: 1; transform: scale(1); }
                .nav-emblem .nav-logo { transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
                .nav-emblem.on .nav-logo { transform: scale(1.08); }
                .auto-ring { border: 1.5px solid rgba(26, 209, 255, 0.55); box-shadow: 0 0 18px rgba(26, 209, 255, 0.3); }
                .auto-ring-dash { border-style: dashed; border-color: rgba(26, 209, 255, 0.5); animation: spinRev 12s linear infinite; box-shadow: none; }
                .nav-emblem .emblem-orbit i { width: 5px; height: 5px; margin-left: -2.5px; top: -2.5px; }
                /* Scan. Open. Done.: one 12s master timeline, every layer shares the same clock */
                @keyframes scPhone {
                    0% { opacity: 0; transform: translate(70px, 30px) rotate(10deg) scale(0.94); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
                    7% { opacity: 1; transform: translate(-3px, 0) rotate(-3deg) scale(1); animation-timing-function: ease-in-out; }
                    18% { transform: translate(-5px, -3px) rotate(-2deg) scale(1); animation-timing-function: ease-in-out; }
                    30% { transform: translate(-2px, 2px) rotate(-3.5deg) scale(1); animation-timing-function: ease-in-out; }
                    40% { transform: translate(-3px, 0) rotate(-3deg) scale(1); }
                    54% { transform: translate(-3px, 0) rotate(-3deg) scale(1); animation-timing-function: ease-out; }
                    56% { transform: translate(-3px, 0) rotate(-3deg) scale(1.03); animation-timing-function: ease-in-out; }
                    60% { transform: translate(-3px, 0) rotate(-3deg) scale(1); }
                    68% { transform: translate(-3px, 0) rotate(-3deg) scale(1); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
                    78% { opacity: 1; transform: translate(0, -6px) rotate(0deg) scale(1.04); }
                    92% { opacity: 1; transform: translate(0, -6px) rotate(0deg) scale(1.04); animation-timing-function: ease-in; }
                    100% { opacity: 0; transform: translate(34px, 26px) rotate(6deg) scale(0.96); }
                }
                @keyframes scCam { 0%, 64% { opacity: 1; } 70%, 100% { opacity: 0; } }
                @keyframes scCamQr {
                    0% { opacity: 0; transform: perspective(520px) rotateY(-26deg) rotateX(10deg) rotate(-9deg) scale(0.82) translate(16px, 12px); animation-timing-function: ease-out; }
                    7% { opacity: 1; transform: perspective(520px) rotateY(-20deg) rotateX(8deg) rotate(-6deg) scale(0.9) translate(-6px, 6px); animation-timing-function: ease-in-out; }
                    17% { transform: perspective(520px) rotateY(-16deg) rotateX(6deg) rotate(-4deg) scale(0.96) translate(8px, -6px); animation-timing-function: ease-in-out; }
                    27% { transform: perspective(520px) rotateY(-21deg) rotateX(9deg) rotate(-7deg) scale(0.9) translate(-8px, 4px); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
                    39% { transform: perspective(520px) rotateY(0deg) rotateX(0deg) rotate(0deg) scale(1.06) translate(0px, 0px); }
                    64% { opacity: 1; transform: perspective(520px) rotateY(0deg) rotateX(0deg) rotate(0deg) scale(1.06) translate(0px, 0px); }
                    70%, 100% { opacity: 0; transform: perspective(520px) rotateY(0deg) rotateX(0deg) rotate(0deg) scale(1.06) translate(0px, 0px); }
                }
                @keyframes scBrk {
                    0% { opacity: 0; transform: scale(1.6); animation-timing-function: ease-out; }
                    7% { opacity: 1; transform: scale(1.5); animation-timing-function: ease-in-out; }
                    16% { transform: translate(5px, -6px) scale(1.42); animation-timing-function: ease-in-out; }
                    25% { transform: translate(-6px, 5px) scale(1.36); animation-timing-function: ease-in-out; }
                    33% { transform: translate(0, 0) scale(1.28); animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
                    39% { transform: scale(1); }
                    64% { opacity: 1; transform: scale(1); }
                    68%, 100% { opacity: 0; transform: scale(1); }
                }
                @keyframes scBrkCol { 0%, 34% { color: #ffffff; } 39%, 100% { color: #1AD1FF; } }
                @keyframes scBeam { 0%, 40% { top: -3%; opacity: 0; } 41.5% { opacity: 1; } 52% { top: 98%; opacity: 1; } 53.5%, 100% { top: 98%; opacity: 0; } }
                @keyframes scCell { 0%, 41% { background: #ffffff; box-shadow: none; } 44%, 64% { background: #1AD1FF; box-shadow: 0 0 7px #1AD1FF; } 70%, 100% { background: #ffffff; box-shadow: none; } }
                @keyframes scFlash { 0%, 54% { opacity: 0; } 55.5% { opacity: 0.95; } 59%, 100% { opacity: 0; } }
                @keyframes scBanner {
                    0%, 55% { opacity: 0; transform: translateY(-80px) scale(0.96); animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
                    60% { opacity: 1; transform: translateY(0) scale(1); }
                    65.9% { opacity: 1; transform: translateY(0) scale(1); }
                    66%, 100% { opacity: 0; transform: translateY(0) scale(1); }
                }
                @keyframes scLayer {
                    0%, 65.9% { opacity: 0; clip-path: inset(22px 10px calc(100% - 68px) 10px round 16px); }
                    66% { opacity: 1; clip-path: inset(22px 10px calc(100% - 68px) 10px round 16px); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
                    77%, 100% { opacity: 1; clip-path: inset(0px 0px 0px 0px round 0px); }
                }
                @keyframes scCardIn {
                    0%, 69% { opacity: 0; transform: translateY(24px) scale(0.88); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
                    81%, 100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes scPRing {
                    0%, 38% { box-shadow: 0 0 0 0 rgba(26, 209, 255, 0), 0 0 0 rgba(26, 209, 255, 0); }
                    42%, 64% { box-shadow: 0 0 0 3px rgba(26, 209, 255, 0.9), 0 0 36px rgba(26, 209, 255, 0.6); }
                    72%, 100% { box-shadow: 0 0 0 0 rgba(26, 209, 255, 0), 0 0 0 rgba(26, 209, 255, 0); }
                }
                @keyframes scBadge {
                    0%, 55% { opacity: 0; transform: scale(0); }
                    59% { opacity: 1; transform: scale(1.2); }
                    62%, 92% { opacity: 1; transform: scale(1); }
                    97%, 100% { opacity: 0; transform: scale(0.8); }
                }
                .scan-scene .sc-anim { animation-duration: 12s; animation-iteration-count: infinite; animation-fill-mode: both; animation-delay: 0.8s; animation-play-state: paused; animation-timing-function: linear; }
                .scan-scene.on .sc-anim { animation-play-state: running; }
                .sc-phone { animation-name: scPhone; }
                .sc-cam { animation-name: scCam; }
                .sc-camqr { animation-name: scCamQr; }
                .sc-brk { animation-name: scBrk, scBrkCol; }
                .sc-brk i { border-color: currentColor; filter: drop-shadow(0 0 6px currentColor); }
                .sc-beam { animation-name: scBeam; }
                .sc-pbeam { animation-name: scBeam; }
                .sc-qcell { animation-name: scCell; }
                .sc-flash { animation-name: scFlash; }
                .sc-banner { animation-name: scBanner; }
                .sc-layer { animation-name: scLayer; }
                .sc-cardin { animation-name: scCardIn; }
                .sc-pring { animation-name: scPRing; }
                .sc-badge { animation-name: scBadge; }
                @media (prefers-reduced-motion: reduce) {
                    .scan-scene .sc-anim { animation: none !important; }
                    .scan-scene .sc-phone { opacity: 1; transform: none; }
                    .scan-scene .sc-cam, .scan-scene .sc-banner, .scan-scene .sc-flash, .scan-scene .sc-badge, .scan-scene .sc-pbeam { display: none; }
                    .scan-scene .sc-layer { opacity: 1; clip-path: none; }
                    .scan-scene .sc-cardin { opacity: 1; transform: none; }
                }
                .fade-up { opacity: 0; animation: fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--d, 0s); }
                .hero-float { animation: heroFloat 6s ease-in-out infinite; }
                .float-slow { animation: floatSlow 5s ease-in-out infinite; }
                .logo-img { filter: drop-shadow(0 0 8px rgba(26,209,255,0.7)) drop-shadow(0 0 20px rgba(26,209,255,0.3)); }
                .logo-glow { background: radial-gradient(circle, rgba(26,209,255,0.5), transparent 62%); animation: glowPulse 3.2s ease-in-out infinite; }
                @keyframes glowPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.95; } }
                .marquee-track { animation: marquee 34s linear infinite; }
                .chip-a { animation: chipFloat 5s ease-in-out infinite; }
                .chip-b { animation: chipFloat 6.2s ease-in-out -2s infinite; }
                .chip-c { animation: chipFloat 5.6s ease-in-out -3.5s infinite; }
                .tick-up { display: inline-block; animation: tickUp 0.5s ease-out; }
                .tick-down { display: inline-block; animation: tickDown 0.5s ease-out; }
                .aurora-a { animation: auroraA 16s ease-in-out infinite; }
                .aurora-b { animation: auroraB 19s ease-in-out infinite; }
                .particle { animation: drift var(--t) ease-in-out infinite; }

                .blue-sheen { background: linear-gradient(90deg, ${BLUE}, #ffffff, ${BLUE}); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: sheen 6s linear 2; }
                .blue-grad { background: linear-gradient(90deg, #00B4F0, #2A6BFF); -webkit-background-clip: text; background-clip: text; color: transparent; }

                .emblem-ring { border: 1.5px solid rgba(26,209,255,0.55); box-shadow: 0 0 40px rgba(26,209,255,0.25) inset, 0 0 30px rgba(26,209,255,0.18); }
                .emblem-ring-2 { border-style: dashed; border-color: rgba(26,209,255,0.45); animation: spinRev 24s linear infinite; }
                .emblem-orbit { animation: spin 9s linear infinite; }
                .emblem-orbit-2 { animation: spinRev 14s linear infinite; }
                .emblem-orbit i { position: absolute; left: 50%; top: -4px; width: 8px; height: 8px; margin-left: -4px; border-radius: 9999px; background: ${BLUE}; box-shadow: 0 0 14px 3px ${BLUE}; }

                .grid-bg {
                    background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 56px 56px;
                    mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 25%, transparent 80%);
                    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000 25%, transparent 80%);
                }
                .spotlight { background: radial-gradient(circle, rgba(26,209,255,0.16), transparent 60%); will-change: transform; }
                /* Sections that are off-screen, and the whole page when the tab is hidden, stop their looping animations */
                [data-paused='true'], [data-paused='true'] *, [data-paused='true'] *::before, [data-paused='true'] *::after { animation-play-state: paused !important; }

                .qr .qr-cell { opacity: 0; }
                .qr.in .qr-cell { animation: cellIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--d); }
                .qr-beam { opacity: 0; }
                .qr.in .qr-beam { opacity: 1; animation: beam 3.4s cubic-bezier(0.45, 0, 0.55, 1) 1.8s infinite alternate; }
                .phone-card.on { animation: phonePulse 6.8s ease-in-out 2s infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .marquee-track, .blue-sheen, .hero-float, .float-slow, .logo-glow, .chip-a, .chip-b, .chip-c, .aurora-a, .aurora-b, .particle, .emblem-orbit, .emblem-ring-2, .qr-beam, .phone-card.on, .chart-pulse, .live-dot, .pro-spin, .pro-sheen, .auto-bar, .ripple, .orbit-av, .marquee-track-rev , .spoke-flow, .orbit-spin, .orbit-counter, .wobble, .hunt, .typing-dot, .pv-blob, .pv-twinkle, .auto-ring-dash { animation: none !important; }
                    .bubble { opacity: 1; animation: none !important; }
                    .fade-up { opacity: 1; animation: none; }
                    .qr .qr-cell { opacity: 1; animation: none !important; }
                }
            `}</style>

            {/* scroll progress */}
            <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" style={{ scaleX: scrollYProgress, background: `linear-gradient(90deg, ${BLUE}, #2A6BFF)`, boxShadow: `0 0 12px ${BLUE}` }} />

            {/* nav */}
            <header style={{ paddingTop: 'env(safe-area-inset-top)' }} className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'border-b border-white/10 bg-[#05060A]/90 backdrop-blur-md' : 'border-b border-transparent'}`}>
                <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 min-[400px]:px-5">
                    <a href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
                        <NavLogo on={scrolled} /><span className="hidden min-[480px]:inline">MiniYou</span>
                    </a>
                    <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
                        <a href="#features" className="inline-block px-1 py-3 transition-colors hover:text-white">Features</a>
                        <a href="#scan" className="inline-block px-1 py-3 transition-colors hover:text-white">QR</a>
                        <a href="#how" className="inline-block px-1 py-3 transition-colors hover:text-white">How it works</a>
                        <a href="#pricing" className="inline-block px-1 py-3 transition-colors hover:text-white">Pricing</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/community" aria-label="MiniYou Community Edition" className="group inline-flex min-h-[44px] items-center">
                            <span className="whitespace-nowrap transition-colors group-hover:bg-[rgba(223,255,56,0.12)]" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(223,255,56,.5)', color: '#DFFF38', letterSpacing: '.06em' }}>
                                <span className="hidden sm:inline">COMMUNITY EDITION</span><span className="sm:hidden">COMMUNITY</span>
                            </span>
                        </a>
                        <a href="/login" className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-medium text-white/80 min-[400px]:px-4 min-[400px]:text-sm transition-colors hover:text-white">Log in</a>
                        <a href="/signup" className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold text-black transition-transform hover:scale-105 min-[400px]:px-4 min-[400px]:text-sm" style={{ background: BLUE, boxShadow: `0 6px 24px -8px ${BLUE}` }}>Get started</a>
                    </div>
                </nav>
            </header>

            {/* hero */}
            <div ref={heroRef} data-pause onPointerMove={onHeroMove} className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="grid-bg absolute inset-0" />
                    {/* soft glows drawn as gradients, not blur filters (a 120px blur on a layer this size is very costly) */}
                    <div className="aurora-a absolute -left-40 top-[-120px] h-[520px] w-[620px] rounded-full opacity-40" style={{ background: `radial-gradient(closest-side, ${BLUE}, ${BLUE}66 45%, transparent 100%)` }} />
                    <div className="aurora-b absolute -right-40 top-20 h-[460px] w-[560px] rounded-full opacity-35" style={{ background: 'radial-gradient(closest-side, #2A6BFF, #2A6BFF66 45%, transparent 100%)' }} />
                    <div ref={spotRef} className="spotlight absolute left-1/2 top-[30%] -ml-[260px] -mt-[260px] h-[520px] w-[520px]" />
                    {PARTICLES.filter((_, i) => i % 2 === 0).map((p, i) => (
                        <span key={i} className="particle absolute rounded-full" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: p.o, background: i % 3 ? '#fff' : BLUE, '--t': `${p.d}s`, animationDelay: `${-p.d / 2}s` }} />
                    ))}
                </div>

                <section className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 pb-20 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:pt-32">
                    <div className="text-center lg:text-left">
                        <div className="fade-up" style={{ '--d': '0s' }}><Eyebrow>Now live · Free to start</Eyebrow></div>
                        <h1 className="fade-up mt-6 text-[2.9rem] font-black leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5rem] xl:text-[5.4rem]" style={{ '--d': '0.08s' }}>
                            The Digital<br />Profile Card<br /><span className="blue-sheen">made for you.</span>
                        </h1>
                        <p className="fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg lg:mx-0" style={{ '--d': '0.18s' }}>
                            MiniYou is an online tool to build a stunning Digital Profile Card: your details, all your links and a QR code on one page. Share it with a tap or a scan.
                        </p>

                        <div className="fade-up mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row lg:mx-0" style={{ '--d': '0.28s' }}>
                            <a href="/signup" className="group inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:scale-[1.05]" style={{ background: BLUE, boxShadow: `0 10px 40px -8px ${BLUE}` }}>
                                Create your card <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </a>
                            <a href="#scan" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10">
                                <QrCode size={17} style={{ color: BLUE }} /> See it in action
                            </a>
                        </div>
                        <p className="fade-up mt-3 text-xs text-white/35" style={{ '--d': '0.34s' }}>Takes under a minute. No card needed.</p>
                    </div>

                    <HeroStage />
                </section>
            </div>

            {/* marquee */}
            <div data-pause className="relative border-y border-white/10 bg-white/[0.02] py-4">
                <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
                    <div className="marquee-track flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
                        {[...MARQUEE, ...MARQUEE].map((t, i) => (
                            <span key={i} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
                                {t}<Sparkles size={14} style={{ color: BLUE }} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* features — light */}
            <section id="features" className="relative px-5 py-24 text-[#05060A] sm:py-32" style={{ background: PAPER }}>
                <div className="mx-auto max-w-6xl">
                    <motion.div {...reveal} className="max-w-2xl">
                        <Eyebrow light>Your Digital Profile Card</Eyebrow>
                        <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                            One card that <span className="blue-grad">does the talking.</span>
                        </h2>
                        <p className="mt-4 max-w-xl text-lg text-black/55">Replace the long list of links, the paper card and the awkward “let me find it” with one page that is always up to date.</p>
                    </motion.div>

                    <div className="mt-14 grid gap-5 md:grid-cols-6">
                        {/* links, as an orbit */}
                        <motion.div {...reveal} className="relative overflow-hidden rounded-3xl border border-white/10 p-7 text-white md:col-span-4" style={{ background: `radial-gradient(80% 110% at 85% 50%, ${BLUE}30, transparent 62%), radial-gradient(60% 80% at 0% 0%, rgba(42,107,255,0.14), transparent 60%), ${INK}` }}>
                            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
                                <div>
                                    <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${BLUE}1f`, color: BLUE }}><Link2 size={22} /></span>
                                    <h3 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">Every link, one address</h3>
                                    <p className="mt-2 max-w-sm text-white/60">All the apps you already use, tied to one clean address that is easy to say out loud.</p>
                                    <div className="mt-6"><AddressPill dark /></div>
                                </div>
                                <div className="mx-auto"><LinkOrbit /></div>
                            </div>
                        </motion.div>

                        {/* where views come from (dark card on light) */}
                        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="relative overflow-hidden rounded-3xl border border-white/10 p-7 text-white md:col-span-2" style={{ background: `radial-gradient(120% 90% at 100% 0%, ${BLUE}33, transparent 60%), ${INK}` }}>
                            <Eye size={22} style={{ color: BLUE }} />
                            <h3 className="mt-4 text-xl font-extrabold tracking-tight">Watch it get seen</h3>
                            <p className="mt-1 text-sm text-white/55">See how often your card is opened, and where from.</p>
                            <LiveSources />
                        </motion.div>

                        {/* the old way */}
                        <motion.div {...reveal} className={`${CARD_LIGHT} relative overflow-hidden p-7 md:col-span-3`}>
                            <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${BLUE}22`, color: BLUE_DEEP }}><Search size={22} /></span>
                            <h3 className="mt-5 text-xl font-extrabold tracking-tight">Tired of hunting for details?</h3>
                            <p className="mt-2 text-sm text-black/55">Scrolling chats, digging through photos, a visiting card you left at home. Sharing yourself should not take this long.</p>
                            <HassleScene />
                        </motion.div>

                        {/* share in one tap */}
                        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className={`${CARD_LIGHT} relative overflow-hidden p-7 md:col-span-3`}>
                            <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${BLUE}22`, color: BLUE_DEEP }}><Send size={22} /></span>
                            <h3 className="mt-5 text-xl font-extrabold tracking-tight">Share it in one tap</h3>
                            <p className="mt-2 text-sm text-black/55">Drop your link in any chat. It opens as a proper card, and you see when it is opened.</p>
                            <ChatScene />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* QR — dark */}
            <section id="scan" className="relative overflow-hidden px-5 py-24 sm:py-32">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30" style={{ background: `radial-gradient(closest-side, ${BLUE}, ${BLUE}66 45%, transparent 100%)` }} />
                <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
                    <motion.div {...reveal}>
                        <Eyebrow>QR built in</Eyebrow>
                        <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">Scan. Open. <span style={{ color: BLUE }}>Done.</span></h2>
                        <p className="mt-5 max-w-md text-lg text-white/60">Every Digital Profile Card comes with its own QR code. Put it on a badge, a slide or a poster, and one scan opens your card on their phone.</p>
                        <ul className="mt-7 space-y-3 text-white/75">
                            {['Made for you, the moment you sign up', 'Works for anyone with a phone camera', 'Print it or show it on screen'].map((x) => (
                                <li key={x} className="flex items-center gap-3"><QrCode size={18} style={{ color: BLUE }} />{x}</li>
                            ))}
                        </ul>
                    </motion.div>
                    <div ref={qrRef} className="flex justify-center"><ScanVideo on={qrSeen} /></div>
                </div>
            </section>

            {/* how it works — 30 seconds, with a stopwatch driven by scrolling */}
            <section id="how" className="relative px-5 py-24 text-[#05060A] sm:py-32" style={{ background: PAPER }}>
                <div className="mx-auto max-w-5xl">
                    <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
                        <Eyebrow light>Under 30 seconds</Eyebrow>
                        <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">Your card, shared in <span className="blue-grad">30 seconds.</span></h2>
                        <p className="mt-4 text-lg text-black/55">You do not build a card. It is already built. Just make it yours.</p>
                        <p className="mt-2 text-base font-semibold text-black/70">While you read this page, the clock is running. See how far you have scrolled against it.</p>
                    </motion.div>

                    <div ref={stepsRef} className="mt-16 grid items-start gap-10 md:grid-cols-[1fr_250px]">
                        <div className="relative order-2 pl-14 sm:pl-20 md:order-1">
                            <div className="absolute bottom-2 left-[19px] top-2 w-[3px] rounded-full bg-black/10 sm:left-[31px]" />
                            <motion.div className="absolute left-[19px] top-2 w-[3px] origin-top rounded-full sm:left-[31px]" style={{ bottom: 8, scaleY: stepsProgress, background: `linear-gradient(180deg, ${BLUE_DEEP}, #2A6BFF)`, boxShadow: `0 0 14px ${BLUE}` }} />
                            <div className="space-y-12">
                                {STEPS.map(([n, t, d, sec]) => (
                                    <motion.div key={n} {...reveal} className="relative">
                                        <span className="absolute -left-14 top-0 grid h-10 w-10 place-items-center rounded-full border-2 bg-white text-sm font-black sm:-left-20 sm:h-[64px] sm:w-[64px] sm:text-lg" style={{ borderColor: BLUE_DEEP, color: BLUE_DEEP, boxShadow: `0 0 0 6px ${BLUE}22` }}>{n}</span>
                                        <div className={`${CARD_LIGHT} p-6 sm:p-7`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t}</h3>
                                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-black" style={{ background: BLUE }}><Timer size={13} />{sec}</span>
                                            </div>
                                            <p className="mt-2 max-w-md text-black/55">{d}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="order-1 md:sticky md:top-28 md:order-2">
                            <StopwatchClock />
                        </div>
                    </div>
                </div>
            </section>

            {/* themes — dark */}
            <section id="looks" className="relative overflow-hidden px-5 py-24 sm:py-32">
                <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[520px] rounded-full opacity-25" style={{ background: 'radial-gradient(closest-side, #2A6BFF, #2A6BFF66 45%, transparent 100%)' }} />
                <div className="relative mx-auto max-w-6xl">
                    <motion.div {...reveal} className="max-w-2xl">
                        <Eyebrow>Themes</Eyebrow>
                        <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">A look for <span style={{ color: BLUE }}>every moment.</span></h2>
                        <p className="mt-4 max-w-xl text-lg text-white/55">From a quiet professional card to a full poster with moving backgrounds. Same details, a different mood.</p>
                    </motion.div>
                    <div className="-mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-4 lg:justify-items-center lg:overflow-visible lg:px-0">
                        {SHOWCASE.map((t, i) => (
                            <motion.div key={t.name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }} className="shrink-0 snap-center">
                                <Tilt max={12}><ThemeCard t={t} /></Tilt>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <p className="relative mt-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-white/35">Everything you already use, on one card</p>
                <div className="relative mt-4 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
                    <div className="marquee-track-rev flex shrink-0 items-center gap-3 pr-3">
                        {[...HAVE, ...HAVE].map(([Icon, label, c], i) => (
                            <span key={i} className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/85">
                                <Icon size={16} style={{ color: c }} />{label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* pricing — light */}
            <PricingSection />

            {/* final CTA — dark */}
            <section className="relative px-5 pb-10 pt-24 sm:pb-14 sm:pt-32">
                <motion.div {...reveal} className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] border border-white/10 px-6 py-16 text-center sm:py-24" style={{ background: `radial-gradient(ellipse 80% 120% at 50% 120%, ${BLUE}40, transparent 60%), #080A12` }}>
                    <div className="grid-bg absolute inset-0 opacity-60" />
                    <div className="relative mx-auto flex justify-center"><Emblem size={70} /></div>
                    <h2 className="relative mx-auto mt-2 max-w-3xl text-4xl font-black leading-[1.0] tracking-[-0.045em] sm:text-7xl">Your name is already <span className="blue-sheen">worth sharing.</span></h2>
                    <p className="relative mx-auto mt-5 max-w-md text-white/55">Claim your MiniYou link and build your Digital Profile Card before someone else takes your name.</p>
                    <a href="/signup" className="relative mt-9 inline-flex h-14 items-center gap-2 rounded-full px-8 text-base font-bold uppercase tracking-wide text-black transition-transform hover:scale-105" style={{ background: BLUE, boxShadow: `0 14px 50px -12px ${BLUE}` }}>
                        Create your MiniYou <ArrowRight size={20} />
                    </a>
                </motion.div>
            </section>

            {/* footer */}
            <footer className="border-t border-white/10 px-5 pb-8 pt-12" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.5fr_1fr_1fr]">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 text-lg font-extrabold"><Logo size={30} />MiniYou</div>
                        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">The Digital Profile Card: your details, all your links and a QR code on one page.</p>
                    </div>
                    <nav aria-label="Product">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Product</p>
                        <ul className="mt-2">
                            {[['Pricing', '#pricing'], ['Community Edition', '/community'], ['Contact Us', '/contact']].map(([label, href]) => (
                                <li key={href}><a href={href} className="inline-flex min-h-[44px] items-center text-sm text-white/65 transition-colors hover:text-white">{label}</a></li>
                            ))}
                        </ul>
                    </nav>
                    <nav aria-label="Legal">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">Legal</p>
                        <ul className="mt-2">
                            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund Policy', '/refund'], ['Delivery Policy', '/delivery'], ['Cookie Policy', '/cookies'], ['Acceptable Use', '/acceptable-use']].map(([label, href]) => (
                                <li key={href}><a href={href} className="inline-flex min-h-[44px] items-center text-sm text-white/65 transition-colors hover:text-white">{label}</a></li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-1 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
                    <p>© 2026 MiniYou. All rights reserved.</p>
                    <p>Made in Chennai, India 🇮🇳</p>
                </div>
            </footer>
        </div>
    );
}
