'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

// Google "G" logo in official brand colors
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);

  // Coming back from Google with the browser's back button restores this page exactly as it was left,
  // still showing "Connecting...". Clear it whenever the page is shown again.
  useEffect(() => {
    const onShow = () => setLoading(false);
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Google OAuth error:', error.message);
        setLoading(false);
      }
      // If no error, browser will redirect — keep loading state
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('Google sign-in failed:', err);
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-[var(--fh,48px)] min-h-[44px] w-full items-center justify-center gap-3 rounded-xl border border-black/15 bg-white text-[15px] font-semibold text-[#05060A] transition-colors hover:bg-[#F4F7FB] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0A9FD6]/30 border-t-[#0A9FD6]" />
      ) : (
        <GoogleLogo />
      )}
      {loading ? 'Connecting...' : 'Continue with Google'}
    </motion.button>
  );
}
