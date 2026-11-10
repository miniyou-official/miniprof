'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { PLATFORM_DOMAINS, cleanLink } from './linkSafety';

export { PLATFORM_DOMAINS };

// Where a person goes to find their own profile link
const FIND_URL = {
  instagram: 'https://www.instagram.com/',
  twitter: 'https://x.com/home',
  linkedin: 'https://www.linkedin.com/in/me/',
  github: 'https://github.com/',
  youtube: 'https://www.youtube.com/account',
  discord: 'https://discord.com/channels/@me',
  facebook: 'https://www.facebook.com/me',
  twitch: 'https://www.twitch.tv/',
  medium: 'https://medium.com/me',
  behance: 'https://www.behance.net/',
  telegram: 'https://web.telegram.org/',
  reddit: 'https://www.reddit.com/user/me',
  hackerrank: 'https://www.hackerrank.com/dashboard',
  patreon: 'https://www.patreon.com/home',
};

// A bare handle such as @mdayaan becomes a full link
const HANDLE_URL = {
  instagram: (h) => `https://instagram.com/${h}`,
  twitter: (h) => `https://x.com/${h}`,
  github: (h) => `https://github.com/${h}`,
  youtube: (h) => `https://youtube.com/@${h}`,
  twitch: (h) => `https://twitch.tv/${h}`,
  linkedin: (h) => `https://linkedin.com/in/${h}`,
  telegram: (h) => `https://t.me/${h}`,
  reddit: (h) => `https://reddit.com/user/${h}`,
  medium: (h) => `https://medium.com/@${h}`,
  hackerrank: (h) => `https://www.hackerrank.com/profile/${h}`,
  patreon: (h) => `https://www.patreon.com/${h}`,
};

// Checks a link for a platform and returns a clean https link. The rules live in linkSafety.js and are enforced again by the database.
// This checks the address itself (right site, safe, well formed). It does not contact the site to prove the account exists.
export function checkPlatformLink(raw, platform) {
  const text = (raw || '').trim();
  if (!text) return { ok: false, reason: 'empty' };
  let candidate = text;
  const isHandle = /^@?[A-Za-z0-9_.\-]{2,40}$/.test(text) && !text.includes('/') && !/\.[a-z]{2,}$/i.test(text);
  if (isHandle && HANDLE_URL[platform]) candidate = HANDLE_URL[platform](text.replace(/^@/, ''));
  return cleanLink(candidate, platform);
}

// Opens the app in a small window so the person can copy their profile link. When they come back, we read
// what they copied, fill it in if it fits this app, and close the small window by ourselves.
export function useLinkFinder({ onLink }) {
  const popupRef = useRef(null);
  const onLinkRef = useRef(onLink);
  onLinkRef.current = onLink;
  const [waitingFor, setWaitingFor] = useState(null);
  const [note, setNote] = useState('');

  const closePopup = useCallback(() => {
    try { if (popupRef.current && !popupRef.current.closed) popupRef.current.close(); } catch { /* already closed */ }
    popupRef.current = null;
  }, []);

  const finish = useCallback((platform, url) => {
    onLinkRef.current(platform, url);
    closePopup();
    setWaitingFor(null);
    setNote('');
  }, [closePopup]);

  // Read the clipboard now (a tap on Paste always works; coming back to the tab works once allowed)
  const readClipboard = useCallback(async (platform) => {
    try {
      const text = await navigator.clipboard.readText();
      const result = checkPlatformLink(text, platform);
      if (result.ok) { finish(platform, result.url); return true; }
      setNote('Copy your profile link in the other window, then come back.');
    } catch {
      setNote('Tap Paste to add the link you copied.');
    }
    return false;
  }, [finish]);

  const open = useCallback((platform) => {
    const target = FIND_URL[platform];
    if (!target) return;
    closePopup();
    // The window keeps no link back to MiniYou (opener is cleared below), but we keep our own handle so we can close it
    const w = window.open('about:blank', 'miniyou-link-finder', 'width=520,height=760');
    if (w) {
      try { w.opener = null; } catch { /* ignore */ }
      w.location.href = target;
      popupRef.current = w;
    } else {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
    setWaitingFor(platform);
    setNote('Copy your profile link there, then come back. We will paste it for you.');
  }, [closePopup]);

  useEffect(() => {
    if (!waitingFor) return undefined;
    const onBack = () => { if (document.visibilityState === 'visible') readClipboard(waitingFor); };
    window.addEventListener('focus', onBack);
    document.addEventListener('visibilitychange', onBack);
    const timer = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) { popupRef.current = null; setWaitingFor(null); }
    }, 800);
    return () => {
      window.removeEventListener('focus', onBack);
      document.removeEventListener('visibilitychange', onBack);
      clearInterval(timer);
    };
  }, [waitingFor, readClipboard]);

  useEffect(() => closePopup, [closePopup]);

  return { open, paste: readClipboard, waitingFor, note, cancel: () => { closePopup(); setWaitingFor(null); setNote(''); } };
}
