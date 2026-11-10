'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { checkRateLimit } from '@/lib/auth';
import Link from 'next/link';
import AuthShell, { AUTH_INPUT, AUTH_BUTTON, AUTH_BUTTON_STYLE } from '@/components/AuthShell';

const BLUE = '#1AD1FF';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await checkRateLimit('reset');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      const m = (err && err.message ? err.message : '').toLowerCase();
      setError(m.includes('rate limit') || m.includes('too many')
        ? 'Too many reset emails. Please wait a few minutes and try again.'
        : (err.message || 'Failed to send reset email. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={sent ? 'Check your email' : 'Reset your password'}
      subtitle={sent ? 'Your reset email is on its way.' : 'Enter your email and we will send you a reset email.'}
      error={sent ? '' : error}
      footer={<Link href="/login" className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold hover:underline" style={{ color: BLUE }}><ArrowLeft size={14} /> Back to login</Link>}
    >
      {sent ? (
        <div className="py-2 text-center">
          <div className="auth-pop mx-auto grid h-[84px] w-[84px] place-items-center rounded-full" style={{ background: `${BLUE}22`, boxShadow: `0 0 0 8px ${BLUE}14` }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0A9FD6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path className="auth-check-path" d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <p className="mt-5 text-black/65" role="status">
            We sent a password reset email to <strong className="break-all text-[#05060A]">{email}</strong>. Use the 6-digit code in it, or click the link. The newest email is the one that works.
          </p>
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full text-base font-bold text-[#05060A]"
            style={AUTH_BUTTON_STYLE}
          >
            Enter my code <ArrowRight size={18} />
          </Link>
          <p className="mt-3 text-xs text-black/40">{"Don't see it? Check your spam folder."}</p>
        </div>
      ) : (
        <form method="post" onSubmit={handleSubmit} className="auth-stack">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-black/60">Email</label>
            <div className="relative">
              <Mail size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                id="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={AUTH_INPUT}
                placeholder="you@example.com"
                autoComplete="email"
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
                Sending...
              </>
            ) : (
              <>Send reset email <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
