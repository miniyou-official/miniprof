import React, { useState } from 'react';
import { Mail, Lock, AtSign, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signInWithEmail, signInWithUsername, getCurrentUser } from '../lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GoogleButton from './GoogleButton';
import { rmcReturnPath } from '@/lib/rmcRole';
import AuthShell, { AUTH_INPUT, AUTH_BUTTON, AUTH_BUTTON_STYLE } from './AuthShell';

const BLUE = '#1AD1FF';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loginWithEmail, setLoginWithEmail] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Show OAuth error if redirected with ?error=oauth_failed
    React.useEffect(() => {
        const e = searchParams.get('error');
        if (e === 'oauth_failed') setError('Google sign-in failed. Please try again.');
        if (e === 'profile_failed') setError('We could not set up your profile. Please try again, or contact support.');
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!identifier || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            if (loginWithEmail) {
                await signInWithEmail(identifier.trim(), password);
            } else {
                await signInWithUsername(identifier.trim(), password);
            }

            let attempts = 0;
            const poll = setInterval(async () => {
                const user = await getCurrentUser();
                if (user || attempts >= 5) {
                    clearInterval(poll);
                    router.push(rmcReturnPath('/dashboard'));
                }
                attempts++;
            }, 250);
        } catch (err) {
            setError(err.message || 'Incorrect username or password. Please try again.');
            if (process.env.NODE_ENV !== 'production') console.error('Login Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Log in to your Digital Profile Card."
            error={error}
            trust={<>Protected sign-in. See our <a href="/privacy">Privacy Policy</a>.</>}
            footer={<>New to MiniYou? <Link href="/signup" className="inline-flex min-h-[44px] items-center font-semibold hover:underline" style={{ color: BLUE }}>Create your card</Link></>}
        >
            <GoogleButton />

            <div className="my-[clamp(10px,1.9dvh,20px)] flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-xs font-medium uppercase tracking-widest text-black/35">or</span>
                <div className="h-px flex-1 bg-black/10" />
            </div>

            <form method="post" onSubmit={handleSubmit} className="auth-stack">
                <div>
                    <label htmlFor="identifier" className="auth-label mb-1.5 block text-[13px] font-semibold text-black/60">{loginWithEmail ? 'Email' : 'Username'}</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
                            {loginWithEmail ? <Mail size={20} /> : <AtSign size={20} />}
                        </span>
                        <input
                            id="identifier"
                            type={loginWithEmail ? 'email' : 'text'}
                            inputMode={loginWithEmail ? 'email' : 'text'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className={AUTH_INPUT}
                            placeholder={loginWithEmail ? 'you@example.com' : 'your_username'}
                            autoComplete={loginWithEmail ? 'email' : 'username'}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="auth-label mb-1.5 block text-[13px] font-semibold text-black/60">Password</label>
                    <div className="relative">
                        <Lock size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`${AUTH_INPUT} pr-12`}
                            placeholder="Your password"
                            autoComplete="current-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/70"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 text-sm">
                    <Link href="/forgot-password" className="inline-flex min-h-[44px] items-center font-medium text-black/55 hover:text-black hover:underline">
                        Forgot password?
                    </Link>
                    <button
                        type="button"
                        onClick={() => { setLoginWithEmail(!loginWithEmail); setError(''); setIdentifier(''); }}
                        className="inline-flex min-h-[44px] items-center font-semibold text-[#0A9FD6] hover:underline focus:outline-none"
                    >
                        {loginWithEmail ? 'Use username instead' : 'Use email instead'}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={AUTH_BUTTON}
                    style={AUTH_BUTTON_STYLE}
                >
                    {loading ? (
                        <>
                            <span className="auth-spinner h-5 w-5 rounded-full border-2 border-black/25 border-t-black" />
                            Logging in...
                        </>
                    ) : (
                        <>Log in <ArrowRight size={18} /></>
                    )}
                </button>
            </form>
        </AuthShell>
    );
}
