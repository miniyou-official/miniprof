'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Check, Mail, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { checkRateLimit } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell, { AUTH_INPUT, AUTH_BUTTON, AUTH_BUTTON_STYLE } from '@/components/AuthShell';

const BLUE = '#1AD1FF';

// The same rules the sign-up form enforces
const passwordRules = (pw) => [
  { label: '8+ characters', ok: pw.length >= 8 },
  { label: 'One uppercase letter', ok: /[A-Z]/.test(pw) },
  { label: 'One special character', ok: /[^A-Za-z0-9]/.test(pw) },
  { label: 'No $ or *', ok: pw.length > 0 && !/[$*]/.test(pw) },
];

// Plain words for what Supabase reports
const friendly = (err) => {
  const m = (err && err.message ? err.message : String(err || '')).toLowerCase();
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many reset emails. Please wait a few minutes and try again.';
  if (m.includes('expired') || m.includes('invalid') || m.includes('not found')) return 'That code or link is not valid any more. Request a new one below.';
  return (err && err.message) || 'Something went wrong. Please try again.';
};

export default function ResetPasswordPage() {
  const router = useRouter();
  // checking: reading the link, code: enter the 6-digit code, password: choose a new one, success, expired: the link did not work
  const [phase, setPhase] = useState('checking');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const phaseRef = useRef('checking');
  phaseRef.current = phase;

  // Work out how the person arrived: a link, an expired link, or from the forgot-password page
  useEffect(() => {
    let timer;
    let poll;
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const emailParam = query.get('email');
    if (emailParam) setEmail(emailParam);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPhase('password');
    });

    const urlError = query.get('error_description') || hash.get('error_description') || query.get('error') || hash.get('error');
    const tokenHash = query.get('token_hash');
    const signedLink = query.get('code') || hash.get('access_token');

    (async () => {
      if (urlError) {
        setError('That reset link has expired or was already used. Links work only once.');
        setPhase('expired');
        return;
      }
      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (verifyError) { setError(friendly(verifyError)); setPhase('expired'); } else { setPhase('password'); }
        return;
      }
      if (signedLink) {
        // Supabase is reading the link; give it a few seconds
        let waited = 0;
        poll = setInterval(async () => {
          waited += 700;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) { clearInterval(poll); setPhase('password'); }
          else if (waited >= 8000) {
            clearInterval(poll);
            if (phaseRef.current === 'checking') {
              setError('This link did not work. It may have been used already, or opened in a different browser than the one you asked from. Use the 6-digit code from the email instead.');
              setPhase('expired');
            }
          }
        }, 700);
        return;
      }
      // Coming from the forgot-password page: always start with the code
      if (emailParam) { setPhase('code'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      setPhase(user ? 'password' : 'code');
    })();

    return () => { clearTimeout(timer); clearInterval(poll); subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter the email you asked the code for.'); return; }
    if (!/^\d{6}$/.test(code.trim())) { setError('The code is 6 digits.'); return; }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
      if (verifyError) throw verifyError;
      setPhase('password');
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) { setError('Enter your email first.'); return; }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await checkRateLimit('reset');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (resetError) throw resetError;
      setInfo('A new email is on its way. Use the newest one.');
      setCooldown(30);
      setPhase('code');
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password must contain at least one uppercase letter.'); return; }
    if (!/[^A-Za-z0-9]/.test(password)) { setError('Password must contain at least one special character.'); return; }
    if (/[$*]/.test(password)) { setError('Password cannot contain "$" or "*".'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setPhase('success');
      // Sign out the temporary reset session so the new password is used to log in
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
      setTimeout(() => { window.location.assign('/login'); }, 2500);
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  const rules = passwordRules(password);
  const titles = {
    checking: ['Checking your link', 'One moment.'],
    code: ['Enter your code', 'We sent a 6-digit code to your email.'],
    password: ['Choose a new password', 'Pick something strong that you have not used before.'],
    success: ['Password updated', 'You can log in with it now.'],
    expired: ['That link did not work', 'No problem, you can get a new one.'],
  };
  const [titleText, subText] = titles[phase];

  const checkMark = (
    <div className="py-2 text-center">
      <div className="auth-pop mx-auto grid h-[84px] w-[84px] place-items-center rounded-full" style={{ background: `${BLUE}22`, boxShadow: `0 0 0 8px ${BLUE}14` }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0A9FD6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path className="auth-check-path" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <p className="mt-5 text-black/65" role="status">{'Taking you to log in...'}</p>
    </div>
  );

  return (
    <AuthShell
      title={titleText}
      subtitle={subText}
      error={phase === 'success' || phase === 'checking' ? '' : error}
      footer={<Link href="/login" className="inline-flex min-h-[44px] items-center font-semibold hover:underline" style={{ color: BLUE }}>Back to login</Link>}
    >
      {phase === 'success' ? checkMark : phase === 'checking' ? (
        <div className="py-2 text-center">
          <span className="auth-spinner mx-auto block h-9 w-9 rounded-full border-[3px] border-[#1AD1FF]/25 border-t-[#0A9FD6]" />
          <p className="mt-5 text-black/65">{'Checking your reset link...'}</p>
        </div>
      ) : phase === 'expired' ? (
        <div className="auth-stack">
          <p className="text-[13px] leading-relaxed text-black/60">
            Reset links work only once, and some email apps open them before you do. A 6-digit code does not have that problem.
          </p>
          <button type="button" onClick={() => { setError(''); setPhase('code'); }} className={AUTH_BUTTON} style={AUTH_BUTTON_STYLE}>
            <KeyRound size={18} /> Use a 6-digit code
          </button>
          <Link href="/forgot-password" className="flex min-h-[44px] items-center justify-center text-sm font-semibold text-[#0A9FD6] hover:underline">
            Request a new email
          </Link>
        </div>
      ) : phase === 'code' ? (
        <form method="post" onSubmit={handleVerifyCode} className="auth-stack">
          <div>
            <label htmlFor="rp-email" className="mb-1.5 block text-[13px] font-semibold text-black/60">Email</label>
            <div className="relative">
              <Mail size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                id="rp-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className={AUTH_INPUT} placeholder="you@example.com" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              />
            </div>
          </div>
          <div>
            <label htmlFor="rp-code" className="mb-1.5 block text-[13px] font-semibold text-black/60">6-digit code</label>
            <div className="relative">
              <KeyRound size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                id="rp-code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                className={`${AUTH_INPUT} tracking-[0.4em]`} placeholder="000000" autoComplete="one-time-code"
              />
            </div>
          </div>
          {info && <p className="text-[13px] font-semibold text-[#0A9FD6]" role="status">{info}</p>}
          <button type="submit" disabled={loading} className={AUTH_BUTTON} style={AUTH_BUTTON_STYLE}>
            {loading ? (<><span className="auth-spinner h-5 w-5 rounded-full border-2 border-black/25 border-t-black" />Checking...</>) : (<>Verify code <ArrowRight size={18} /></>)}
          </button>
          <button
            type="button" onClick={handleResend} disabled={loading || cooldown > 0}
            className="flex min-h-[44px] items-center justify-center text-sm font-semibold text-[#0A9FD6] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Send a new email in ${cooldown}s` : 'Send me a new email'}
          </button>
        </form>
      ) : (
        <form method="post" onSubmit={handleSubmit} className="auth-stack">
          {/* New Password */}
          <div>
            <label htmlFor="newpw" className="mb-1.5 block text-[13px] font-semibold text-black/60">New password</label>
            <div className="relative">
              <Lock size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                id="newpw"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${AUTH_INPUT} pr-12`}
                placeholder="New password"
                autoComplete="new-password"
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
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]" aria-live="polite">
              {rules.map((r) => (
                <li key={r.label} className="flex items-center gap-2 transition-colors" style={{ color: r.ok ? '#0A9FD6' : 'rgba(0,0,0,0.45)' }}>
                  <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border transition-all" style={r.ok ? { background: BLUE, borderColor: BLUE, color: '#000' } : { borderColor: 'rgba(0,0,0,0.2)', color: 'transparent' }}>
                    <Check size={10} strokeWidth={3.5} />
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmpw" className="mb-1.5 block text-[13px] font-semibold text-black/60">Confirm password</label>
            <div className="relative">
              <Lock size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                id="confirmpw"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={AUTH_INPUT}
                placeholder="Confirm new password"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={AUTH_BUTTON} style={AUTH_BUTTON_STYLE}>
            {loading ? (
              <>
                <span className="auth-spinner h-5 w-5 rounded-full border-2 border-black/25 border-t-black" />
                Updating...
              </>
            ) : (
              <>Update password <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
