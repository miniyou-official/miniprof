'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Lock, ScanLine } from 'lucide-react';

// One teaser for every role design. It never renders the real card and does not import the real
// themes, so nothing about the layout, text, artwork or palette can be read from the page or its scripts.
// The shapes below are generic placeholders and the tints are only mood colours.
const ROLES = [
    { role: 'Attendee', tint: '#12889B' },
    { role: 'Mentor', tint: '#3BAE74' },
    { role: 'Speaker', tint: '#8B6FD6' },
    { role: 'Volunteer', tint: '#D6568E' },
    { role: 'Organizer', tint: '#D98A3D' },
];

// What each role is for. Nothing here describes the design itself.
const ABOUT = {
    Attendee: 'For everyone joining the event.',
    Mentor: 'For the people guiding others.',
    Speaker: 'For the people on stage.',
    Volunteer: 'For the people who make it happen.',
    Organizer: 'For the people behind the event.',
};

const DOTS = Array.from({ length: 9 }, (_, i) => ({ x: (i * 41 + 8) % 92, y: (i * 29 + 12) % 88, s: 3 + (i % 3), d: 3 + (i % 4) * 0.8 }));

export default function VerifiedCardTeaser() {
    const [i, setI] = useState(0);
    const [picked, setPicked] = useState(false);
    useEffect(() => {
        if (picked) return undefined;
        const id = setInterval(() => setI((v) => (v + 1) % ROLES.length), 2600);
        return () => clearInterval(id);
    }, [picked]);
    const { role, tint } = ROLES[i];

    // Tilt towards the pointer. Springs keep it smooth and settle back when the pointer leaves.
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const rx = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 140, damping: 16 });
    const ry = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), { stiffness: 140, damping: 16 });
    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { px.set(0); py.set(0); };

    return (
        <div className="vt-wrap" onPointerMove={onMove} onPointerLeave={onLeave}>
            <style>{`
                .vt-wrap { perspective: 1100px; width: min(340px, 100%); margin: 0 auto; }
                .vt-card { position: relative; width: 100%; aspect-ratio: 402 / 600; border-radius: 30px; overflow: hidden; border: 1px solid rgba(255,255,255,.22); background: #06242d; box-shadow: 0 50px 90px -40px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.04) inset; transform-style: preserve-3d; }
                .vt-blob { position: absolute; border-radius: 50%; filter: blur(46px); transition: background-color 1.1s ease; animation: vtFloat 7s ease-in-out infinite; }
                @keyframes vtFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(14px, -18px) scale(1.12); } }
                .vt-ghost { position: absolute; inset: 0; padding: 30px 26px; filter: blur(9px); opacity: .85; }
                .vt-ghost i { display: block; background: rgba(255,255,255,.55); border-radius: 999px; }
                .vt-glass { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(4,20,27,.2), rgba(4,20,27,.62)); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
                .vt-scan { position: absolute; left: 0; right: 0; height: 90px; background: linear-gradient(180deg, transparent, rgba(223,255,56,.22), transparent); animation: vtScan 3.8s ease-in-out infinite; }
                @keyframes vtScan { 0% { top: -90px; } 100% { top: 100%; } }
                .vt-shine { position: absolute; top: 0; bottom: 0; left: -70%; width: 45%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.28), transparent); transform: skewX(-18deg); animation: vtShine 5s ease-in-out infinite; }
                @keyframes vtShine { 0%, 65% { left: -70%; } 100% { left: 140%; } }
                .vt-dot { position: absolute; border-radius: 50%; background: #DFFF38; animation: vtTwinkle var(--t) ease-in-out infinite; }
                @keyframes vtTwinkle { 0%, 100% { opacity: .15; transform: scale(.7); } 50% { opacity: .95; transform: scale(1.3); } }
                .vt-lock { position: relative; display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
                .vt-lock::after { content: ''; position: absolute; inset: -8px; border-radius: 50%; border: 1px solid rgba(223,255,56,.6); animation: vtRing 2.4s ease-out infinite; }
                @keyframes vtRing { 0% { transform: scale(.85); opacity: .9; } 100% { transform: scale(1.5); opacity: 0; } }
                .vt-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 22px; }
                .vt-about { margin: 14px auto 0; max-width: 300px; text-align: center; font-size: 13px; line-height: 1.5; color: #b4dbd0; }
                button.vt-chip { background: transparent; cursor: pointer; font-family: inherit; min-height: 36px; }
                .vt-chip { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,.22); color: #9fe0d0; transition: background .4s ease, color .4s ease, border-color .4s ease; }
                .vt-chip[data-on='true'] { background: #DFFF38; color: #10222a; border-color: #DFFF38; }
                @media (prefers-reduced-motion: reduce) { .vt-blob, .vt-scan, .vt-shine, .vt-dot, .vt-lock::after { animation: none; } }
            `}</style>

            <motion.div className="vt-card" style={{ rotateX: rx, rotateY: ry }} role="img" aria-label="A MiniYou role design, revealed after verification">
                <div className="vt-blob" aria-hidden="true" style={{ left: '-18%', top: '-6%', width: '78%', height: '52%', backgroundColor: tint, opacity: 0.8 }} />
                <div className="vt-blob" aria-hidden="true" style={{ right: '-22%', bottom: '-8%', width: '82%', height: '48%', backgroundColor: tint, opacity: 0.55, animationDelay: '-3s' }} />

                <div className="vt-ghost" aria-hidden="true">
                    <i style={{ width: 84, height: 84, borderRadius: '50%' }} />
                    <i style={{ width: '62%', height: 20, marginTop: 20 }} />
                    <i style={{ width: '40%', height: 12, marginTop: 12, opacity: .7 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}><i style={{ width: 70, height: 26 }} /><i style={{ width: 90, height: 26 }} /><i style={{ width: 60, height: 26 }} /></div>
                    <i style={{ width: '100%', height: 46, marginTop: 28, borderRadius: 16 }} />
                    <i style={{ width: '100%', height: 46, marginTop: 12, borderRadius: 16 }} />
                </div>

                <div className="vt-glass" aria-hidden="true" />
                <div className="vt-scan" aria-hidden="true" />
                <div className="vt-shine" aria-hidden="true" />
                {DOTS.map((d, k) => <span key={k} className="vt-dot" aria-hidden="true" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, '--t': `${d.d}s`, animationDelay: `${-k * 0.45}s` }} />)}

                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, transform: 'translateZ(40px)' }}>
                    <div>
                        <span className="vt-lock"><Lock size={26} aria-hidden="true" /></span>
                        <div style={{ height: 34, marginTop: 20, overflow: 'hidden' }} aria-live="off">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.p key={role} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: 0.32 }} style={{ margin: 0, fontSize: 24, lineHeight: '34px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>{role}</motion.p>
                            </AnimatePresence>
                        </div>
                        <p style={{ margin: '8px 0 0', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#d6efe8' }}><ScanLine size={15} aria-hidden="true" /> Unlocks when you are verified</p>
                    </div>
                </div>
            </motion.div>

            <div className="vt-chips" role="group" aria-label="Preview a role">
                {ROLES.map((r, k) => (
                    <button key={r.role} type="button" className="vt-chip" data-on={k === i} aria-pressed={k === i} onClick={() => { setI(k); setPicked(true); }}>{r.role}</button>
                ))}
            </div>
            <p className="vt-about" aria-live="polite">{ABOUT[role]} Unlocks only after your role is verified.</p>
        </div>
    );
}
