'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProgressLoader from '@/components/ProgressLoader';
import { rmcReturnPath } from '@/lib/rmcRole';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Signing you in');
  const [target, setTarget] = useState(10);

  useEffect(() => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Show 100% for a moment, then go
    async function finish(path) {
      setStatus('All set');
      setTarget(100);
      await wait(550);
      router.replace(rmcReturnPath(path));
    }

    async function handleCallback() {
      try {
        // Give Supabase a moment to process tokens from URL hash
        await wait(500);

        // Try getSession first, then getUser as fallback
        let user = null;

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          user = sessionData.session.user;
        } else {
          // Fallback: session might already be established via cookie
          const { data: userData } = await supabase.auth.getUser();
          user = userData?.user;
        }

        if (!user) {
          // Last retry after longer wait
          setTarget(25);
          await wait(2000);
          const { data: retryData } = await supabase.auth.getUser();
          user = retryData?.user;
        }

        if (!user) {
          setStatus('Sign in did not finish');
          setTimeout(() => router.replace('/login?error=oauth_failed'), 1200);
          return;
        }

        await processUser(user);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.error('Callback error:', err);
        router.replace('/login?error=oauth_failed');
      }
    }

    async function processUser(user) {
      setStatus('Finding your profile');
      setTarget(42);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('newprofile')
        .select('id, onboarding_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Existing user — check if onboarding is done
        setStatus('Opening your dashboard');
        setTarget(82);
        await finish(existingProfile.onboarding_complete ? '/dashboard' : '/dashboard/onboarding');
        return;
      }

      // New user — create profile
      setStatus('Creating your profile');
      setTarget(60);
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const avatarUrl = user.user_metadata?.avatar_url || '';
      const nickname = await generateUniqueNickname(fullName);

      const { error: insertError } = await supabase
        .from('newprofile')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: fullName,
          nickname,
          avatar_url: avatarUrl,
          is_public: true,
          is_pro: false,
          onboarding_complete: false,
          theme: 'cyberpunk',
          design: {
            colors: {
              background: '#0F0F2A',
              text: '#E0FFFF',
              gradientStart: '#FF00FF',
              gradientEnd: '#00FFFF',
            },
            iconLayout: 'bottom-center',
            iconShape: 'rounded',
            theme: 'cyberpunk',
          },
        }]);

      if (insertError) {
        if (process.env.NODE_ENV !== 'production') console.error('Profile creation error:', insertError.message);
        // A parallel request may have created it already. If the profile is there, carry on; if not, stop here.
        // Sending a profile-less account back to the dashboard would bounce it straight back to this page, forever.
        const { data: made } = await supabase.from('newprofile').select('id').eq('id', user.id).maybeSingle();
        if (made) {
          await finish('/dashboard');
          return;
        }
        setStatus('We could not set up your profile');
        setTimeout(() => router.replace('/login?error=profile_failed'), 1200);
        return;
      }

      // New user → onboarding
      setStatus('Getting things ready');
      setTarget(88);
      await finish('/dashboard/onboarding');
    }

    async function generateUniqueNickname(fullName) {
      let base = (fullName || 'user')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 17);
      // The database needs at least 3 characters. A short name, or one with no a-z letters, would otherwise fail.
      if (base.length < 3) base = `user${base}`.slice(0, 17);

      const { data: existing } = await supabase
        .from('newprofile')
        .select('nickname')
        .eq('nickname', base)
        .maybeSingle();

      if (!existing) return base;

      for (let i = 0; i < 10; i++) {
        const suffix = Math.floor(100 + Math.random() * 900);
        const candidate = `${base}${suffix}`;
        const { data: taken } = await supabase
          .from('newprofile')
          .select('nickname')
          .eq('nickname', candidate)
          .maybeSingle();

        if (!taken) return candidate;
      }

      return `${base}${Date.now().toString().slice(-6)}`;
    }

    handleCallback();
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: '#05060A',
        backgroundImage: 'radial-gradient(900px 520px at 8% -6%, rgba(26,209,255,0.16), transparent 62%), radial-gradient(800px 600px at 100% 100%, rgba(42,107,255,0.16), transparent 62%)',
      }}
    >
      <ProgressLoader target={target} label={status} hint="This only takes a moment" />
    </div>
  );
}
