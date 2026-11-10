'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { getCurrentUser, getUserProfile, claimAttendee } from '@/lib/auth';
import { rememberAttendeeLink, forgetAttendeeLink } from '@/lib/attendeeLink';
import { WS_EVENT_FULL_NAME } from '@/lib/workshopRole';

// Same look as the role pages: ink background, blue glow, pill buttons.
const BLUE = '#1AD1FF';
const INK = '#05060A';

const EVENTS = {
    rmc: { path: '/rmc-attendee', name: 'IEEE RMC 2026', g1: '#F4B860', g2: '#2DD4A8' },
    iew: { path: '/iew-attendee', name: WS_EVENT_FULL_NAME, g1: '#EF7F52', g2: '#2DBE8A' },
};

// The page an attendee's QR code opens. Log in, and the attendee card is activated at once; there is nothing to choose.
export default function AttendeeActivate({ event }) {
    const router = useRouter();
    const ev = EVENTS[event];
    const [state, setState] = useState('working'); // working | done
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        (async () => {
            const user = await getCurrentUser();
            if (!user) {
                // The card belongs to a MiniYou profile, so log in first. Login brings them straight back here.
                rememberAttendeeLink(ev.path);
                router.replace('/login');
                return;
            }
            let profile;
            try {
                profile = await getUserProfile(user.id);
            } catch {
                rememberAttendeeLink(ev.path);
                router.replace('/dashboard'); // no profile yet: the dashboard sets one up, then sends them back here
                return;
            }
            if (profile.onboarding_complete === false) {
                rememberAttendeeLink(ev.path);
                router.replace('/dashboard'); // finish setting up first; the dashboard brings them back here
                return;
            }
            forgetAttendeeLink();
            try {
                const { already } = await claimAttendee(profile, event);
                if (already) {
                    toast(`You already have a role at ${ev.name}.`, { icon: '✅' });
                    router.replace('/dashboard');
                    return;
                }
                setState('done');
            } catch (err) {
                toast.error(err.message || 'Could not activate your card. Please try again.');
                router.replace('/dashboard');
            }
        })();
    }, [event, ev, router]);

    const shell = (children) => (
        <main className="relative min-h-screen overflow-hidden px-5 py-12 text-white" style={{ background: INK }}>
            <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-30" style={{ background: `radial-gradient(closest-side, ${BLUE}, ${BLUE}55 45%, transparent 100%)` }} />
            <div className="relative mx-auto max-w-md">{children}</div>
        </main>
    );

    if (state === 'working') return shell(<p className="pt-24 text-center text-white/60">{'Activating your attendee card...'}</p>);

    return shell(
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>{ev.name}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{'You are in as Attendee'}</h1>
            {/* The card stays a surprise: a sealed, blurred card, revealed in the dashboard */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto mt-8 grid h-[300px] w-[200px] place-items-center overflow-hidden rounded-[28px] border"
                style={{ borderColor: `${ev.g1}88`, background: `linear-gradient(160deg, ${ev.g1}33, ${ev.g2}22 55%, #0b1220)`, boxShadow: `0 30px 80px -30px ${ev.g1}` }}
            >
                <div className="absolute inset-0" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} />
                <motion.span
                    className="absolute inset-y-0 -left-1/2 w-1/2"
                    style={{ background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                    animate={{ x: ['0%', '320%'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                />
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white/15"><Sparkles size={26} aria-hidden="true" /></span>
            </motion.div>
            <p className="mt-8 text-sm text-white/65">{'Your attendee card is unlocked and waiting for you.'}</p>
            <button
                type="button"
                onClick={() => router.replace('/dashboard')}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-extrabold uppercase tracking-wide text-black transition-transform hover:scale-[1.03]"
                style={{ background: BLUE, boxShadow: `0 14px 44px -10px ${BLUE}` }}
            >
                {'Reveal my card'}
            </button>
        </motion.div>
    );
}
