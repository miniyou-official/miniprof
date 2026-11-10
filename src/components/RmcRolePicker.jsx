'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Lock, Sparkles } from 'lucide-react';
import { getCurrentUser, getUserProfile, claimRmcRole } from '@/lib/auth';
import { RMC_ROLES, RMC_INTENT_KEY, RMC_PENDING_KEY, roleOf } from '@/lib/rmcRole';

// Same look as the landing page: ink background, blue glow, pill buttons.
const BLUE = '#1AD1FF';
const INK = '#05060A';

const store = {
    set: (k, v) => { try { localStorage.setItem(k, v); sessionStorage.setItem(RMC_INTENT_KEY, '1'); } catch { /* storage can be blocked */ } },
    clear: (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(RMC_INTENT_KEY); } catch { /* ignore */ } },
};

// The IEEE RMC 2026 link for speakers and the executive committee. Log in, tap your role, confirm. That is all.
// The role can be chosen once. The card itself stays hidden here and is revealed in the dashboard.
export default function RmcRolePicker() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pick, setPick] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            const user = await getCurrentUser();
            if (!user) {
                // The card belongs to a MiniYou profile, so log in first. Login brings them straight back here.
                store.set(RMC_PENDING_KEY, '1');
                router.replace('/login');
                return;
            }
            let data;
            try {
                data = await getUserProfile(user.id);
            } catch {
                store.set(RMC_PENDING_KEY, '1');
                router.replace('/dashboard'); // no profile yet: the dashboard sets one up, then sends them back here
                return;
            }
            if (!alive) return;
            if (data.onboarding_complete === false) {
                store.set(RMC_PENDING_KEY, '1');
                router.replace('/dashboard'); // finish setting up first; the dashboard brings them back here
                return;
            }
            if (roleOf(data.design)) {
                // The role can only be chosen once
                store.clear(RMC_PENDING_KEY);
                toast('Your IEEE RMC 2026 role is already set.', { icon: '✅' });
                router.replace('/dashboard');
                return;
            }
            store.clear(RMC_PENDING_KEY);
            setProfile(data);
            setLoading(false);
        })();
        return () => { alive = false; };
    }, [router]);

    const confirm = async () => {
        if (!pick || busy) return;
        setBusy(true);
        try {
            await claimRmcRole(profile, pick);
            setDone(true);
        } catch (err) {
            toast.error(err.message || 'Could not save your role. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const shell = (children) => (
        <main className="relative min-h-screen overflow-hidden px-5 py-12 text-white" style={{ background: INK }}>
            <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-30" style={{ background: `radial-gradient(closest-side, ${BLUE}, ${BLUE}55 45%, transparent 100%)` }} />
            <div className="relative mx-auto max-w-md">{children}</div>
        </main>
    );

    if (loading) return shell(<p className="pt-24 text-center text-white/60">{'Loading...'}</p>);

    if (done) {
        const r = RMC_ROLES[pick];
        return shell(
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>{'IEEE RMC 2026'}</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">{`You are in as ${r.label}`}</h1>
                {/* The card stays a surprise: a sealed, blurred card, revealed in the dashboard */}
                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative mx-auto mt-8 grid h-[300px] w-[200px] place-items-center overflow-hidden rounded-[28px] border"
                    style={{ borderColor: `${r.g1}88`, background: `linear-gradient(160deg, ${r.g1}33, ${r.g2}22 55%, #0b1220)`, boxShadow: `0 30px 80px -30px ${r.g1}` }}
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
                <p className="mt-8 text-sm text-white/65">{'Your IEEE RMC 2026 card is unlocked and waiting for you.'}</p>
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

    return shell(
        <>
            <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE, boxShadow: `0 0 10px ${BLUE}` }} />{'IEEE RMC 2026'}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4 text-4xl font-black tracking-tight">{'What is your role?'}</motion.h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{'Tap your role, then confirm. A special card is unlocked on your profile.'}</p>

            <div className="mt-7 grid gap-3">
                {Object.entries(RMC_ROLES).map(([key, role], i) => (
                    <motion.button
                        key={key}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPick(key)}
                        disabled={busy}
                        aria-pressed={pick === key}
                        className="relative overflow-hidden rounded-2xl border p-5 text-left transition disabled:opacity-60"
                        style={{ borderColor: pick === key ? role.g1 : 'rgba(255,255,255,0.14)', background: pick === key ? `linear-gradient(135deg, ${role.g1}26, transparent)` : 'rgba(255,255,255,0.05)', boxShadow: pick === key ? `0 18px 50px -24px ${role.g1}` : 'none' }}
                    >
                        <span className="inline-block rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-black" style={{ background: `linear-gradient(120deg, ${role.g1}, ${role.g2})` }}>{role.label}</span>
                        <span className="mt-2.5 block text-sm text-white/70">{role.blurb}</span>
                        {pick === key && <span className="absolute right-4 top-4 text-xs font-bold" style={{ color: role.g1 }}>{'Selected'}</span>}
                    </motion.button>
                ))}
            </div>

            <div className="mt-6">
                <button
                    type="button"
                    onClick={confirm}
                    disabled={!pick || busy}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-extrabold uppercase tracking-wide text-black transition-transform hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
                    style={{ background: BLUE, boxShadow: pick ? `0 14px 44px -10px ${BLUE}` : 'none' }}
                >
                    {busy ? 'Saving...' : pick ? `Confirm ${RMC_ROLES[pick].label}` : 'Choose a role'}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/45"><Lock size={12} aria-hidden="true" />{'You can choose only once, so pick carefully.'}</p>
            </div>
        </>
    );
}
