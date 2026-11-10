'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AtSign, FileText, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser, getUserProfile, updateProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { profileLabel } from '@/lib/edition';

// Same palette as the dashboard and the landing page
const THEME = {
  BG_DARK: '#05060A',
  SURFACE_DARK: '#0B0D14',
  PRIMARY: '#1AD1FF',
  ACCENT: '#4C8DFF',
  TEXT_LIGHT: '#EAF6FF',
  TEXT_MUTED: '#8FA3B8',
};

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available' | 'taken' | 'invalid' | 'checking' | null
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  // Load user and profile on mount
  useEffect(() => {
    async function load() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        const profileData = await getUserProfile(currentUser.id);
        setProfile(profileData);
        const current = profileData.nickname || '';
        setUsername(current);
        // Their current username is already theirs, so there is nothing to check; they can continue straight away
        if (current) setUsernameStatus(USERNAME_REGEX.test(current) ? 'available' : 'invalid');
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // Debounced username availability check
  const checkUsername = useCallback(
    (value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value || value.length < 3) {
        setUsernameStatus(value.length > 0 ? 'invalid' : null);
        return;
      }
      if (!USERNAME_REGEX.test(value)) {
        setUsernameStatus('invalid');
        return;
      }

      // If it's the same as their current nickname, it's fine
      if (profile && value === profile.nickname) {
        setUsernameStatus('available');
        return;
      }

      setUsernameStatus('checking');

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`);
          const data = await res.json();
          setUsernameStatus(data.available ? 'available' : 'taken');
        } catch {
          setUsernameStatus(null);
        }
      }, 400);
    },
    [profile]
  );

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    checkUsername(value);
  };

  const handleSubmit = async () => {
    if (!username || usernameStatus !== 'available' || !user) return;

    setSaving(true);
    try {
      await updateProfile(user.id, {
        nickname: username,
        bio: bio.trim(),
        onboarding_complete: true,
      });
      router.push('/dashboard');
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('Onboarding save error:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: THEME.BG_DARK }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: THEME.PRIMARY }} />
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'there';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: THEME.BG_DARK,
        color: THEME.TEXT_LIGHT,
        fontFamily: 'inherit',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-3xl space-y-6"
        style={{
          backgroundColor: THEME.SURFACE_DARK,
          border: `2px solid ${THEME.PRIMARY}`,
          boxShadow: `0 0 30px ${THEME.PRIMARY}40, 0 0 15px ${THEME.ACCENT}60`,
        }}
      >
        {/* Avatar + Welcome */}
        <div className="text-center space-y-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full mx-auto border-2"
              style={{ borderColor: THEME.PRIMARY }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: `${THEME.PRIMARY}20`,
                color: THEME.PRIMARY,
                border: `2px solid ${THEME.PRIMARY}`,
              }}
            >
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1
            className="text-2xl font-bold"
            style={{ color: THEME.PRIMARY }}
          >
            Welcome, {fullName.split(' ')[0]}
          </h1>
          <p style={{ color: THEME.TEXT_MUTED, fontSize: '0.85rem' }}>
            {'Choose your username to finish setting up.'}
          </p>
        </div>

        {/* Username Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wider" style={{ color: THEME.TEXT_MUTED }}>
            Username
          </label>
          <div className="relative">
            <AtSign
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: THEME.TEXT_MUTED }}
            />
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              maxLength={20}
              className="pl-10 pr-10 block w-full py-3 px-3 rounded-lg focus:outline-none transition-all"
              style={{
                backgroundColor: THEME.BG_DARK,
                color: THEME.TEXT_LIGHT,
                borderWidth: '1px',
                borderColor:
                  usernameStatus === 'available'
                    ? '#34D399'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? '#F87171'
                    : `${THEME.ACCENT}50`,
              }}
              placeholder="e.g. cyber_ghost"
            />
            {/* Status icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && (
                <Loader2 size={18} className="animate-spin" style={{ color: THEME.TEXT_MUTED }} />
              )}
              {usernameStatus === 'available' && (
                <CheckCircle size={18} style={{ color: '#34D399' }} />
              )}
              {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                <XCircle size={18} style={{ color: '#F87171' }} />
              )}
            </div>
          </div>
          <p className="text-xs" style={{ color: THEME.TEXT_MUTED }}>
            {usernameStatus === 'taken' && 'That username is taken. Try another.'}
            {usernameStatus === 'invalid' && 'Use 3-20 characters: letters, numbers and underscores.'}
            {usernameStatus === 'available' && 'Username is available ✓'}
            {!usernameStatus && 'Your link: ' + profileLabel(username || '...')}
          </p>
        </div>

        {/* Bio Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wider" style={{ color: THEME.TEXT_MUTED }}>
            BIO (OPTIONAL)
          </label>
          <div className="relative">
            <FileText
              size={18}
              className="absolute left-3 top-3"
              style={{ color: THEME.TEXT_MUTED }}
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              rows={3}
              className="pl-10 block w-full py-3 px-3 rounded-lg focus:outline-none transition-all resize-none"
              style={{
                backgroundColor: THEME.BG_DARK,
                color: THEME.TEXT_LIGHT,
                borderWidth: '1px',
                borderColor: `${THEME.ACCENT}50`,
              }}
              placeholder="Tell the world about yourself..."
            />
          </div>
          <p className="text-xs text-right" style={{ color: THEME.TEXT_MUTED }}>
            {bio.length}/100
          </p>
        </div>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={saving || usernameStatus !== 'available'}
          whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${THEME.ACCENT}` }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-black"
          style={{
            backgroundColor: THEME.ACCENT,
            boxShadow: `0 0 10px ${THEME.ACCENT}80`,
          }}
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Zap size={20} style={{ color: THEME.BG_DARK }} />
          )}
          {saving ? 'Saving...' : 'Continue'}
        </motion.button>
      </motion.div>
    </div>
  );
}
