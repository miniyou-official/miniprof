'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CalendarPlus, Check, ChevronDown, Clock, Coins, Cpu, Download, Home, Lightbulb, Link2, Mail, MapPin, Navigation, Package, Phone, QrCode, Share2, Sparkles, Tags, Users } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import VerifiedCardTeaser from './VerifiedCardTeaser';
import { RMC_EVENT, DISPLAY_ONLY } from '@/lib/edition';

// The RMC 2026 attendee registration page, run by the event organizers.
// If this is ever emptied, the "Register for the event" button turns into "Registration link coming soon" and is not clickable.
const RMC_REGISTER_URL = 'https://ieeereturningmothers.in/attend-2026';

const LIME = '#DFFF38';
const TEAL = '#12889B';

// Where organizers reach us. The mailbox must exist on the miniyou.co.in mail host.
const CONTACT_EMAIL = 'events@miniyou.co.in';
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('MiniYou Community Edition for my event')}`;

// WhatsApp opens a chat with the message already typed, so organizers only have to press send.
const CONTACT_PHONE = '919543336262';
const CONTACT_PHONE_LABEL = '+91 95433 36262';
const WHATSAPP_HREF = `https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent('Hi MiniYou, I would like to bring MiniYou to my event.')}`;

// Things people run on MiniYou. Shown as a moving ribbon under the hero and as chips in the spotlight.
const OCCASIONS = ['Conferences', 'Summits', 'Workshops', 'Meetups', 'Hackathons', 'Alumni meets', 'Clubs', 'Cohorts', 'Trade shows', 'Webinars', 'Bootcamps', 'Communities'];

// What is already built
const LIVE_FEATURES = [
    { icon: <QrCode size={22} aria-hidden="true" />, title: 'One scan. Your profile.', text: 'Share everything about you instantly.', wide: true },
    { icon: <Users size={22} aria-hidden="true" />, title: 'Made for every role.', text: 'One identity for every side of you.' },
    { icon: <Download size={22} aria-hidden="true" />, title: 'Save every connection.', text: 'Make reconnecting effortless.' },
    { icon: <Share2 size={22} aria-hidden="true" />, title: 'Share anywhere.', text: 'One link for every platform.' },
    { icon: <Tags size={22} aria-hidden="true" />, title: 'Show who you are.', text: 'Your work, interests and story in one place.' },
    { icon: <Link2 size={22} aria-hidden="true" />, title: 'All your links. One home.', text: 'LinkedIn, Instagram, GitHub and more.', wide: true },
];

// Mouse-only effects (tilt, magnetic buttons, cursor light) never run for touch or when motion is reduced.
const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

// A button or link that leans slightly towards the cursor
function Magnetic({ children, className, href, strength = 0.28, ...rest }) {
    const ref = useRef(null);
    const move = (e) => {
        if (!canHover() || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength - 2}px)`;
    };
    const leave = () => { if (ref.current) ref.current.style.transform = ''; };
    return <a ref={ref} href={href} className={className} onPointerMove={move} onPointerLeave={leave} {...rest}>{children}</a>;
}

// Chat on WhatsApp or write an email, straight from the page. The label sits on the WhatsApp button.
function ContactActions({ label }) {
    return (
        <>
            <Magnetic href={WHATSAPP_HREF} className="rl-btn rl-primary cm-mag" target="_blank" rel="noopener noreferrer"><SiWhatsapp size={19} aria-hidden="true" /> {label}</Magnetic>
            <a href={CONTACT_HREF} className="rl-btn rl-ghost cm-ico" aria-label={`Email ${CONTACT_EMAIL}`} title={CONTACT_EMAIL}><Mail size={20} aria-hidden="true" /></a>
        </>
    );
}

function Brand() {
    return <>Mini<span style={{ color: LIME }}>You</span></>;
}

// Add more events here later. Dates are IST. endISO is the last day of the event.
const EVENTS = [
    {
        id: 'rmc2026',
        short: RMC_EVENT.short,
        full: RMC_EVENT.full,
        tagline: RMC_EVENT.tagline,
        dates: RMC_EVENT.dates,
        venue: RMC_EVENT.venue,
        day: '13-14',
        month: 'NOV',
        year: '2026',
        startMs: Date.parse('2026-11-13T00:00:00+05:30'),
        endMs: Date.parse('2026-11-15T00:00:00+05:30'),
        icsStart: '20261113',
        icsEnd: '20261115', // all-day events end on the day after the last day
        mapsQuery: 'NMIT Bengaluru',
        registerUrl: RMC_REGISTER_URL,
        file: 'rmc-2026.ics',
    },
    {
        id: 'ieee-innovation-workshop-2026',
        kind: 'workshop',
        short: 'IEEE Returning Mothers Conference 2026 presents',
        full: 'Innovation and Entrepreneurial Workshop',
        tagline: 'Turn Ideas into Impact.',
        steps: ['Innovate', 'Build', 'Fund', 'Scale'],
        dates: '13 November 2026',
        time: '2:00 PM – 5:00 PM IST',
        venue: 'N.M.I.T. Institute, Bengaluru, Karnataka',
        day: '13',
        month: 'NOV',
        year: '2026',
        startMs: Date.parse('2026-11-13T14:00:00+05:30'),
        endMs: Date.parse('2026-11-13T17:00:00+05:30'),
        icsStart: '20261113T083000Z', // 2:00 PM IST in UTC
        icsEnd: '20261113T113000Z',
        mapsQuery: 'NMIT Bengaluru',
        registerUrl: 'https://forms.gle/vDGjihGyUYNSfLu29',
        registerDeadlineMs: Date.parse('2026-11-12T00:00:00+05:30'), // registration closes at the end of 11 Nov IST
        deadlineLabel: '11 Nov 2026',
        file: 'ieee-innovation-workshop-2026.ics',
        highlights: [
            { icon: Coins, text: 'Funding the Entrepreneurial Journey' },
            { icon: Package, text: 'From Idea to Product' },
            { icon: Cpu, text: 'Technology-Driven & Social Entrepreneurship' },
            { icon: Users, text: 'Expert Insights, Mentorship & Networking' },
        ],
        agenda: [
            ['2:00 – 2:10 PM', 'Inauguration and Welcome'],
            ['2:10 – 2:35 PM', 'Expert Talk 1: Funding the Entrepreneurial Journey'],
            ['2:35 – 3:00 PM', 'Expert Talk 2: From Idea to Product'],
            ['3:00 – 3:25 PM', 'Expert Talk 3: Technology-Driven and Social Entrepreneurship'],
            ['3:25 – 4:15 PM', 'Panel Discussion: Building Successful and Inclusive Entrepreneurial Ecosystems'],
            ['4:15 – 4:40 PM', 'IEEE SSIT Awareness and Membership Engagement'],
            ['4:40 – 5:00 PM', 'Feedback, Recognition and Closing'],
        ],
        contacts: [
            { name: 'Dr. Harivardhagini Subhadra', phone: '+919985147962', label: '99851 47962' },
            { name: 'Dr. Parameshachari', phone: '+919886211981', label: '98862 11981' },
        ],
    },
];

const SPARKS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37 + 9) % 100, y: (i * 53 + 5) % 100, s: 2 + (i % 3), d: 7 + (i % 6) * 1.7, o: 0.2 + (i % 4) * 0.1 }));

function Reveal({ children, delay = 0, y = 28, className, style }) {
    return (
        <motion.div className={className} style={style} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
}

// One countdown number that slides when it changes
function Unit({ value, label }) {
    const text = value === null ? '--' : String(value).padStart(2, '0');
    return (
        <div className="cm-unit">
            <div className="cm-digits" aria-hidden="true">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={text} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ display: 'block' }}>{text}</motion.span>
                </AnimatePresence>
            </div>
            <span className="cm-ulabel">{label}</span>
        </div>
    );
}

function Countdown({ startMs, endMs }) {
    const [now, setNow] = useState(null);
    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    if (now === null) {
        return <div className="cm-count"><Unit value={null} label="days" /><Unit value={null} label="hours" /><Unit value={null} label="min" /><Unit value={null} label="sec" /></div>;
    }
    if (now >= endMs) return <p className="cm-status">This event has ended. Thank you for being part of it.</p>;
    if (now >= startMs) return <p className="cm-status"><span className="cm-live" aria-hidden="true" />Happening now</p>;
    const diff = Math.floor((startMs - now) / 1000);
    const d = Math.floor(diff / 86400), h = Math.floor((diff % 86400) / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
    return (
        <div className="cm-count" role="timer" aria-label={`${d} days, ${h} hours and ${m} minutes to go`}>
            <Unit value={d} label="days" /><Unit value={h} label="hours" /><Unit value={m} label="min" /><Unit value={s} label="sec" />
        </div>
    );
}

const icsEscape = (t) => String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

function downloadIcs(ev) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MiniYou//Community Edition//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT', `UID:${ev.id}@miniyou.co.in`, `DTSTAMP:${stamp}`,
        ...(ev.icsStart.includes('T')
            ? [`DTSTART:${ev.icsStart}`, `DTEND:${ev.icsEnd}`]
            : [`DTSTART;VALUE=DATE:${ev.icsStart}`, `DTEND;VALUE=DATE:${ev.icsEnd}`]),
        `SUMMARY:${icsEscape(ev.full)}`, `LOCATION:${icsEscape(ev.venue)}`, `DESCRIPTION:${icsEscape(ev.tagline)}`,
        'END:VEVENT', 'END:VCALENDAR',
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url; a.download = ev.file;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EventCard({ ev }) {
    const [added, setAdded] = useState(false);
    const onCal = () => { downloadIcs(ev); setAdded(true); setTimeout(() => setAdded(false), 2600); };
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapsQuery)}`;
    const onSpot = (e) => {
        if (!canHover()) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    return (
        <article className="cm-event" aria-label={ev.full} onPointerMove={onSpot}>
            <div className="cm-event-glow" aria-hidden="true" />
            <div className="cm-event-spot" aria-hidden="true" />
            <div className="cm-event-grid">
                <div>
                    <div className="cm-date" aria-label={ev.dates}>
                        <strong>{ev.day}</strong>
                        <span>{ev.month} {ev.year}</span>
                    </div>
                    <p className="cm-eyebrow" style={{ marginTop: 20 }}>{ev.short}</p>
                    <h3 className="cm-event-title">{ev.full}</h3>
                    <p className="cm-event-tag">{ev.tagline}</p>
                    <p className="cm-meta"><CalendarDays size={15} aria-hidden="true" /> {ev.dates}</p>
                    <p className="cm-meta"><MapPin size={15} aria-hidden="true" /> {ev.venue}</p>
                    <p className="cm-event-text">Get your MiniYou before you arrive, then share it with a QR code or a link when you meet people.</p>
                </div>

                <div className="cm-panel">
                    <p className="cm-eyebrow" style={{ textAlign: 'center' }}>Starts in</p>
                    <Countdown startMs={ev.startMs} endMs={ev.endMs} />
                    <div className="cm-actions">
                        {ev.registerUrl ? (
                            <a href={ev.registerUrl} target="_blank" rel="noopener noreferrer" className="rl-btn rl-primary cm-wide">Register for the event <ArrowRight size={17} aria-hidden="true" /></a>
                        ) : (
                            <span className="rl-btn cm-soon cm-wide" role="note" aria-disabled="true">Registration link coming soon</span>
                        )}
                        {!DISPLAY_ONLY && <a href="/signup" className={`rl-btn ${ev.registerUrl ? 'rl-ghost' : 'rl-primary'} cm-wide`}>Get your MiniYou <ArrowRight size={17} aria-hidden="true" /></a>}
                        <button type="button" onClick={onCal} className="rl-btn rl-ghost">{added ? <Check size={16} aria-hidden="true" /> : <CalendarPlus size={16} aria-hidden="true" />} {added ? 'Added' : 'Add to calendar'}</button>
                        <a href={maps} target="_blank" rel="noopener noreferrer" className="rl-btn rl-ghost"><Navigation size={16} aria-hidden="true" /> Get directions</a>
                    </div>
                </div>
            </div>
        </article>
    );
}

// The workshop is its own event with its own look: green accent, key takeaways, a programme and organizer contacts.
function WorkshopCard({ ev }) {
    const [added, setAdded] = useState(false);
    const [now, setNow] = useState(null);
    const [open, setOpen] = useState(false);
    useEffect(() => { setNow(Date.now()); }, []);
    const onCal = () => { downloadIcs(ev); setAdded(true); setTimeout(() => setAdded(false), 2600); };
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapsQuery)}`;
    const closed = now !== null && now >= ev.registerDeadlineMs;
    const onSpot = (e) => {
        if (!canHover()) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    return (
        <article className="cm-event cm-ws" aria-label={ev.full} onPointerMove={onSpot}>
            <div className="cm-event-glow" aria-hidden="true" />
            <div className="cm-event-spot" aria-hidden="true" />
            <div className="cm-event-grid">
                <div>
                    <div className="cm-ws-top">
                        <div className="cm-date" aria-label={ev.dates}>
                            <strong>{ev.day}</strong>
                            <span>{ev.month} {ev.year}</span>
                        </div>
                        <span className="cm-free"><Sparkles size={14} aria-hidden="true" /> Free with registration</span>
                    </div>
                    <p className="cm-eyebrow" style={{ marginTop: 20 }}>{ev.short}</p>
                    <h3 className="cm-event-title">{ev.full}</h3>
                    <p className="cm-ws-tag"><Lightbulb size={18} aria-hidden="true" /> {ev.tagline}</p>
                    <ul className="cm-steps" aria-label="Innovate, build, fund, scale">
                        {ev.steps.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                    <p className="cm-meta"><CalendarDays size={15} aria-hidden="true" /> {ev.dates}</p>
                    <p className="cm-meta"><Clock size={15} aria-hidden="true" /> {ev.time}</p>
                    <p className="cm-meta"><MapPin size={15} aria-hidden="true" /> {ev.venue}</p>
                </div>

                <div className="cm-panel">
                    <p className="cm-eyebrow" style={{ textAlign: 'center' }}>Starts in</p>
                    <Countdown startMs={ev.startMs} endMs={ev.endMs} />
                    <div className="cm-actions">
                        {closed ? (
                            <span className="rl-btn cm-soon cm-wide" role="note" aria-disabled="true">Registration closed on {ev.deadlineLabel}</span>
                        ) : (
                            <a href={ev.registerUrl} target="_blank" rel="noopener noreferrer" className="rl-btn rl-primary cm-wide">Save your spot <ArrowRight size={17} aria-hidden="true" /></a>
                        )}
                        <button type="button" onClick={onCal} className="rl-btn rl-ghost">{added ? <Check size={16} aria-hidden="true" /> : <CalendarPlus size={16} aria-hidden="true" />} {added ? 'Added' : 'Add to calendar'}</button>
                        <a href={maps} target="_blank" rel="noopener noreferrer" className="rl-btn rl-ghost"><Navigation size={16} aria-hidden="true" /> Get directions</a>
                    </div>
                    <p className="cm-deadline">{closed ? 'Limited seats. Ask the organizers if seats are still open.' : <>Limited seats. Register by <b>{ev.deadlineLabel}</b>.</>}</p>
                </div>
            </div>

            <div className="cm-ws-body">
                <p className="cm-eyebrow">Key takeaways</p>
                <ul className="cm-takes">
                    {ev.highlights.map(({ icon: Icon, text }) => (
                        <li key={text}><span className="cm-ficon"><Icon size={22} aria-hidden="true" /></span><span>{text}</span></li>
                    ))}
                </ul>

                <button type="button" className="cm-prog-btn" aria-expanded={open} aria-controls="ws-programme" onClick={() => setOpen((v) => !v)}>
                    Programme structure <ChevronDown size={18} aria-hidden="true" style={{ transition: 'transform .25s ease', transform: open ? 'rotate(180deg)' : 'none' }} />
                </button>
                <ol id="ws-programme" className="cm-prog" data-open={open}>
                    {ev.agenda.map(([t, what]) => (
                        <li key={t}><time>{t}</time><span>{what}</span></li>
                    ))}
                </ol>

                <p className="cm-eyebrow" style={{ marginTop: 26 }}>For further details, contact</p>
                <div className="cm-contacts">
                    {ev.contacts.map((c) => (
                        <a key={c.phone} href={`tel:${c.phone}`} className="cm-contact"><Phone size={15} aria-hidden="true" /><span><b>{c.name}</b><small>{c.label}</small></span></a>
                    ))}
                </div>
            </div>
        </article>
    );
}

const liIn = (delay) => ({ initial: { opacity: 0, y: 26 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } });

// A tile with a light that follows the pointer
function Feature({ icon, title, text, wide = false, delay = 0 }) {
    const onMove = (e) => {
        if (!canHover()) return;
        const t = e.currentTarget;
        const r = t.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        t.style.setProperty('--mx', `${x}px`);
        t.style.setProperty('--my', `${y}px`);
        t.style.setProperty('--ry', `${(x / r.width - 0.5) * 7}deg`);
        t.style.setProperty('--rx', `${(0.5 - y / r.height) * 7}deg`);
    };
    const onLeave = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };
    return (
        <motion.li className="cm-feature" data-wide={wide} onPointerMove={onMove} onPointerLeave={onLeave} {...liIn(delay)}>
            <span className="cm-ficon">{icon}</span>
            <h3>{title}</h3>
            <p>{text}</p>
        </motion.li>
    );
}

export default function CommunityHome() {
    const [scrolled, setScrolled] = useState(false);
    const bgRef = useRef(null);
    useEffect(() => {
        const calm = !canHover();
        const on = () => {
            setScrolled(window.scrollY > 8);
            if (!calm && bgRef.current) bgRef.current.style.transform = `translate3d(0, ${Math.min(window.scrollY, 900) * 0.18}px, 0)`;
        };
        on();
        window.addEventListener('scroll', on, { passive: true });
        return () => window.removeEventListener('scroll', on);
    }, []);

    return (
        <MotionConfig reducedMotion="user">
            <div className="cm-root">
                <style>{`
                    .cm-root { min-height: 100vh; min-height: 100svh; color: #E8F7F2; background: radial-gradient(900px 500px at 12% -5%, rgba(18,136,155,0.35), transparent 60%), radial-gradient(800px 500px at 100% 20%, rgba(244,184,96,0.16), transparent 60%), #04141b; position: relative; overflow-x: clip; }
                    /* The global stylesheet hides horizontal overflow on both html and body, which turns body into its own scroll
                       container and stops the sticky header from sticking. Only html clips here; body just clips sideways. */
                    html:has(.cm-root) body { overflow-x: clip; overflow-y: visible; }
                    .cm-root * { box-sizing: border-box; }
                    .cm-bg { position: absolute; inset: 0 0 auto 0; height: 900px; pointer-events: none; overflow: hidden; }
                    .cm-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px); background-size: 56px 56px; -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%); mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%); }
                    .cm-blob { position: absolute; border-radius: 50%; filter: blur(110px); }
                    .cm-spark { position: absolute; border-radius: 50%; background: ${LIME}; animation: cmDrift var(--t) ease-in-out infinite; }
                    @keyframes cmDrift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-22px); } }
                    @keyframes cmShine { 0%, 70% { left: -60%; } 100% { left: 130%; } }
                    @keyframes cmPing { 0% { box-shadow: 0 0 0 0 rgba(223,255,56,.6); } 100% { box-shadow: 0 0 0 14px rgba(223,255,56,0); } }
                    @keyframes cmFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                    .rl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 14px; padding: 14px 24px; min-height: 48px; font-weight: 800; font-size: 15px; text-decoration: none; transition: transform .15s ease, box-shadow .15s ease, background .15s ease; font-family: inherit; cursor: pointer; border: 0; }
                    .rl-btn:hover { transform: translateY(-2px); }
                    .rl-btn:focus-visible, .cm-root a:focus-visible, .cm-root button:focus-visible { outline: 2px solid ${LIME}; outline-offset: 3px; }
                    .rl-primary { background: ${LIME}; color: #10222a; box-shadow: 0 8px 28px -8px rgba(223,255,56,.55); position: relative; overflow: hidden; }
                    .rl-primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.7), transparent); transform: skewX(-20deg); animation: cmShine 4.5s ease-in-out infinite; }
                    .rl-ghost { border: 1px solid rgba(255,255,255,.28); color: #E8F7F2; background: transparent; }
                    .cm-pair { display: inline-flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
                    .rl-btn.cm-ico { padding: 0; width: 54px; min-width: 54px; height: 54px; border-radius: 9999px; justify-content: center; }
                    .cm-spot-cta .rl-btn.cm-ico { padding: 0; width: 60px; height: 60px; border-radius: 9999px; }
                    .rl-ghost:hover { background: rgba(255,255,255,.07); }

                    .cm-top { position: sticky; top: 0; z-index: 40; padding-top: env(safe-area-inset-top); transition: background .3s ease, border-color .3s ease; border-bottom: 1px solid transparent; }
                    .cm-top[data-s='true'] { background: rgba(4,20,27,.82); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-color: rgba(255,255,255,.1); }
                    .cm-top-in { max-width: 1180px; margin: 0 auto; padding: 8px 16px; min-height: 60px; display: flex; align-items: center; gap: 10px; }
                    .cm-brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; min-height: 44px; }
                    .cm-brand img { height: 32px; width: auto; filter: drop-shadow(0 0 10px rgba(26,209,255,.55)); }
                    .cm-word { font-weight: 800; font-size: 20px; }
                    .cm-pill { font-size: 11px; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(223,255,56,.5); color: ${LIME}; letter-spacing: .06em; white-space: nowrap; }
                    .cm-nav { margin-left: auto; display: flex; align-items: center; gap: 8px; }
                    .cm-home { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; min-width: 44px; justify-content: center; padding: 0 10px; border-radius: 12px; color: #c5e6dd; text-decoration: none; font-size: 14px; font-weight: 600; }
                    .cm-home:hover { color: #fff; background: rgba(255,255,255,.07); }
                    .cm-top .rl-btn { padding: 9px 18px; font-size: 14px; }
                    .cm-hide-sm { display: none; }
                    @media (min-width: 520px) { .cm-hide-sm { display: inline-flex; } }
                    .cm-txt-lg { display: none; }
                    @media (min-width: 720px) { .cm-txt-lg { display: inline; } .cm-top-in { padding: 8px 24px; } }
                    @media (max-width: 479px) { .cm-word { display: none; } }

                    .cm-hero { max-width: 1000px; margin: 0 auto; padding: 40px 20px 28px; text-align: center; position: relative; }
                    .cm-chips { margin: 0; display: inline-flex; flex-wrap: wrap; gap: 6px 16px; justify-content: center; font-size: 13px; color: #9fe0d0; }
                    .cm-h1 { margin: 16px 0 0; font-size: clamp(32px, 6vw, 58px); line-height: 1.08; font-weight: 800; letter-spacing: -0.02em; }
                    .cm-lead { margin: 18px auto 0; max-width: 640px; font-size: 17px; line-height: 1.65; color: #c5e6dd; }
                    .cm-cta { margin-top: 28px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
                    .cm-stats { margin: 38px auto 0; max-width: 760px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    @media (min-width: 640px) { .cm-stats { grid-template-columns: repeat(4, 1fr); } }
                    .cm-stat { border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); border-radius: 18px; padding: 16px 10px; }
                    .cm-stat b { display: block; font-size: 34px; font-weight: 800; color: ${LIME}; font-variant-numeric: tabular-nums; line-height: 1.1; }
                    .cm-stat > span { display: block; margin-top: 4px; font-size: 12px; color: #9fe0d0; }

                    .cm-sec { max-width: 1100px; margin: 0 auto; padding: 56px 20px 8px; position: relative; }
                    .cm-eyebrow { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: ${LIME}; }
                    .cm-h2 { margin: 8px 0 0; font-size: clamp(26px, 4.4vw, 40px); line-height: 1.12; font-weight: 800; letter-spacing: -0.02em; }
                    .cm-sub { margin: 10px 0 0; max-width: 600px; font-size: 15px; line-height: 1.6; color: #b4dbd0; }

                    .cm-event { position: relative; margin-top: 28px; border-radius: 28px; padding: 1px; background: linear-gradient(135deg, rgba(223,255,56,.7), rgba(18,136,155,.35) 45%, rgba(244,184,96,.5)); box-shadow: 0 40px 100px -50px rgba(223,255,56,.45); }
                    .cm-event-glow { position: absolute; inset: -30px; z-index: -1; border-radius: 50%; background: radial-gradient(circle at 20% 20%, rgba(223,255,56,.14), transparent 60%); filter: blur(30px); }
                    .cm-event-grid { border-radius: 27px; padding: 24px 20px; background: linear-gradient(160deg, #06242d, #04141b 70%); display: grid; gap: 24px; }
                    @media (min-width: 860px) { .cm-event-grid { grid-template-columns: 1.1fr 1fr; padding: 36px; gap: 40px; align-items: center; } }
                    .cm-date { display: inline-flex; align-items: baseline; gap: 12px; padding: 12px 18px; border-radius: 18px; background: ${LIME}; color: #10222a; }
                    .cm-date strong { font-size: 40px; line-height: 1; font-weight: 900; letter-spacing: -0.03em; }
                    .cm-date span { font-size: 13px; font-weight: 800; letter-spacing: .12em; }
                    .cm-event-title { margin: 6px 0 0; font-size: clamp(24px, 4vw, 34px); line-height: 1.12; font-weight: 800; letter-spacing: -0.02em; }
                    .cm-event-tag { margin: 8px 0 0; display: inline-block; font-size: 13px; font-weight: 700; color: ${LIME}; }
                    .cm-meta { margin: 12px 0 0; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #c5e6dd; }
                    .cm-event-text { margin: 16px 0 0; font-size: 14.5px; line-height: 1.65; color: #b4dbd0; max-width: 480px; }
                    .cm-panel { border-radius: 22px; padding: 22px 16px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); }
                    .cm-count { margin: 14px 0 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
                    .cm-unit { text-align: center; border-radius: 14px; padding: 12px 4px 8px; background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.1); }
                    .cm-digits { position: relative; height: 38px; overflow: hidden; font-size: 32px; font-weight: 800; line-height: 38px; color: #fff; font-variant-numeric: tabular-nums; }
                    .cm-ulabel { display: block; margin-top: 4px; font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: #8fc9bb; }
                    .cm-status { margin: 18px 0 0; text-align: center; font-size: 20px; font-weight: 800; color: ${LIME}; display: flex; align-items: center; justify-content: center; gap: 10px; }
                    .cm-live { width: 10px; height: 10px; border-radius: 50%; background: ${LIME}; animation: cmPing 1.4s ease-out infinite; }
                    .cm-actions { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .cm-actions .rl-btn { padding: 12px 10px; font-size: 13.5px; white-space: nowrap; }
                    @media (max-width: 400px) { .cm-actions .rl-btn { font-size: 13px; gap: 6px; padding: 12px 6px; } }
                    .cm-wide { grid-column: 1 / -1; }
                    .cm-soon { border: 1px dashed rgba(255,255,255,.35); color: #c5e6dd; background: rgba(255,255,255,.03); cursor: default; }
                    .cm-soon:hover { transform: none; }
                    .cm-ws { background: linear-gradient(135deg, rgba(120,230,110,.75), rgba(18,136,155,.35) 45%, rgba(223,255,56,.5)); box-shadow: 0 40px 100px -50px rgba(120,230,110,.45); }
                    .cm-ws .cm-event-glow { background: radial-gradient(circle at 80% 20%, rgba(120,230,110,.16), transparent 60%); }
                    .cm-ws .cm-event-grid { border-radius: 27px 27px 0 0; background: radial-gradient(500px 300px at 100% 0%, rgba(120,230,110,.14), transparent 70%), linear-gradient(160deg, #06242d, #04141b 70%); }
                    .cm-ws-top { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
                    .cm-free { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 800; letter-spacing: .04em; color: #10222a; background: #8DF07A; animation: cmFloat 4s ease-in-out infinite; }
                    .cm-ws-tag { margin: 10px 0 0; display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 800; font-style: italic; color: #8DF07A; }
                    .cm-steps { list-style: none; padding: 0; margin: 12px 0 4px; display: flex; flex-wrap: wrap; gap: 8px; }
                    .cm-steps li { padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #d6efe8; border: 1px solid rgba(141,240,122,.4); background: rgba(141,240,122,.08); }
                    .cm-ws-body { border-radius: 0 0 27px 27px; padding: 4px 20px 28px; background: #04141b; margin-top: -1px; }
                    @media (min-width: 860px) { .cm-ws-body { padding: 8px 36px 36px; } }
                    .cm-takes { list-style: none; padding: 0; margin: 14px 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
                    .cm-takes li { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 18px; border: 1px solid rgba(141,240,122,.22); background: rgba(141,240,122,.06); font-size: 14px; font-weight: 700; line-height: 1.35; }
                    .cm-takes .cm-ficon { flex: none; width: 42px; height: 42px; background: rgba(141,240,122,.16); color: #8DF07A; }
                    .cm-prog-btn { margin-top: 24px; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,.22); background: transparent; color: #E8F7F2; font: inherit; font-weight: 800; font-size: 14px; cursor: pointer; }
                    .cm-prog-btn:hover { background: rgba(255,255,255,.07); }
                    .cm-prog { list-style: none; margin: 14px 0 0; padding: 0 0 0 18px; border-left: 2px solid rgba(141,240,122,.45); display: none; }
                    .cm-prog[data-open='true'] { display: block; }
                    @media (min-width: 860px) { .cm-prog-btn { display: none; } .cm-prog { display: block; } }
                    .cm-prog li { position: relative; display: grid; gap: 2px; padding: 8px 0; }
                    .cm-prog li::before { content: ''; position: absolute; left: -25px; top: 15px; width: 10px; height: 10px; border-radius: 50%; background: #8DF07A; box-shadow: 0 0 0 4px rgba(141,240,122,.18); }
                    .cm-prog time { font-size: 12.5px; font-weight: 800; letter-spacing: .04em; color: #8DF07A; font-variant-numeric: tabular-nums; }
                    .cm-prog span { font-size: 14.5px; font-weight: 600; color: #e1f4ee; line-height: 1.4; }
                    @media (min-width: 640px) { .cm-prog li { grid-template-columns: 130px 1fr; gap: 16px; align-items: baseline; } }
                    .cm-deadline { margin: 14px 0 0; text-align: center; font-size: 13px; color: #9fe0d0; }
                    .cm-deadline b { color: #8DF07A; }
                    .cm-contacts { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 10px; }
                    .cm-contact { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 8px 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,.2); color: #E8F7F2; text-decoration: none; background: rgba(255,255,255,.04); }
                    .cm-contact:hover { background: rgba(255,255,255,.09); }
                    .cm-contact span { display: grid; line-height: 1.3; }
                    .cm-contact b { font-size: 14px; }
                    .cm-contact small { font-size: 13px; color: #9fe0d0; }
                    .cm-more { margin: 16px 0 0; text-align: center; font-size: 13px; color: #8fc9bb; }
                    @keyframes cmRot { to { transform: translate(-50%, -50%) rotate(360deg); } }
                    @keyframes cmMarquee { to { transform: translateX(-50%); } }
                    @keyframes cmBreathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.08); } }

                    .cm-ribbon { margin: 40px auto 0; max-width: 1100px; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
                    .cm-ribbon-track { display: flex; width: max-content; gap: 12px; animation: cmMarquee 38s linear infinite; }
                    .cm-ribbon:hover .cm-ribbon-track { animation-play-state: paused; }
                    .cm-occ { white-space: nowrap; padding: 10px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.04); color: #d6efe8; font-size: 14px; font-weight: 700; }
                    .cm-occ::before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 10px; border-radius: 50%; background: ${LIME}; vertical-align: middle; }

                    .cm-spot { max-width: 1120px; margin: 0 auto; padding: 40px 16px 0; scroll-margin-top: 72px; }
                    .cm-spot-ring { position: relative; overflow: hidden; border-radius: 36px; padding: 2px; box-shadow: 0 60px 140px -60px rgba(223,255,56,.55); }
                    .cm-spot-ring::before { content: ''; position: absolute; left: 50%; top: 50%; width: 200%; aspect-ratio: 1; background: conic-gradient(${LIME}, ${TEAL}, #F4B860, ${LIME}); transform: translate(-50%, -50%); animation: cmRot 7s linear infinite; will-change: transform; }
                    .cm-spot-in { position: relative; z-index: 1; overflow: hidden; border-radius: 34px; padding: 56px 22px 48px; text-align: center; background: radial-gradient(700px 360px at 50% 0%, rgba(223,255,56,.14), transparent 70%), linear-gradient(170deg, #07303a, #04141b 70%); }
                    .cm-spot-glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; animation: cmBreathe 6s ease-in-out infinite; }
                    .cm-spot h2 { position: relative; margin: 14px 0 0; font-size: clamp(38px, 8.4vw, 84px); line-height: 1.02; font-weight: 900; letter-spacing: -0.035em; }
                    .cm-spot-sub { position: relative; margin: 20px auto 0; max-width: 640px; font-size: clamp(16px, 2.2vw, 19px); line-height: 1.6; color: #cfeae2; }
                    .cm-spot-cta { position: relative; margin-top: 34px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
                    .cm-spot-cta .rl-btn { padding: 18px 34px; font-size: 17px; border-radius: 18px; max-width: 100%; text-align: center; overflow-wrap: anywhere; }
                    .cm-spot-note { margin: 0; font-size: 13px; color: #9fe0d0; }
                    .cm-features { list-style: none; padding: 0; margin: 28px 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
                    @media (min-width: 900px) { .cm-features { grid-template-columns: repeat(4, 1fr); } .cm-feature[data-wide='true'] { grid-column: span 2; } }
                    .cm-feature { position: relative; overflow: hidden; border-radius: 22px; padding: 24px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); transition: transform .25s ease, border-color .25s ease; --mx: 50%; --my: 0%; }
                    .cm-feature::before { content: ''; position: absolute; inset: 0; background: radial-gradient(260px circle at var(--mx) var(--my), rgba(223,255,56,.16), transparent 60%); opacity: 0; transition: opacity .3s ease; pointer-events: none; }
                    .cm-feature:hover { transform: translateY(-4px); border-color: rgba(223,255,56,.45); }
                    .cm-feature:hover::before { opacity: 1; }
                    .cm-ficon { position: relative; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 15px; background: rgba(223,255,56,.12); color: ${LIME}; }
                    .cm-feature h3 { position: relative; margin: 16px 0 6px; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
                    .cm-feature p { position: relative; margin: 0; font-size: 14px; line-height: 1.6; color: #b4dbd0; }
                    .cm-stage { display: grid; gap: 36px; align-items: center; }
                    @media (min-width: 860px) { .cm-stage { grid-template-columns: 1fr 1fr; gap: 56px; } }
                    .cm-stage-copy h2 { margin: 8px 0 0; font-size: clamp(28px, 4.6vw, 44px); line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; }
                    .cm-stage-copy p { margin: 14px 0 0; max-width: 460px; font-size: 16px; line-height: 1.65; color: #c5e6dd; }

                    @keyframes cmOrb { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 30px) scale(1.12); } }
                    @keyframes cmSweep { 0%, 55% { background-position: 130% 0; } 100% { background-position: -30% 0; } }
                    .cm-orb { animation: cmOrb 22s ease-in-out infinite; will-change: transform; }
                    .cm-bg { will-change: transform; }
                    .cm-sweep { color: ${LIME}; background: linear-gradient(100deg, ${LIME} 38%, #ffffff 50%, ${LIME} 62%); background-size: 250% 100%; background-position: 130% 0; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: cmSweep 5.5s ease-in-out 1.6s infinite; }
                    .cm-mag { transition: transform .2s ease, box-shadow .2s ease; }
                    .cm-mag:hover { box-shadow: 0 14px 40px -8px rgba(223,255,56,.75); }
                    .cm-mag:hover::after { animation-duration: 1.3s; }
                    .cm-signup:hover { box-shadow: 0 0 0 1px rgba(223,255,56,.6), 0 10px 34px -4px rgba(223,255,56,.8); }
                    .cm-cta > span { display: inline-flex; }
                    .rl-btn:active { transform: scale(.97); }
                   

                    .cm-flink { display: inline-block; margin-right: 8px; padding: 14px 8px; color: #9fe0d0; background: none; border: 0; font: inherit; cursor: pointer; text-decoration: none; transition: color .2s ease; }
                    .cm-flink:hover { color: ${LIME}; }

                    .cm-event-spot { position: absolute; inset: 1px; border-radius: 27px; pointer-events: none; opacity: 0; transition: opacity .3s ease; background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), rgba(223,255,56,.10), transparent 60%); }
                    .cm-event:hover .cm-event-spot { opacity: 1; }

                    .cm-feature { transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
                    .cm-feature:hover { transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-4px); }
                    .cm-ficon { transition: transform .35s cubic-bezier(.22,1,.36,1); }
                    .cm-feature:hover .cm-ficon { transform: scale(1.12) rotate(-7deg); }
                    @media (hover: none) { .cm-feature, .cm-feature:hover { transform: none; } .cm-feature:hover .cm-ficon { transform: none; } }
                    @media (max-width: 640px) { .cm-spark:nth-child(n+13) { display: none; } .cm-orb { animation: none; } }

                    @media (prefers-reduced-motion: reduce) {
                        .cm-orb, .cm-sweep { animation: none; }
                        .cm-spot-ring::before { animation: none; }
                        .cm-sweep { background-position: 0 0; }
                        .cm-feature, .cm-feature:hover { transform: none; }
                        .cm-spark, .cm-free, .rl-primary::after, .cm-live, .cm-ribbon-track, .cm-spot-ring, .cm-spot-glow { animation: none; }
                        .cm-ribbon-track { flex-wrap: wrap; width: auto; justify-content: center; }
                        .rl-btn, .cm-feature { transition: none; }
                        .rl-btn:hover, .cm-feature:hover { transform: none; }
                    }
                `}</style>

                <div className="cm-bg" aria-hidden="true" ref={bgRef}>
                    <div className="cm-grid" />
                    <div className="cm-blob cm-orb" style={{ left: -160, top: -140, width: 560, height: 460, background: TEAL, opacity: 0.3 }} />
                    <div className="cm-blob cm-orb" style={{ right: -180, top: 60, width: 520, height: 440, background: '#F4B860', opacity: 0.12, animationDelay: '-6s' }} />
                    <div className="cm-blob cm-orb" style={{ left: '38%', top: 220, width: 420, height: 340, background: LIME, opacity: 0.07, animationDelay: '-11s' }} />
                    {SPARKS.map((p, i) => (
                        <span key={i} className="cm-spark" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: p.o, '--t': `${p.d}s`, animationDelay: `${-p.d / 2}s` }} />
                    ))}
                </div>

                <header className="cm-top" data-s={scrolled}>
                    <div className="cm-top-in">
                        <a href="/community" className="cm-brand" aria-label="MiniYou Community Edition home">
                            <img src="/miniyou-logo.png" alt="" width="36" height="32" />
                            <span className="cm-word">Mini<span style={{ color: LIME }}>You</span></span>
                        </a>
                        <span className="cm-pill">COMMUNITY EDITION</span>
                        <nav className="cm-nav" aria-label="Community edition">
                            <a href="/" className="cm-home" aria-label="MiniYou home"><Home size={18} aria-hidden="true" /><span className="cm-txt-lg">MiniYou home</span></a>
                            {!DISPLAY_ONLY && (
                                <>
                                    <a href="/login" className="rl-btn rl-ghost cm-hide-sm">Log in</a>
                                    <a href="/signup" className="rl-btn rl-primary cm-signup">Sign up</a>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main style={{ position: 'relative' }}>
                    <section className="cm-hero">
                        <h1 className="cm-h1">
                            <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>Events are where people meet.</motion.span>
                            <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}><span className="cm-sweep">MiniYou makes it last.</span></motion.span>
                        </h1>
                        <motion.p className="cm-lead" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }}>
                            With <Brand />, every attendee, speaker and member walks in with a digital identity and a QR code. One scan, and the conversation keeps going long after the event ends.
                        </motion.p>
                        <div className="cm-cta">
                            <motion.span className="cm-pair" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}><ContactActions label="Bring MiniYou to your event" /></motion.span>
                            {!DISPLAY_ONLY && <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.88 }}><a href="/signup" className="rl-btn rl-ghost">Get my MiniYou <ArrowRight size={18} aria-hidden="true" /></a></motion.span>}
                            <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }}><a href="#events" className="rl-btn rl-ghost"><CalendarDays size={17} aria-hidden="true" /> Upcoming events</a></motion.span>
                        </div>
                        <Reveal delay={0.1}>
                            <div className="cm-ribbon" aria-label="Made for conferences, summits, workshops, meetups, hackathons, alumni meets, clubs, cohorts, trade shows, webinars, bootcamps and communities">
                                <div className="cm-ribbon-track" aria-hidden="true">
                                    {[...OCCASIONS, ...OCCASIONS].map((o, k) => <span key={k} className="cm-occ">{o}</span>)}
                                </div>
                            </div>
                        </Reveal>
                    </section>

                    <section id="set-up" aria-label="Set up MiniYou for your event" className="cm-spot">
                        <Reveal>
                            <div className="cm-spot-ring">
                                <div className="cm-spot-in">
                                    <div className="cm-spot-glow" aria-hidden="true" style={{ left: -120, top: -80, width: 380, height: 320, background: TEAL }} />
                                    <div className="cm-spot-glow" aria-hidden="true" style={{ right: -120, bottom: -100, width: 380, height: 320, background: '#F4B860', animationDelay: '-3s' }} />
                                    <p className="cm-eyebrow" style={{ position: 'relative' }}>For organizers</p>
                                    <h2>Give everyone<br />a <Brand />.</h2>
                                    <p className="cm-spot-sub">Your event, your community, your name and colours. Let&apos;s set it up for you, from a ten-person workshop to a ten-thousand-person summit.</p>
                                    <div className="cm-spot-cta">
                                        <span className="cm-pair"><ContactActions label="Let's set it up for your event" /></span>
                                        <p className="cm-spot-note">Message us on WhatsApp at <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" style={{ color: LIME, fontWeight: 700 }}>{CONTACT_PHONE_LABEL}</a> or write to <a href={CONTACT_HREF} style={{ color: LIME, fontWeight: 700 }}>{CONTACT_EMAIL}</a> with your event name, date and group size.</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </section>

                    <section id="events" aria-label="Upcoming events" className="cm-sec" style={{ scrollMarginTop: 72 }}>
                        <Reveal>
                            <p className="cm-eyebrow">Upcoming events</p>
                            <h2 className="cm-h2">Where the community meets next</h2>
                            <p className="cm-sub">Add the date to your calendar, find your way there, and get your MiniYou before you arrive.</p>
                        </Reveal>
                        {EVENTS.map((ev) => (
                            <Reveal key={ev.id} delay={0.08}>{ev.kind === 'workshop' ? <WorkshopCard ev={ev} /> : <EventCard ev={ev} />}</Reveal>
                        ))}
                        <p className="cm-more">More community events will appear here.</p>
                    </section>

                    <section id="designs" aria-label="Role designs" className="cm-sec" style={{ scrollMarginTop: 72 }}>
                        <div className="cm-stage">
                            <Reveal className="cm-stage-copy">
                                <p className="cm-eyebrow">Made for every role</p>
                                <h2>One <Brand />. A look for every role you play.</h2>
                                <p>Attendee today, speaker tomorrow, organizer next year. Your MiniYou changes with you, and your design unlocks the moment your role is verified.</p>
                            </Reveal>
                            <Reveal delay={0.12}><VerifiedCardTeaser /></Reveal>
                        </div>
                    </section>

                    <section id="why" aria-label="What MiniYou does" className="cm-sec" style={{ scrollMarginTop: 72 }}>
                        <Reveal>
                            <p className="cm-eyebrow">Why <Brand /></p>
                            <h2 className="cm-h2">Meet once. Stay connected.</h2>
                            <p className="cm-sub">Your identity, work and connections — all in one scan.</p>
                        </Reveal>
                        <ul className="cm-features">
                            {LIVE_FEATURES.map((f, i) => (
                                <Feature key={f.title} icon={f.icon} title={f.title} text={f.text} wide={f.wide} delay={(i % 4) * 0.07} />
                            ))}
                        </ul>
                        <Reveal delay={0.1}>
                            <div style={{ textAlign: 'center', marginTop: 36 }}>
                                <span className="cm-pair"><ContactActions label="Bring MiniYou to your event" /></span>
                            </div>
                        </Reveal>
                    </section>
                </main>

                <motion.footer initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ maxWidth: 820, margin: '0 auto', padding: '44px 20px calc(40px + env(safe-area-inset-bottom))', textAlign: 'center', fontSize: 12, lineHeight: 1.7, color: '#8fc9bb', position: 'relative' }}>
                    <p style={{ margin: 0 }}>{RMC_EVENT.disclaimer}</p>
                    <p style={{ margin: '10px 0 0' }}>
                        <a href="/privacy" className="cm-flink">Privacy</a>
                        <a href="/terms" className="cm-flink">Terms</a>
                        <a href="/refund" className="cm-flink">Refunds</a>
                        <button type="button" className="cm-flink" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button>
                    </p>
                </motion.footer>
            </div>
        </MotionConfig>
    );
}
