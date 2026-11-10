import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, AtSign, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { signUpWithEmail, isUsernameTaken } from '../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleButton from './GoogleButton';
import AuthShell, { AUTH_INPUT, AUTH_BUTTON, AUTH_BUTTON_STYLE } from './AuthShell';

const BLUE = '#1AD1FF';

// The same rules signUpWithEmail enforces, shown live so nobody gets surprised after pressing the button
const passwordRules = (pw) => [
    { label: '8+ characters', ok: pw.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(pw) },
    { label: 'One special character', ok: /[^A-Za-z0-9]/.test(pw) },
    { label: 'No $ or *', ok: pw.length > 0 && !/[$*]/.test(pw) },
];

export default function SignupForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    // 'ok' | 'taken' | 'invalid' | 'checking' | null. This only informs; Next is never disabled by it.
    const [nameState, setNameState] = useState(null);
    const USERNAME_OK = /^[a-zA-Z0-9_]{3,20}$/;

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!fullName || !username || !email || !password) {
            setError('Please fill in all required fields.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await signUpWithEmail(email, password, fullName, username);
            setSuccess(`Welcome, ${fullName}! Your profile is created. Taking you to log in...`);

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err) {
            const errorMessage = err.message;
            // Enhanced error handling to match auth.js validation
            if (errorMessage.includes('Nickname already exists')) {
                setError('That username is already taken. Please try another.');
            } else if (errorMessage.startsWith('Username must be')) {
                setError(errorMessage);
                setStep(1);
            } else if (errorMessage.includes('uppercase letter')) {
                setError('Your password needs at least one uppercase letter.');
            } else if (errorMessage.includes('special character')) {
                setError('Your password needs at least one special character.');
            } else if (errorMessage.includes('cannot contain the specific characters "$" or "*"')) {
                setError('Your password cannot contain "$" or "*".');
            } else if (errorMessage.includes('Password must be at least 8 characters long.')) {
                setError('Your password must be at least 8 characters long.');
            } else if (errorMessage.includes('User already registered')) {
                setError('This email is already registered. Please log in.');
            } else {
                setError(`Something went wrong. ${errorMessage}`);
                if (process.env.NODE_ENV !== 'production') console.error("Signup Error:", err);
            }
        } finally {
            setLoading(false);
        }
    }, [fullName, username, email, password, router]);

    // Check the username against the database as they type, so a taken one is flagged right away
    useEffect(() => {
        const name = username.trim();
        if (!name) { setNameState(null); return undefined; }
        if (!USERNAME_OK.test(name)) { setNameState('invalid'); return undefined; }
        setNameState('checking');
        let stale = false;
        const t = setTimeout(async () => {
            try {
                const taken = await isUsernameTaken(name);
                if (!stale) setNameState(taken ? 'taken' : 'ok');
            } catch {
                if (!stale) setNameState(null); // could not check; the final step checks again
            }
        }, 350);
        return () => { stale = true; clearTimeout(t); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    // Step 1 only collects who you are; nothing is created until the last step.
    // Next always works for a valid name: if the check is still running, it is finished here, then they continue.
    const goNext = async (e) => {
        e.preventDefault();
        const name = username.trim();
        if (!fullName.trim() || !name) {
            setError('Please enter your name and a username.');
            return;
        }
        if (!USERNAME_OK.test(name)) {
            setError('Username must be 3 to 20 characters: letters, numbers or underscore.');
            return;
        }
        if (nameState !== 'ok') {
            try {
                if (await isUsernameTaken(name)) {
                    setNameState('taken');
                    setError('That username already exists. Please try another.');
                    return;
                }
                setNameState('ok');
            } catch { /* could not check; the final step checks again */ }
        }
        setError('');
        setStep(2);
    };

    // A taken username is fixed on step 1, so take them back there
    useEffect(() => {
        if (error && error.includes('username is already taken')) { setStep(1); setNameState('taken'); }
    }, [error]);

    const fieldIcon = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40';
    const labelCls = 'auth-label mb-1.5 block text-[13px] font-semibold text-black/60';
    const rules = passwordRules(password);

    const progress = success ? null : (
        <div className="mb-[clamp(8px,1.4dvh,14px)] flex items-center gap-2" role="status" aria-label={`Step ${step} of 2`}>
            <span className="h-1.5 rounded-full transition-all duration-300" style={{ width: step === 1 ? 28 : 10, background: BLUE }} />
            <span className="h-1.5 rounded-full transition-all duration-300" style={{ width: step === 2 ? 28 : 10, background: step === 2 ? BLUE : 'rgba(0,0,0,0.15)' }} />
            <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-black/40">Step {step} of 2</span>
        </div>
    );

    return (
        <AuthShell
            title={success ? 'Your card is ready' : step === 1 ? 'Create your card' : 'Secure your card'}
            subtitle={success ? 'One more moment.' : step === 1 ? 'Your Digital Profile Card. Tell us who you are.' : 'Add your email and a password.'}
            error={success ? '' : error}
            trust={success || step !== 1 ? null : 'Free to start. No payment details needed.'}
            progress={progress}
            footer={success ? null : <>Already have a card?&nbsp;<Link href="/login" className="inline-flex min-h-[44px] items-center font-semibold hover:underline" style={{ color: BLUE }}>Log in</Link></>}
        >
            <AnimatePresence mode="wait" initial={false}>
                {success ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-2 text-center">
                        <div className="auth-pop mx-auto grid h-[84px] w-[84px] place-items-center rounded-full" style={{ background: `${BLUE}22`, boxShadow: `0 0 0 8px ${BLUE}14` }}>
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0A9FD6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path className="auth-check-path" d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                        </div>
                        <p className="mt-5 text-black/65" role="status">{success}</p>
                    </motion.div>
                ) : step === 1 ? (
                    <motion.div key="step1" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
                        <GoogleButton />

                        <div className="my-[clamp(10px,1.9dvh,20px)] flex items-center gap-3">
                            <div className="h-px flex-1 bg-black/10" />
                            <span className="text-xs font-medium uppercase tracking-widest text-black/35">or</span>
                            <div className="h-px flex-1 bg-black/10" />
                        </div>

                        <form method="post" onSubmit={goNext} className="auth-stack">
                            <div>
                                <label htmlFor="fullName" className={labelCls}>Full name</label>
                                <div className="relative">
                                    <User size={20} className={fieldIcon} />
                                    <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={AUTH_INPUT} placeholder="Priya Nair" autoComplete="name" autoCapitalize="words" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="username" className={labelCls}>Username</label>
                                <div className="relative">
                                    <AtSign size={20} className={fieldIcon} />
                                    <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={AUTH_INPUT} placeholder="jane_doe" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
                                </div>
                                {nameState === 'taken' ? (
                                    <p className="mt-1.5 text-xs font-semibold text-red-600" role="status">That username already exists. Please try another.</p>
                                ) : nameState === 'invalid' ? (
                                    <p className="mt-1.5 text-xs text-black/50" role="status">3 to 20 characters: letters, numbers or underscore.</p>
                                ) : (
                                    <p className="mt-1.5 truncate text-xs text-black/40" role="status">
                                        {nameState === 'ok' ? <span className="font-semibold text-emerald-600">Available. </span> : nameState === 'checking' ? 'Checking... ' : ''}
                                        Your address: miniyou.co.in/{username.trim() || 'jane_doe'}
                                    </p>
                                )}
                            </div>

                            <button type="submit" className={AUTH_BUTTON} style={AUTH_BUTTON_STYLE}>
                                Next <ArrowRight size={18} />
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div key="step2" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
                        <form method="post" onSubmit={handleSubmit} className="auth-stack">
                            <div>
                                <label htmlFor="email" className={labelCls}>Email</label>
                                <div className="relative">
                                    <Mail size={20} className={fieldIcon} />
                                    <input id="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={AUTH_INPUT} placeholder="you@example.com" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={labelCls}>Password</label>
                                <div className="relative">
                                    <Lock size={20} className={fieldIcon} />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={`${AUTH_INPUT} pr-12`}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/70"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]" aria-live="polite">
                                    {rules.map((r) => (
                                        <li key={r.label} className="flex items-center gap-1.5 transition-colors" style={{ color: r.ok ? '#0A9FD6' : 'rgba(0,0,0,0.45)' }}>
                                            <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border transition-all" style={r.ok ? { background: BLUE, borderColor: BLUE, color: '#000' } : { borderColor: 'rgba(0,0,0,0.2)', color: 'transparent' }}>
                                                <Check size={9} strokeWidth={3.5} />
                                            </span>
                                            {r.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <label htmlFor="agree" className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[13px] leading-snug text-black/60">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="h-5 w-5 shrink-0"
                                    style={{ accentColor: '#0A9FD6' }}
                                />
                                <span>
                                    I agree to the{' '}
                                    <a href="/terms" className="font-semibold text-[#0A9FD6] hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="/privacy" className="font-semibold text-[#0A9FD6] hover:underline">Privacy Policy</a>
                                </span>
                            </label>

                            <div className="flex gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => { setError(''); setStep(1); }}
                                    className="flex h-[var(--fh,48px)] min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full border border-black/15 px-4 text-[15px] font-semibold text-black/70 transition hover:bg-black/5 active:scale-[0.98]"
                                    aria-label="Back to step 1"
                                >
                                    <ArrowLeft size={17} /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !agreed}
                                    className={AUTH_BUTTON}
                                    style={AUTH_BUTTON_STYLE}
                                >
                                    {loading ? (
                                        <>
                                            <span className="auth-spinner h-5 w-5 rounded-full border-2 border-black/25 border-t-black" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>Create my card <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthShell>
    );
}
