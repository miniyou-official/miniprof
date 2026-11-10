import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Auth helpers (real)
import { getCurrentUser, getUserProfile, updateProfile, uploadAvatar, signOutUser } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

// Shared card components
import HolographicCard, { socialIconMap, CARD_THEMES, LinkActionModal } from './HolographicCard';
import FreshQrPanel from './qr/FreshQrPanel';
import RmcThemeCard from './rmc/RmcThemeCard';
import RmcDetailsEditor from './rmc/RmcDetailsEditor';
import CardDetailsEditor from './CardDetailsEditor';
import { getRmcDetails } from './rmc/rmcUtils';
import { getThemeForRole } from './rmc/themes';
import { IS_RMC, RMC_EVENT, profileUrl as buildProfileUrl, profileLabel, profilePath } from '@/lib/edition';
import InstallButton from './InstallButton';
import { ThemeIcon } from './card/themeIcons';
import { checkPlatformLink, useLinkFinder, PLATFORM_DOMAINS } from '@/lib/socialLinks';
import { cleanLink, cleanLabel } from '@/lib/linkSafety';
import Onboarding from './Onboarding';
import SkeletonCard from './SkeletonCard';
import ProTab from './pro/ProTab';
import { PLANS, formatRupees } from '@/lib/billing/plans';
import { openProTab, OPEN_PRO_EVENT, PRO_INTENT_KEY } from '@/lib/openPro';
import { RMC_PENDING_KEY, RMC_THEME_KEY, roleOf, roleLabel } from '@/lib/rmcRole';
import { IEW_PENDING_KEY, WS_THEME_KEY, WS_EVENT_NAME, wsRoleOf, wsRoleLabel } from '@/lib/workshopRole';
import RoleCard from './RoleCard';
import SaveMiniMeEditor from './SaveMiniMeEditor';
import IewDetailsEditor from './IewDetailsEditor';
import { pendingAttendeeLink } from '@/lib/attendeeLink';
import { ProThemeLockOverlay, ThemePreviewSheet } from './ProThemeLock';
import ProEndNotice from './ProEndNotice';
import dynamic from 'next/dynamic';

// Lazy load Pro theme preview for dashboard
const ProThemeRenderer = dynamic(
    () => import('./themes/ProThemes').then(mod => mod.ProThemeRenderer),
    { ssr: false }
);
const PRO_FULL_THEMES = []; // every theme now renders through the one designed card

// Icons: lucide-react (L)
import {
    Share2, Edit3, Palette, QrCode, User, AtSign, Camera, Bot, Smile,
    Trash2, PlusCircle, Check, Copy, LogOut, Download, LayoutList,
    Menu, X, Code, Zap, Globe, Lightbulb, CheckCircle, ChevronDown, Save, Lock, Sun, Moon, Link2, ArrowLeft, Crown
} from 'lucide-react';

// Suit is shown as one tile with a Men / Women switch
const SUIT_MEN = 'professional';
const SUIT_WOMEN = 'suitwoman';

// --- Constants for Customization ---
// Link icon shapes. Pro ones are the extra shapes; the swatch beside each name is drawn with the same outline.
const ICON_SHAPES = [
    { value: 'rounded', label: 'Hexagon', swatch: { clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)' } },
    { value: 'circle', label: 'Circle', swatch: { borderRadius: '50%' } },
    { value: 'square', label: 'Square', swatch: { borderRadius: 4 } },
    { value: 'diamond', label: 'Diamond', pro: true, swatch: { clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' } },
    { value: 'octagon', label: 'Octagon', pro: true, swatch: { clipPath: 'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)' } },
    { value: 'shield', label: 'Shield', pro: true, swatch: { clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)' } },
    { value: 'squircle', label: 'Squircle', pro: true, swatch: { borderRadius: '38%' } },
    { value: 'leaf', label: 'Leaf', pro: true, swatch: { borderRadius: '50% 3px 50% 3px' } },
];

const CLICK_ACTIONS = [
    { value: 'direct', label: 'Open Direct' },
    { value: 'qr_prompt', label: 'Ask first (QR or link)' },
];

// Dashboard colours are tokens (CSS variables) so the whole dashboard can switch between dark and light.
// The values for each mode live in DASH_CSS below. The public card keeps its own THEME in HolographicCard.jsx.
const THEME = {
    BG_DARK: 'var(--db-bg)',
    SURFACE_DARK: 'var(--db-surface)',
    PRIMARY: 'var(--db-primary)',
    ACCENT: 'var(--db-accent)',
    TEXT_LIGHT: 'var(--db-ink)',
    TEXT_MUTED: 'var(--db-muted)',
};

// A theme colour at a given transparency, from the old two-digit hex alpha (for example '50' is about 31%)
const al = (color, hexAlpha) => `color-mix(in srgb, ${color} ${Math.round((parseInt(hexAlpha, 16) / 255) * 100)}%, transparent)`;

const DASH_CSS = `
:root {
    --db-bg: #060912;
    --db-surface: #0d1220;
    --db-surface-2: #141b2e;
    --db-primary: #1ad1ff;
    --db-accent: #5b8cff;
    --db-ink: #f1f6ff;
    --db-muted: #93a4bd;
    --db-line: rgba(255, 255, 255, 0.09);
    --db-grid: rgba(255, 255, 255, 0.04);
    --db-aurora-a: rgba(26, 209, 255, 0.15);
    --db-aurora-b: rgba(42, 107, 255, 0.16);
    --db-aurora-c: rgba(139, 92, 246, 0.10);
    --db-grad-a: #7be6ff;
    --db-grad-b: #2a6bff;
    --db-shadow: 0 40px 100px -50px rgba(26, 209, 255, 0.35);
    --db-on-primary: #05060a;
    color-scheme: dark;
}
html[data-db-mode='light'] {
    --db-bg: #f2f6fc;
    --db-surface: #ffffff;
    --db-surface-2: #f5f8fd;
    --db-primary: #0b7fc7;
    --db-accent: #2563eb;
    --db-ink: #0b1220;
    --db-muted: #55657d;
    --db-line: rgba(11, 18, 32, 0.10);
    --db-grid: rgba(11, 18, 32, 0.05);
    --db-aurora-a: rgba(26, 209, 255, 0.22);
    --db-aurora-b: rgba(99, 102, 241, 0.14);
    --db-aurora-c: rgba(244, 114, 182, 0.12);
    --db-grad-a: #0ea5e9;
    --db-grad-b: #2563eb;
    --db-shadow: 0 30px 80px -40px rgba(37, 99, 235, 0.35);
    --db-on-primary: #ffffff;
    color-scheme: light;
}
.db-root { background-color: var(--db-bg); color: var(--db-ink); background-image:
    radial-gradient(900px 520px at 6% -8%, var(--db-aurora-a), transparent 62%),
    radial-gradient(800px 600px at 100% 12%, var(--db-aurora-c), transparent 62%),
    radial-gradient(900px 600px at 100% 100%, var(--db-aurora-b), transparent 62%);
    background-attachment: fixed; }
/* Laptop: the dashboard fits one screen. The card stays put, and the right panel swaps between the list and the open section. */
@media (min-width: 1024px) and (min-height: 640px) {
    html:has(.db-root) { overflow: hidden; }
    .db-shell { height: calc(100dvh - 56px - 2rem); }
    .db-aside { height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .db-panel { height: 100%; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; }
}
/* Section rows */
.db-row { position: relative; overflow: hidden; transition: border-color 0.25s ease, box-shadow 0.3s ease; }
.db-row::before { content: ''; position: absolute; inset: 0; pointer-events: none; transform: translateX(-110%); transition: transform 0.7s ease;
    background: linear-gradient(100deg, transparent 25%, color-mix(in srgb, var(--db-primary) 16%, transparent) 50%, transparent 75%); }
.db-row:hover::before { transform: translateX(110%); }
.db-row:hover, .db-row:focus-visible { border-color: color-mix(in srgb, var(--db-primary) 50%, transparent) !important;
    box-shadow: 0 16px 38px -20px color-mix(in srgb, var(--db-primary) 70%, transparent); }
.db-row:focus-visible { outline: 2px solid var(--db-primary); outline-offset: 2px; }
.db-row-icon { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.db-row:hover .db-row-icon { transform: scale(1.12) rotate(-8deg); }
.db-row-chev { transition: translate 0.25s ease; }
.db-row:hover .db-row-chev { translate: 5px 0; }
/* Inside an open section: fields rise in one after another, and focus glows */
@keyframes db-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.db-section [class*='space-y-'] > * { animation: db-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
.db-section [class*='space-y-'] > *:nth-child(2) { animation-delay: 0.05s; }
.db-section [class*='space-y-'] > *:nth-child(3) { animation-delay: 0.1s; }
.db-section [class*='space-y-'] > *:nth-child(4) { animation-delay: 0.15s; }
.db-section [class*='space-y-'] > *:nth-child(5) { animation-delay: 0.2s; }
.db-section [class*='space-y-'] > *:nth-child(6) { animation-delay: 0.25s; }
.db-section [class*='space-y-'] > *:nth-child(n+7) { animation-delay: 0.3s; }
.db-section input, .db-section textarea, .db-section select { transition: border-color 0.2s ease, box-shadow 0.25s ease; }
.db-section input:focus, .db-section textarea:focus, .db-section select:focus {
    border-color: var(--db-primary) !important; box-shadow: 0 0 0 4px color-mix(in srgb, var(--db-primary) 22%, transparent) !important; outline: none; }
.db-section button { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.25s ease; }
.db-section button:not(:disabled):hover { filter: brightness(1.06); }
.db-section button:not(:disabled):active { transform: scale(0.985); }
@media (prefers-reduced-motion: reduce) {
    .db-section [class*='space-y-'] > * { animation: none; }
    .db-row::before, .db-row-icon, .db-row-chev { transition: none; }
}
/* Shorter laptop screens: the card shrinks a little so it always fits */
@media (min-width: 1024px) and (max-height: 760px) { .db-aside > * { zoom: 0.9; } }
@media (min-width: 1024px) and (max-height: 690px) { .db-aside > * { zoom: 0.8; } }
/* An open section: a card on a laptop, a full-screen sheet on a phone */
.db-detail { position: fixed; inset: 0; z-index: 40; display: flex; flex-direction: column; background: var(--db-bg); }
.db-detail-head { display: flex; align-items: center; gap: 12px; padding: max(12px, env(safe-area-inset-top)) 16px 12px; border-bottom: 1px solid var(--db-line); background: var(--db-surface); }
.db-detail-body { flex: 1; overflow-y: auto; padding: 16px 16px max(28px, env(safe-area-inset-bottom)); }
@keyframes db-sheet-in { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (max-width: 1023px) { html:has(.db-detail) { overflow: hidden; } }
@media (min-width: 1024px) {
    .db-detail { position: static; z-index: auto; display: block; background: var(--db-surface); border: 1px solid var(--db-line); border-radius: 20px; box-shadow: var(--db-shadow); overflow: hidden; animation: none; }
    .db-detail-head { position: sticky; top: 0; z-index: 2; padding: 14px 20px; }
    .db-detail-body { overflow: visible; padding: 14px 20px 18px; }
}
/* The section row already names the section, so hide each editor's own big title */
.db-section h3[class*='border-b'] { display: none; }
/* Light mode: remap the dark-first utility classes the editors use */
html[data-db-mode='light'] .db-root .text-white,
html[data-db-mode='light'] .db-modal .text-white { color: var(--db-ink) !important; }
html[data-db-mode='light'] .db-root .text-gray-200,
html[data-db-mode='light'] .db-root .text-gray-300,
html[data-db-mode='light'] .db-root .text-gray-400,
html[data-db-mode='light'] .db-root .text-gray-500,
html[data-db-mode='light'] .db-modal .text-gray-300,
html[data-db-mode='light'] .db-modal .text-gray-400 { color: var(--db-muted) !important; }
html[data-db-mode='light'] .db-root .text-black { color: var(--db-on-primary) !important; }
html[data-db-mode='light'] .db-root [class*='bg-white/'],
html[data-db-mode='light'] .db-modal [class*='bg-white/'] { background-color: rgba(11, 18, 32, 0.04) !important; }
html[data-db-mode='light'] .db-root [class*='hover:bg-white/']:hover,
html[data-db-mode='light'] .db-modal [class*='hover:bg-white/']:hover { background-color: rgba(11, 18, 32, 0.07) !important; }
html[data-db-mode='light'] .db-root [class*='bg-gray-'],
html[data-db-mode='light'] .db-modal [class*='bg-gray-'] { background-color: var(--db-surface-2) !important; }
html[data-db-mode='light'] .db-root [class*='border-gray-'],
html[data-db-mode='light'] .db-root [class*='border-white/'] { border-color: var(--db-line) !important; }
html[data-db-mode='light'] .db-root [class*='bg-black'] { background-color: rgba(11, 18, 32, 0.06) !important; }
html[data-db-mode='light'] .db-root .hover\\:text-white:hover { color: var(--db-ink) !important; }
html[data-db-mode='light'] .db-root input,
html[data-db-mode='light'] .db-root textarea,
html[data-db-mode='light'] .db-root select { color: var(--db-ink); }
html[data-db-mode='light'] .db-root ::placeholder { color: var(--db-muted); opacity: 0.8; }
`;

// (socialIconMap, CardLink, LinkActionModal, HolographicCard imported from HolographicCard.jsx)

// --- Link safety: the shared rules in src/lib/linkSafety.js (the database enforces them again) ---
function normalizeAndValidateUrl(rawUrl, platform = 'custom') {
    const result = cleanLink(rawUrl, platform);
    return result.ok ? result.url : null;
}


// --- Main Dashboard Component ---
export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null); // which section is open (none at first, so every row shows)
    // Each open section gets its own history entry, so the phone's back swipe closes the section instead of leaving the site
    const activeTabRef = useRef(null);
    const fromPopRef = useRef(false);
    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
    useEffect(() => {
        const onPop = (e) => {
            const next = e.state?.muSection || null;
            if (next === activeTabRef.current) return;
            fromPopRef.current = true;
            setActiveTab(next);
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);
    useEffect(() => {
        if (fromPopRef.current) { fromPopRef.current = false; return; }
        if (activeTab) {
            try { window.history.pushState({ ...window.history.state, muSection: activeTab }, '', window.location.href); } catch { /* history can be blocked */ }
        }
    }, [activeTab]);
    const closeSection = useCallback(() => {
        if (window.history.state?.muSection) window.history.back();
        else setActiveTab(null);
    }, []);
    // The list remembers where you were scrolled, and only plays its fade-in the very first time it appears
    const savedScrollRef = useRef(0);
    const listIntroRef = useRef(true);
    const openFromList = useCallback((id) => {
        savedScrollRef.current = window.scrollY;
        setActiveTab(id);
    }, []);
    const prevTabRef = useRef(null);
    useEffect(() => {
        const was = prevTabRef.current;
        prevTabRef.current = activeTab;
        if (!was && activeTab) window.scrollTo(0, 0);
        else if (was && !activeTab) requestAnimationFrame(() => window.scrollTo(0, savedScrollRef.current));
    }, [activeTab]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Any "Go Pro" button inside the dashboard opens the Pro tab, where the price and the pay button are
    useEffect(() => {
        const open = () => { setActiveTab('pro'); window.scrollTo({ top: 0 }); };
        window.addEventListener(OPEN_PRO_EVENT, open);
        return () => window.removeEventListener(OPEN_PRO_EVENT, open);
    }, []);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const prevAvatarUrlRef = useRef(null);

    // Dark by default. Light only when the user switches to it (remembered in this browser)
    const [mode, setMode] = useState('dark');
    useEffect(() => {
        let saved = null;
        try { saved = localStorage.getItem('db-mode'); } catch { /* storage can be blocked */ }
        if (saved === 'light') setMode('light');
    }, []);
    useEffect(() => {
        document.documentElement.setAttribute('data-db-mode', mode);
        return () => document.documentElement.removeAttribute('data-db-mode');
    }, [mode]);
    // Laptop (fixed one-screen layout) or phone (full-screen sheets)
    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const on = () => setIsDesktop(mq.matches);
        on();
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);
    const [showQr, setShowQr] = useState(false);
    const toggleMode = () => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setMode(next);
        try { localStorage.setItem('db-mode', next); } catch { /* ignore */ }
    };

    // Get avatar seed state for editing
    const [avatarSeed, setAvatarSeed] = useState('');

    // Effect for updating avatar URL reference
    useEffect(() => {
        if (activeTab !== 'avatar' && userData?.avatar_url) {
            // initialize saved avatar reference if not set
            if (!prevAvatarUrlRef.current) {
                prevAvatarUrlRef.current = userData.avatar_url;
            }
        }
    }, [activeTab, userData?.avatar_url]);

    // Function to build DiceBear URL (helper for mock functions)
    const buildAvatarUrl = (seed, style = 'adventurer') => `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed || 'glitch')}`;

    // Handler for updating seed from the editor input
    const handleUpdateSeed = async (newSeed) => {
        if (!newSeed || typeof newSeed !== 'string') return;
        const trimmed = newSeed.trim();
        const newUrl = buildAvatarUrl(trimmed, 'adventurer'); // Assuming default style for quick update
        try {
            // Update backend and local state — do NOT modify nickname/alias here per requirements
            await updateProfile(user?.id || userData?.id, { avatar_url: newUrl });
            setUserData(prev => ({ ...(prev || {}), avatar_url: newUrl }));
            prevAvatarUrlRef.current = newUrl;
            toast.success('Avatar seed updated');
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') console.error('Failed to update seed', err);
            toast.error('Failed to update avatar seed');
        }
    };


    // Reset any body styles left behind by login/signup pages
    useEffect(() => {
        document.body.style.display = '';
        document.body.style.overflow = '';
        document.body.style.overflowX = '';
        document.body.style.overflowY = '';
        document.body.style.alignItems = '';
        document.body.style.justifyContent = '';
        document.body.style.height = '';
        document.body.style.maxHeight = '';
    }, []);

    // Effect for fetching initial user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Try a few times to let the auth client settle (fixes race where auth state isn't ready immediately after sign-in)
                let currentUser = null;
                const maxAttempts = 4;
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    currentUser = await getCurrentUser();
                    if (currentUser) break;
                    // small delay between attempts
                    await new Promise(r => setTimeout(r, 250));
                }

                if (currentUser) {
                    setUser(currentUser);
                    try {
                        const profile = await getUserProfile(currentUser.id);
                        setUserData(profile);
                        prevAvatarUrlRef.current = profile.avatar_url;
                        if (profile && profile.onboarding_complete === false) {
                            setShowOnboarding(true);
                        } else {
                            try {
                                const attendeeLink = pendingAttendeeLink();
                                if (attendeeLink) { router.replace(attendeeLink); return; }
                                if (localStorage.getItem(RMC_PENDING_KEY)) { router.replace('/rmc-roles'); return; }
                                if (localStorage.getItem(IEW_PENDING_KEY)) { router.replace('/iew-roles'); return; }
                            } catch { /* storage can be blocked */ }
                        }
                    } catch {
                        // No profile yet (Google OAuth user) — redirect to callback to create one
                        router.replace('/auth/callback');
                        return;
                    }
                } else {
                    // If still unauthenticated after retries, send to login (and remember a Pro link, so Pro opens after login)
                    try { if (new URLSearchParams(window.location.search).get('tab') === 'pro') sessionStorage.setItem(PRO_INTENT_KEY, '1'); } catch { /* ignore */ }
                    router.replace('/login');
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') console.error('Error fetching user data:', error);
                toast.error("Could not load your profile. Taking you back...");
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [router]);

    // Arriving from a "Go Pro" link (even via the login page) lands on the Pro tab
    const proIntentDone = useRef(false);
    useEffect(() => {
        if (loading || !userData || proIntentDone.current || IS_RMC) return;
        proIntentDone.current = true;
        let wants = new URLSearchParams(window.location.search).get('tab') === 'pro';
        try {
            if (sessionStorage.getItem(PRO_INTENT_KEY)) wants = true;
            sessionStorage.removeItem(PRO_INTENT_KEY);
        } catch { /* storage can be blocked */ }
        if (wants) setActiveTab('pro');
    }, [loading, userData]);

    const handleSignOut = async () => {
        // Always leave, even if the sign-out request fails. A full page load also clears any cached dashboard screens.
        try { await signOutUser(); } catch { /* fall through and leave anyway */ }
        window.location.assign('/login');
    };
    
    if (loading || !userData) {
        return (
            <div className="db-root min-h-screen flex items-center justify-center p-4">
                <style>{DASH_CSS}</style>
                <SkeletonCard />
            </div>
        );
    }

    const shareableLink = buildProfileUrl(userData.nickname);
    const first_name = userData.full_name?.split(' ')[0] || 'User';
    const currentDesign = userData.design || { colors: {} };
    const avatarFallbackText = userData.full_name?.charAt(0) || 'U';

    // A Pro theme picked by a free account is only a preview: blurred under an upgrade panel, never saved or shown publicly
    const lockedKey = !IS_RMC && CARD_THEMES[currentDesign.theme]?.free === false && userData.is_pro !== true ? currentDesign.theme : null;
    const useFreeTheme = () => setUserData((prev) => ({
        ...prev,
        design: { ...(prev.design || {}), theme: 'cyberpunk', colors: { ...(prev.design?.colors || {}), ...CARD_THEMES.cyberpunk.colors } },
    }));

    // The live card. On a laptop it sits on the left; on a phone it opens as its own screen.
    const cardBlock = (
        <div className="flex flex-col items-center w-full">
            {IS_RMC ? (
                <RmcThemeCard profile={userData} details={getRmcDetails(userData)} links={userData.socialLinks || []} profileUrl={shareableLink} isOwner />
            ) : userData.is_pro && PRO_FULL_THEMES.includes(userData?.design?.theme) ? (
                <div style={{
                    position: 'relative', width: '100%', borderRadius: 20,
                    overflow: 'hidden', border: '1px solid var(--db-line)',
                    height: isDesktop ? 'min(calc(100dvh - 56px - 2rem), 680px)' : 'min(72vh, 620px)', minHeight: 420,
                }}>
                    <ProThemeRenderer
                        themeKey={userData.design.theme}
                        userData={userData}
                        currentDesign={currentDesign}
                        isOwner={true}
                        themeSettings={userData?.theme_settings || {}}
                    />
                </div>
            ) : (
                <div style={{ position: 'relative', width: '100%' }}>
                    <div style={lockedKey ? { filter: 'blur(7px)', pointerEvents: 'none' } : undefined} inert={lockedKey ? true : undefined}>
                        <RoleCard
                            userData={userData}
                            currentDesign={currentDesign}
                            avatarFallbackText={avatarFallbackText}
                            isOwner={true}
                            previewLocked={!!lockedKey}
                        />
                    </div>
                    {lockedKey && <ProThemeLockOverlay themeKey={lockedKey} onGetPro={openProTab} onFree={useFreeTheme} />}
                </div>
            )}
        </div>
    );

    const linkCount = Array.isArray(userData.socialLinks) ? userData.socialLinks.length : 0;
    const themeName = (currentDesign.theme || 'cyberpunk').replace(/^./, (c) => c.toUpperCase());
    const sections = [
        ...(isDesktop ? [] : [{
            id: 'card', icon: <QrCode size={20} />, label: 'My card',
            summary: 'See your card and share it',
            content: cardBlock,
        }]),
        {
            id: 'profile', icon: <Edit3 size={20} />, label: 'Basics',
            summary: `${userData.full_name || 'Add your name'} · @${userData.nickname}`,
            content: (
                <div className="space-y-10">
                    <ProfileEditor user={user} userData={userData} setUserData={setUserData} />
                    {IS_RMC
                        ? <RmcDetailsEditor user={user} userData={userData} setUserData={setUserData} />
                        : <>
                            <CardDetailsEditor user={user} userData={userData} setUserData={setUserData} {...(roleOf(userData.design) || wsRoleOf(userData.design) ? { heading: 'Your MiniYou card details', note: 'These show on your regular MiniYou card. Your event card has its own details further down.' } : {})} />
                            {wsRoleOf(userData.design) && (
                                <div className="rounded-2xl p-5" style={{ border: '2px solid #EF7F5255', background: 'rgba(239,127,82,0.05)' }}>
                                    <IewDetailsEditor user={user} userData={userData} setUserData={setUserData} />
                                </div>
                            )}
                            {roleOf(userData.design) && (
                                <div className="rounded-2xl p-5" style={{ border: '2px solid #1AD1FF55', background: 'rgba(26,209,255,0.05)' }}>
                                    <RmcDetailsEditor user={user} userData={userData} setUserData={setUserData} showRole={false} />
                                </div>
                            )}
                        </>}
                </div>
            ),
        },
        {
            id: 'avatar', icon: <Camera size={20} />, label: 'Photo and avatar',
            summary: 'Upload a photo or make an avatar',
            content: <AvatarEditor user={user} userData={userData} setUserData={setUserData} prevAvatarUrlRef={prevAvatarUrlRef} />,
        },
        {
            id: 'links', icon: <Link2 size={20} />, label: 'Links',
            summary: linkCount === 0 ? 'Add your first link' : `${linkCount} link${linkCount === 1 ? '' : 's'} added`,
            content: <LinksEditor user={user} userData={userData} setUserData={setUserData} />,
        },
        ...(IS_RMC ? [] : [{
            id: 'design', icon: <Palette size={20} />, label: 'Look',
            summary: `${themeName} design`,
            content: <DesignEditor user={user} userData={userData} setUserData={setUserData} />,
        }]),
        {
            id: 'share', icon: <Share2 size={20} />, label: 'Share and QR',
            summary: profileLabel(userData.nickname),
            content: (
                <div className="space-y-10">
                    <SharePanel link={shareableLink} userData={userData} currentDesign={currentDesign} />
                    <SaveMiniMeEditor user={user} userData={userData} setUserData={setUserData} />
                </div>
            ),
        },
        ...(IS_RMC ? [] : [{
            id: 'pro', icon: <Crown size={20} />, label: 'MiniYou Pro',
            summary: userData.is_pro ? 'Your plan and billing' : 'Unlock every design',
            content: <ProTab user={user} userData={userData} setUserData={setUserData} />,
        }]),
    ];
    const openSection = sections.find((sec) => sec.id === activeTab) || null;

    const isPro = userData?.is_pro === true;

    return (
        <MotionConfig reducedMotion="user">
        <div className="db-root min-h-screen overflow-x-hidden" style={{ position: 'relative', isolation: 'isolate' }}>
            <style>{DASH_CSS}</style>
            <Toaster position="bottom-center" toastOptions={{
                style: { background: THEME.SURFACE_DARK, color: THEME.TEXT_LIGHT, boxShadow: '0 16px 40px -16px rgba(0,0,0,0.5)', border: '1px solid var(--db-line)' },
                success: { iconTheme: { primary: THEME.PRIMARY, secondary: THEME.BG_DARK } }
            }} />

            {/* Faint grid, like the landing page ground */}
            <div aria-hidden="true" style={{
                position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(var(--db-grid) 1px, transparent 1px), linear-gradient(90deg, var(--db-grid) 1px, transparent 1px)',
                backgroundSize: '56px 56px',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 55% at 50% 30%, #000 20%, transparent 78%)',
                maskImage: 'radial-gradient(ellipse 80% 55% at 50% 30%, #000 20%, transparent 78%)',
            }} />

            {/* Pro Premium Background Effects */}
            {isPro && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {/* Gradient orbs */}
                    <div style={{
                        position: 'absolute', top: '-10%', left: '-5%',
                        width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
                        borderRadius: '50%', opacity: 0.07,
                        background: 'radial-gradient(circle, #4C8DFF, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'pro-dash-orb1 20s ease-in-out infinite',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '-10%', right: '-5%',
                        width: '35vw', height: '35vw', maxWidth: 450, maxHeight: 450,
                        borderRadius: '50%', opacity: 0.06,
                        background: 'radial-gradient(circle, #1AD1FF, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'pro-dash-orb2 25s ease-in-out infinite',
                    }} />
                    <div style={{
                        position: 'absolute', top: '40%', left: '50%',
                        width: '30vw', height: '30vw', maxWidth: 400, maxHeight: 400,
                        borderRadius: '50%', opacity: 0.04,
                        background: 'radial-gradient(circle, #2A6BFF, transparent 70%)',
                        filter: 'blur(80px)', transform: 'translateX(-50%)',
                        animation: 'pro-dash-orb3 18s ease-in-out infinite',
                    }} />
                    {/* Grid overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(26,209,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(26,209,255,0.015) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />
                    {/* Floating particles */}
                    {[...Array(8)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: 2 + (i % 3),
                            height: 2 + (i % 3),
                            borderRadius: '50%',
                            background: i % 2 === 0 ? '#1AD1FF' : '#4C8DFF',
                            opacity: 0.15,
                            left: `${(i * 12.5) % 100}%`,
                            top: `${(i * 17.3) % 100}%`,
                            animation: `pro-dash-particle ${4 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`,
                        }} />
                    ))}
                </div>
            )}

            {/* Global Styles (Glitch/Holographic effects) */}
            <style>{`
                @keyframes subtle-float-anim {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-subtle-float-card {
                    animation: subtle-float-anim 4s ease-in-out infinite;
                }
                @keyframes pulsing-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .pulsing-gradient-bg {
                    background-size: 200% 200%;
                    animation: pulsing-gradient 8s ease infinite;
                }
                .hexagonal-border {
                    clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%);
                }
                .square-border {
                    border-radius: 4px;
                }
                ${isPro ? `
                @keyframes pro-dash-orb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, 20px) scale(1.1); }
                }
                @keyframes pro-dash-orb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-20px, -30px) scale(1.05); }
                }
                @keyframes pro-dash-orb3 {
                    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.04; }
                    50% { transform: translateX(-45%) scale(1.15); opacity: 0.06; }
                }
                @keyframes pro-dash-particle {
                    0%, 100% { transform: translateY(0); opacity: 0.15; }
                    50% { transform: translateY(-12px); opacity: 0.3; }
                }
                ` : ''}
            `}</style>

            {/* Slim top bar */}
            <header className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ backgroundColor: al(THEME.SURFACE_DARK, 'D0'), borderColor: 'var(--db-line)' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex justify-between items-center">
                    <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: THEME.TEXT_LIGHT }}>Mini<span style={{ color: THEME.PRIMARY }}>You</span></h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {!userData.is_pro && !IS_RMC && (
                            <button
                                type="button"
                                onClick={openProTab}
                                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border transition hover:brightness-110"
                                style={{ borderColor: al(THEME.PRIMARY, '66'), color: THEME.PRIMARY }}
                            >
                                Go Pro
                            </button>
                        )}
                        <a
                            href={buildProfileUrl(userData.nickname)}
                            onClick={(e) => { e.preventDefault(); router.push(profilePath(userData.nickname)); }}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition hover:brightness-110"
                            style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_LIGHT }}
                        >
                            <Globe size={16} /> View profile
                        </a>
                        <InstallButton
                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border transition hover:brightness-110"
                            style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_LIGHT, background: al(THEME.TEXT_LIGHT, '0A') }}
                        />
                        <button
                            type="button"
                            onClick={toggleMode}
                            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border transition hover:brightness-110"
                            style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_LIGHT, background: al(THEME.TEXT_LIGHT, '0A') }}
                        >
                            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            aria-label="Log out"
                            title="Log out"
                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border transition hover:brightness-110"
                            style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_MUTED }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                {!IS_RMC && <ProEndNotice isPro={userData?.is_pro === true} />}
                {IS_RMC && (
                    <p className="mb-4 text-sm font-bold tracking-wide" style={{ color: '#DFFF38' }}>
                        {RMC_EVENT.short} {'· Community Edition · '}{RMC_EVENT.venue}
                    </p>
                )}

                <div className="db-shell grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">

                    {/* Left (laptop only): your live card, always in view */}
                    {isDesktop && <aside className="db-aside">{cardBlock}</aside>}

                    {/* Right: the list of sections, or the open section */}
                    <section className="db-panel min-w-0" aria-label="Edit your profile">
                        <AnimatePresence mode="wait" initial={false}>
                        {!openSection ? (
                            <motion.div
                                key="list"
                                className="space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.14, ease: 'easeOut' }}
                                onAnimationComplete={() => { listIntroRef.current = false; }}
                            >
                                <div className="px-1 pb-1">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: THEME.TEXT_LIGHT }}>
                                        {'Hi, '}{first_name}
                                    </h1>
                                    <p className="text-sm sm:text-base" style={{ color: THEME.TEXT_MUTED }}>{'Choose a section to edit.'}</p>
                                </div>

                                {!isDesktop && (
                                    <div className="grid grid-cols-2 gap-3 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowQr(true)}
                                            className="flex items-center justify-center gap-2 min-h-[52px] rounded-2xl font-extrabold text-base transition active:scale-[0.98]"
                                            style={{ backgroundColor: THEME.PRIMARY, color: 'var(--db-on-primary)', boxShadow: `0 12px 30px -12px ${al(THEME.PRIMARY, '99')}` }}
                                        >
                                            <QrCode size={20} /> Show my QR
                                        </button>
                                        <a
                                            href={buildProfileUrl(userData.nickname)}
                                            onClick={(e) => { e.preventDefault(); router.push(profilePath(userData.nickname)); }}
                                            className="flex items-center justify-center gap-2 min-h-[52px] rounded-2xl font-bold text-base border transition active:scale-[0.98]"
                                            style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_LIGHT, backgroundColor: THEME.SURFACE_DARK }}
                                        >
                                            <Globe size={18} /> View profile
                                        </a>
                                    </div>
                                )}

                                {sections.map((sec, i) => (
                                    <motion.button
                                        key={sec.id}
                                        type="button"
                                        onClick={() => openFromList(sec.id)}
                                        initial={listIntroRef.current ? { opacity: 0, y: 16 } : false}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: listIntroRef.current ? 0.05 * i : 0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.985 }}
                                        className="db-row w-full flex items-center gap-4 px-4 sm:px-5 py-2.5 text-left min-h-[60px] rounded-2xl border"
                                        style={{ backgroundColor: THEME.SURFACE_DARK, borderColor: 'var(--db-line)' }}
                                    >
                                        <span className="db-row-icon flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ backgroundColor: al(THEME.PRIMARY, '1F'), color: THEME.PRIMARY }}>
                                            {sec.icon}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block font-bold text-base" style={{ color: THEME.TEXT_LIGHT }}>{sec.label}</span>
                                            <span className="block text-sm truncate" style={{ color: THEME.TEXT_MUTED }}>{sec.summary}</span>
                                        </span>
                                        <ChevronDown size={20} className="db-row-chev shrink-0 -rotate-90" style={{ color: THEME.TEXT_MUTED }} />
                                    </motion.button>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={openSection.id}
                                className="db-detail"
                                role="region"
                                aria-label={openSection.label}
                                initial={{ opacity: 0, x: 22 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 22 }}
                                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="db-detail-head">
                                    <button
                                        type="button"
                                        onClick={closeSection}
                                        aria-label="Back to all sections"
                                        className="flex items-center justify-center w-11 h-11 rounded-full border transition hover:brightness-110"
                                        style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_LIGHT }}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <motion.span
                                        className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                                        style={{ backgroundColor: al(THEME.PRIMARY, '1F'), color: THEME.PRIMARY }}
                                        initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.08 }}
                                    >
                                        {openSection.icon}
                                    </motion.span>
                                    <h2 className="text-lg font-extrabold tracking-tight" style={{ color: THEME.TEXT_LIGHT }}>{openSection.label}</h2>
                                </div>
                                <div className="db-detail-body db-section">{openSection.content}</div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </section>
                </div>
            </main>

            {showQr && (
                <ShowMyCardOverlay userData={userData} currentDesign={currentDesign} onClose={() => setShowQr(false)} />
            )}

            {showOnboarding && (
                <Onboarding
                    profile={userData}
                    onComplete={async () => {
                        setShowOnboarding(false);
                        const updated = await getUserProfile(user.id);
                        setUserData(updated);
                        // Someone who came from the IEEE RMC link and has just finished setting up gets their role card next
                        try {
                            const attendeeLink = pendingAttendeeLink();
                            if (attendeeLink) router.replace(attendeeLink);
                            else if (localStorage.getItem(RMC_PENDING_KEY)) router.replace('/rmc-roles');
                            else if (localStorage.getItem(IEW_PENDING_KEY)) router.replace('/iew-roles');
                        } catch { /* storage can be blocked */ }
                    }}
                />
            )}
        </div>
        </MotionConfig>
    );
}

// --- Component: Mobile Menu Modal ---
const MobileMenuModal = memo(function MobileMenuModal({ isOpen, onClose, navItems, activeTab, setActiveTab }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/95 z-50 flex flex-col p-4 sm:p-6"
                    style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}
                >
                    <div className="flex justify-between items-center mb-8 sm:mb-10">
                        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight`} style={{ color: THEME.TEXT_LIGHT }}>Mini<span style={{ color: THEME.PRIMARY }}>You</span></h2>
                        <button onClick={onClose} className={`p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border hover:bg-white/10 transition`} style={{ borderColor: THEME.ACCENT, color: THEME.ACCENT }}>
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="flex flex-col space-y-4">
                        {navItems.map(item => (
                            <motion.button
                                key={item.value}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                onClick={() => { setActiveTab(item.value); onClose(); }}
                                className={`flex items-center w-full p-4 rounded-xl transition duration-200 font-bold border ${
                                    activeTab === item.value ? 'shadow-lg' : 'hover:bg-white/10'
                                }`}
                                style={{
                                    backgroundColor: activeTab === item.value ? `${al(THEME.PRIMARY, '33')}` : 'transparent',
                                    color: activeTab === item.value ? THEME.PRIMARY : THEME.TEXT_MUTED,
                                    borderColor: activeTab === item.value ? THEME.PRIMARY : 'transparent',
                                }}
                            >
                                {item.icon}
                                <span className="ml-4 text-lg">{item.label}</span>
                            </motion.button>
                        ))}
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
});


// CardLink imported from HolographicCard.jsx

// HolographicCard and LinkActionModal imported from HolographicCard.jsx


// --- Component: Add Link Modal (Advanced) ---
const AddLinkModal = memo(function AddLinkModal({ isOpen, onClose, onAddLink }) {
    const [step, setStep] = useState(1);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');

    // Open the app in a small window, read the link they copy, fill it in and close that window
    const finder = useLinkFinder({
        onLink: (platform, found) => {
            setUrl(found);
            toast.success('Link added');
        },
    });

    useEffect(() => {
        if (!isOpen) {
            finder.cancel();
            setTimeout(() => {
                setStep(1);
                setSelectedPlatform(null);
                setUrl('');
                setLabel('');
            }, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const linkCheck = url && selectedPlatform ? checkPlatformLink(url, selectedPlatform) : null;
    const canFind = Boolean(selectedPlatform && PLATFORM_DOMAINS[selectedPlatform]);

    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
        setLabel(socialIconMap[platform]?.name.toUpperCase() || 'VISIT LINK');
        setStep(2);
    };

    const handleAdd = () => {
        if (!url || !selectedPlatform) {
            toast.error("Please fill in the required fields.");
            return;
        }
        const result = checkPlatformLink(url, selectedPlatform);
        if (!result.ok) {
            toast.error(result.reason === 'empty' ? 'Please fill in the required fields.' : result.reason);
            return;
        }
        onAddLink({ platform: selectedPlatform, url: result.url, label });
        onClose();
    };

    const LinkCard = ({ platform, icon, name }) => (
        <button onClick={() => handlePlatformSelect(platform)}
            className={`flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-xl hover:bg-opacity-30 transition duration-200 border border-gray-700/50 text-white shadow-md shadow-black/50`}
            style={{ borderColor: `${al(THEME.SURFACE_DARK, '50')}`, backgroundColor: `${al(THEME.SURFACE_DARK, '80')}`, color: THEME.TEXT_LIGHT, '--hover-bg': `${al(THEME.ACCENT, '50')}` }}
        >
            <span className={`mb-2 text-2xl`} style={{ color: THEME.PRIMARY }}>{icon}</span>
            <span className="text-xs font-semibold">{name}</span>
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center p-4 pt-16"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-3xl shadow-2xl w-full max-w-lg p-4 sm:p-8 border`}
                        style={{ backgroundColor: THEME.SURFACE_DARK, borderColor: `${al(THEME.PRIMARY, '80')}` }}
                    >
                        <h3 className={`text-2xl font-bold mb-6`} style={{ color: THEME.PRIMARY }}>
                            {step === 1 ? 'Choose a link type' : `Add your ${socialIconMap[selectedPlatform]?.name || 'link'}`}
                        </h3>

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div key="step1" exit={{ opacity: 0, x: -20 }} className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-h-80 overflow-y-auto pr-2">
                                    {Object.entries(socialIconMap)
                                        .map(([platform, { icon, name }]) => (
                                            <LinkCard key={platform} platform={platform} icon={icon} name={name} />
                                        ))}
                                </motion.div>
                            ) : (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <button onClick={() => setStep(1)} className={`text-sm hover:text-white flex items-center`} style={{ color: THEME.TEXT_MUTED }}>
                                        <ChevronDown size={16} className="rotate-90 mr-1" style={{ color: THEME.PRIMARY }}/>
                                        {'Change link type'}
                                    </button>
                                    
                                    {canFind && (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => finder.open(selectedPlatform)}
                                                    className="flex-1 min-w-[180px] px-4 py-3 rounded-full font-bold text-sm border"
                                                    style={{ borderColor: al(THEME.PRIMARY, '66'), color: THEME.PRIMARY, backgroundColor: al(THEME.PRIMARY, '14') }}
                                                >
                                                    {finder.waitingFor === selectedPlatform ? 'Reopen' : 'Find my'} {socialIconMap[selectedPlatform]?.name} link ↗
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => finder.paste(selectedPlatform)}
                                                    className="px-5 py-3 rounded-full font-bold text-sm border"
                                                    style={{ borderColor: 'var(--db-line)', color: THEME.TEXT_LIGHT }}
                                                >
                                                    Paste
                                                </button>
                                            </div>
                                            {finder.waitingFor === selectedPlatform && finder.note && (
                                                <p className="text-xs" style={{ color: THEME.TEXT_MUTED }}>{finder.note}</p>
                                            )}
                                        </div>
                                    )}

                                    <InputWithIcon icon={socialIconMap[selectedPlatform]?.icon || socialIconMap.custom.icon} label="LINK URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={`https://...`} />
                                    {linkCheck && (
                                        <p aria-live="polite" className="text-xs font-bold -mt-3" style={{ color: linkCheck.ok ? '#34D399' : '#F87171' }}>
                                            {linkCheck.ok ? '✓ Link looks good. It will be saved to your card.' : linkCheck.reason}
                                        </p>
                                    )}

                                    <InputWithIcon icon={<Lightbulb size={20} />} label="Button text" type="text" value={label} onChange={(e) => setLabel(e.target.value.toUpperCase())} placeholder={`e.g. Visit my portfolio`} />

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button onClick={onClose} className="px-5 py-2 text-sm font-semibold rounded-full bg-white/10 text-gray-200 hover:bg-white/15">{'Cancel'}</button>
                                        <button onClick={handleAdd} className={`px-5 py-2 text-sm font-extrabold text-black rounded-full hover:bg-[#1AD1FF]/80`} style={{ backgroundColor: THEME.PRIMARY }}>{'Add link'}</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});


// --- Editor: Profile ---
const ProfileEditor = memo(function ProfileEditor({ user, userData, setUserData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [nicknameStatus, setNicknameStatus] = useState(null); // 'available' | 'taken' | 'invalid' | 'checking' | null
    const [originalNickname] = useState(userData.nickname);
    const nicknameTimerRef = useRef(null);

    // Get the local file preview URL if available
    const avatarPreviewUrl = useMemo(() => {
        return avatarFile ? URL.createObjectURL(avatarFile) : userData.avatar_url;
    }, [avatarFile, userData.avatar_url]);

    const handleDataChange = useCallback((field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    }, [setUserData]);

    const handleNicknameChange = useCallback((e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
        setUserData(prev => ({ ...prev, nickname: value }));

        if (nicknameTimerRef.current) clearTimeout(nicknameTimerRef.current);

        // Same as current — no change needed
        if (value === originalNickname) {
            setNicknameStatus(null);
            return;
        }

        if (!value || value.length < 3) {
            setNicknameStatus(value.length > 0 ? 'invalid' : null);
            return;
        }
        if (!/^[a-z0-9_]{3,20}$/.test(value)) {
            setNicknameStatus('invalid');
            return;
        }

        setNicknameStatus('checking');
        nicknameTimerRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`);
                const data = await res.json();
                setNicknameStatus(data.available ? 'available' : 'taken');
            } catch {
                setNicknameStatus(null);
            }
        }, 400);
    }, [originalNickname, setUserData]);

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // Immediately update userData.avatar_url for card preview
            setUserData(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
            toast(`// NEW FILE DETECTED: ${file.name}. PREVIEWING...`, { icon: '🖼️' });
        }
    };

    const handleSave = async () => {
        // Validate nickname if changed
        const nicknameChanged = userData.nickname !== originalNickname;
        if (nicknameChanged) {
            if (!userData.nickname || userData.nickname.length < 3 || !/^[a-z0-9_]{3,20}$/.test(userData.nickname)) {
                toast.error('Username must be 3-20 characters: letters, numbers and underscores.');
                return;
            }
            if (nicknameStatus === 'taken') {
                toast.error('That username is taken. Please choose another.');
                return;
            }
            if (nicknameStatus === 'checking') {
                toast.error('Checking if that username is free. Please wait.');
                return;
            }
        }

        setIsSaving(true);
        try {
            let finalAvatarUrl = userData.avatar_url;

            // If there's a file, upload it and get the final URL
            if (avatarFile) {
                finalAvatarUrl = await uploadAvatar(user.id, avatarFile);
                setAvatarFile(null); // Clear file state after successful upload
            }

            const updates = {
                full_name: userData.full_name,
                nickname: userData.nickname,
                bio: userData.bio,
                avatar_url: finalAvatarUrl,
            };

            const updatedProfile = await updateProfile(user.id, updates);
            setUserData(prev => ({ ...prev, ...updatedProfile }));
            toast.success('Profile saved.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') console.error("Profile save error:", error);
            toast.error('Could not save your profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div className="space-y-8">
            <h3 className={`text-2xl font-extrabold tracking-tight border-b pb-3`} style={{ color: THEME.PRIMARY, borderColor: `${al(THEME.ACCENT, '50')}` }}>{'Your details'}</h3>

            {/* Avatar Upload Preview */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border" style={{ borderColor: `${al(THEME.TEXT_MUTED, '50')}` }}>
                <div className="relative group">
                    <Image
                        src={avatarPreviewUrl || `https://placehold.co/96x96/0B0D14/1AD1FF?text=${userData.full_name?.charAt(0) || 'P'}`}
                        alt="Avatar Preview"
                        width={96}
                        height={96}
                        className={`w-24 h-24 rounded-full object-cover border-4 transition duration-300 group-hover:opacity-70 ring-2`}
                        style={{ borderColor: THEME.SURFACE_DARK }}
                        unoptimized
                    />
                    <label htmlFor="avatar-upload-profile" className="absolute inset-0 flex items-center justify-center w-full h-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition duration-300 rounded-full bg-black/50">
                        <Camera size={24} style={{ color: THEME.PRIMARY }}/>
                        <input id="avatar-upload-profile" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                </div>
                <div>
                    <p className="font-semibold text-white">{'Upload a photo'}</p>
                    <p className={`text-sm`} style={{ color: THEME.TEXT_MUTED }}>{'Photos are resized for you, up to 2 MB. Or make an avatar in the Avatar tab.'}</p>
                    {avatarFile && <p className="text-xs text-yellow-400 mt-1">Ready to upload: {avatarFile.name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputWithIcon icon={<User />} label="DISPLAY NAME" name="full_name" value={userData.full_name || ''} maxLength={30} onChange={(e) => handleDataChange('full_name', e.target.value)} placeholder="Your display name" />
                    <p className="text-xs text-right mt-1" style={{ color: THEME.TEXT_MUTED }}>{(userData.full_name || '').length}/30 CHARS</p>
                </div>
                <div>
                    <div className="relative">
                        <InputWithIcon icon={<AtSign />} label="Username" name="nickname" value={userData.nickname || ''} maxLength={20} onChange={handleNicknameChange} placeholder="your_username" />
                        {/* Status indicator */}
                        <div className="absolute right-3 top-[38px]">
                            {nicknameStatus === 'checking' && <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${al(THEME.TEXT_MUTED, '40')}`, borderTopColor: THEME.TEXT_MUTED }} />}
                            {nicknameStatus === 'available' && <CheckCircle size={16} style={{ color: '#34D399' }} />}
                            {nicknameStatus === 'taken' && <X size={16} style={{ color: '#F87171' }} />}
                            {nicknameStatus === 'invalid' && <X size={16} style={{ color: '#F87171' }} />}
                        </div>
                    </div>
                    <p className="text-xs mt-1" style={{ color: nicknameStatus === 'taken' ? '#F87171' : nicknameStatus === 'available' ? '#34D399' : THEME.TEXT_MUTED }}>
                        {nicknameStatus === 'taken' && 'That username is taken. Try another.'}
                        {nicknameStatus === 'invalid' && '3-20 characters: letters, numbers and underscores only'}
                        {nicknameStatus === 'available' && 'Username is available'}
                        {!nicknameStatus && (userData.nickname ? profileLabel(userData.nickname) : 'miniyou.co.in/...')}
                        {nicknameStatus === 'checking' && 'Checking...'}
                    </p>
                </div>
            </div>

            <div>
                <label className={`block text-sm font-medium mb-1`} style={{ color: THEME.TEXT_MUTED }}>{'Bio (up to 150 characters)'}</label>
                <textarea
                    name="bio"
                    value={userData.bio || ''}
                    onChange={(e) => handleDataChange('bio', e.target.value)}
                    className={`w-full p-4 border rounded-xl text-white focus:ring-1 transition-all duration-200 shadow-inner shadow-black/50`}
                    style={{ backgroundColor: THEME.SURFACE_DARK, borderColor: `${al(THEME.ACCENT, '50')}`, caretColor: THEME.PRIMARY, outline: 'none' }}
                    rows="3"
                    maxLength={150}
                    placeholder="Tell people a little about you"
                ></textarea>
                <p className={`text-xs text-right mt-1`} style={{ color: THEME.TEXT_MUTED }}>{userData.bio ? userData.bio.length : 0}/150 CHARS</p>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full px-6 py-3 text-black font-extrabold rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center`}
                style={{ background: saved ? '#34D399' : THEME.PRIMARY, boxShadow: `0 12px 30px -10px ${al(THEME.PRIMARY, '99')}`, transition: 'background 0.3s' }}
            >
                {isSaving ? (
                    <span className="flex items-center"><div className="w-5 h-5 border-2 border-t-2 border-black border-opacity-30 border-t-black rounded-full animate-spin mr-2"></div> {'Saving...'}</span>
                ) : saved ? (
                    <span className="flex items-center"><Check size={20} className="mr-2" /> {'✓ Saved!'}</span>
                ) : (
                    <span className="flex items-center"><Save size={20} className="mr-2" /> {'Save'}</span>
                )}
            </motion.button>
        </motion.div>
    );
});

// --- Editor: Avatar ---
const AvatarEditor = memo(function AvatarEditor({ user, userData, setUserData, prevAvatarUrlRef }) {
    // Seed is independent — initialized from nickname but user can type anything
    const [seed, setSeed] = useState(() => {
        // Try to extract existing seed from avatar URL, otherwise use nickname
        const url = userData.avatar_url || '';
        const match = url.match(/seed=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : (userData.nickname || 'procard');
    });
    const [style, setStyle] = useState(() => {
        // Try to extract existing style from avatar URL
        const url = userData.avatar_url || '';
        const match = url.match(/dicebear\.com\/8\.x\/([^/]+)\//);
        return match ? match[1] : 'adventurer';
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Holds the URL generated by DiceBear (for previewing before official save)
    const [dicebearPreviewUrl, setDicebearPreviewUrl] = useState(userData.avatar_url);

    // Calculate Dicebear URL live
    const dicebearUrl = useMemo(() => {
        return `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
    }, [seed, style]);

    // 2. LIVE AVATAR PREVIEW: Update the preview state and card preview immediately when seed or style changes
    useEffect(() => {
        setDicebearPreviewUrl(dicebearUrl);
        setUserData(prev => ({ ...prev, avatar_url: dicebearUrl }));
    }, [dicebearUrl, setUserData]);


    useEffect(() => {
        return () => {
             if (userData.avatar_url !== prevAvatarUrlRef.current) {
                setUserData(prev => ({ ...prev, avatar_url: prevAvatarUrlRef.current }));
             }
        };
    }, [setUserData, userData.avatar_url, prevAvatarUrlRef]);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = { avatar_url: dicebearPreviewUrl };
            const updatedProfile = await updateProfile(user.id, updates);
            setUserData(prev => ({ ...prev, ...updatedProfile }));
            prevAvatarUrlRef.current = dicebearPreviewUrl;
            toast.success('Avatar saved.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') console.error("Avatar save error:", error);
            toast.error('Could not save your avatar. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const avatarStyles = [
        { id: 'adventurer', name: 'Adventurer', icon: <User /> },
        { id: 'bottts', name: 'Bots', icon: <Bot /> },
        { id: 'pixel-art', name: 'Pixel Art', icon: <LayoutList /> },
        { id: 'initials', name: 'Initials', icon: <AtSign /> },
        { id: 'fun-emoji', name: 'Emoji', icon: <Smile /> }
    ];

    return (
        <motion.div className="space-y-8">
            <h3 className={`text-2xl font-extrabold tracking-tight border-b pb-3`} style={{ color: THEME.PRIMARY, borderColor: `${al(THEME.ACCENT, '50')}` }}>{'Make an avatar'}</h3>
            <p className={`text-sm`} style={{ color: THEME.TEXT_MUTED }}>{'Type any word to get a unique avatar, then pick a style you like.'}</p>

            <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-xl border bg-white/5 shadow-inner shadow-black/50" style={{ borderColor: `${al(THEME.ACCENT, '50')}` }}>
                {/* Preview */}
                <div className={`w-40 h-40 shrink-0 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden shadow-2xl ring-4`} style={{ ringColor: THEME.ACCENT, boxShadow: `0 14px 36px -12px ${THEME.ACCENT}` }}>
                    {dicebearPreviewUrl && dicebearPreviewUrl.trim() ? (
                        <Image src={dicebearPreviewUrl} alt="Generated Avatar Preview" width={160} height={160} className="w-full h-full" unoptimized />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/80 font-bold">{(userData?.full_name || 'U').charAt(0)}</div>
                    )}
                </div>
                {/* Controls */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1`} style={{ color: THEME.TEXT_MUTED }}>{'Any word'}</label>
                        <input 
                            type="text" 
                            value={seed} 
                            onChange={(e) => setSeed(e.target.value)} 
                            placeholder="Type any word"
                            className={`w-full p-3 border rounded-xl text-white focus:ring-1`}
                            style={{ backgroundColor: THEME.SURFACE_DARK, borderColor: `${al(THEME.ACCENT, '50')}`, caretColor: THEME.PRIMARY, outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1`} style={{ color: THEME.TEXT_MUTED }}>{'Style'}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {avatarStyles.map(s => (
                                <button key={s.id} onClick={() => setStyle(s.id)}
                                    className={`flex items-center justify-center gap-2 p-3 text-sm rounded-xl transition duration-200 font-semibold border-2 ${
                                        style === s.id ? 'shadow-md' : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                                    style={{
                                        backgroundColor: style === s.id ? `${al(THEME.ACCENT, '60')}` : '#374151',
                                        color: style === s.id ? THEME.ACCENT : THEME.TEXT_MUTED,
                                        borderColor: style === s.id ? THEME.ACCENT : '#555',
                                        boxShadow: style === s.id ? `0 2px 8px ${al(THEME.ACCENT, '50')}` : 'none',
                                    }}
                                >
                                    {s.icon} <span className="hidden sm:inline">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                    onClick={() => toast('Avatar preview is now LIVE. Change seed or style to update the card.', { icon: '✨' })}
                    className={`flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/15 transition duration-300`}
                >
                    {'PREVIEW RENDER (LIVE)'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isSaving}
                    className={`flex-1 px-6 py-3 text-black font-extrabold rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center`}
                    style={{ background: saved ? '#34D399' : THEME.ACCENT, boxShadow: `0 12px 30px -10px ${al(THEME.ACCENT, '99')}`, transition: 'background 0.3s' }}
                >
                    {isSaving ? 'Saving...' : saved ? '✓ Saved!' : 'Save'}
                </motion.button>
            </div>
        </motion.div>
    );
});

// --- Editor: Links ---
const LinksEditor = memo(function LinksEditor({ user, userData, setUserData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const handleAddLink = useCallback((newLink) => {
        if (!newLink || !newLink.url) return;
        // Normalize and validate URL based on platform
        const platform = newLink.platform || 'custom';
        const normalized = normalizeAndValidateUrl(newLink.url, platform);
        if (!normalized) {
            toast.error('That link is not allowed. Use a full https link to a real website or profile.');
            return;
        }

        // Sanitize newLink object and append
        const safeLink = {
            platform: platform,
            label: cleanLabel(newLink.label, socialIconMap[platform]?.name || 'Link'),
            url: normalized,
            clickAction: newLink.clickAction || 'direct',
            iconShape: newLink.iconShape || null,
        };

        const updatedLinks = [...(userData.socialLinks || []), safeLink];
        setUserData(prev => ({ ...prev, socialLinks: updatedLinks }));
        toast.success(`'${socialIconMap[platform]?.name || 'Link'}' added.`);
    }, [userData.socialLinks, setUserData]);

    const handleUpdateLink = useCallback((index, updates) => {
        // If updates include url, validate it first
        let safeUpdates = { ...updates };
        if ('label' in safeUpdates) safeUpdates.label = cleanLabel(safeUpdates.label, 'Link');
        if (updates.url) {
            const platform = (userData.socialLinks && userData.socialLinks[index] && userData.socialLinks[index].platform) || 'custom';
            const normalized = normalizeAndValidateUrl(updates.url, platform);
            if (!normalized) {
                toast.error('Invalid or disallowed URL. Update rejected.');
                return;
            }
            safeUpdates.url = normalized;
        }

        const updatedLinks = (userData.socialLinks || []).map((link, i) =>
            i === index ? { ...link, ...safeUpdates } : link
        );
        setUserData(prev => ({ ...prev, socialLinks: updatedLinks }));
    }, [userData.socialLinks, setUserData]);


    const [confirmDelete, setConfirmDelete] = useState(null);
    const handleRemoveLink = useCallback((index) => {
        const updatedLinks = (userData.socialLinks || []).filter((_, i) => i !== index);
        setUserData(prev => ({ ...prev, socialLinks: updatedLinks }));
        toast.success('Link removed.');
    }, [userData.socialLinks, setUserData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedProfile = await updateProfile(user.id, { socialLinks: userData.socialLinks });
            setUserData(prev => ({ ...prev, ...updatedProfile }));
            toast.success('Links saved.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            toast.error('Could not save your links. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <AddLinkModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} onAddLink={handleAddLink} />
            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div role="alertdialog" aria-modal="true" aria-label="Delete this link?" onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl p-6 text-center border" style={{ background: 'var(--db-surface)', borderColor: 'var(--db-line)', color: 'var(--db-ink)' }}>
                        <Trash2 size={26} className="mx-auto mb-3 text-red-400" aria-hidden="true" />
                        <p className="text-lg font-extrabold">{'Delete this link?'}</p>
                        <p className="text-sm mt-1.5 mb-5" style={{ color: 'var(--db-muted)' }}>
                            {`"${userData.socialLinks?.[confirmDelete]?.label || 'This link'}" comes off your card when you save. To get it back you would have to add it again.`}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" autoFocus onClick={() => setConfirmDelete(null)} className="px-4 py-2.5 rounded-full font-bold border" style={{ borderColor: 'var(--db-line)' }}>{'Keep it'}</button>
                            <button type="button" onClick={() => { handleRemoveLink(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2.5 rounded-full font-bold bg-red-500 text-white">{'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-6">
                                <div>
                    <div className="flex justify-between items-center mb-6 border-b pb-3" style={{ borderColor: `${al(THEME.ACCENT, '50')}` }}>
                        <h3 className={`text-2xl font-bold`} style={{ color: THEME.PRIMARY }}>{'Your links'}</h3>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsLinkModalOpen(true)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 text-black text-sm font-extrabold rounded-full hover:bg-[#4C8DFF]/80 transition shadow-md`}
                            style={{ backgroundColor: THEME.ACCENT, boxShadow: `0 10px 24px -10px ${al(THEME.ACCENT, '99')}` }}
                        >
                            <PlusCircle size={18} /> {'Add link'}
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {Array.isArray(userData.socialLinks) && userData.socialLinks.length > 0 ? (
                                userData.socialLinks.map((link, index) => (
                                    <motion.div layout key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-3 p-3 bg-white/5 border rounded-xl transition duration-200"
                                        style={{ borderColor: `${al(THEME.ACCENT, '30')}` }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`p-2 rounded-full shrink-0`} style={{ color: THEME.PRIMARY }}>
                                                {socialIconMap[link.platform]?.icon || socialIconMap.custom.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-white truncate">{link.label || socialIconMap[link.platform]?.name || 'Custom Link'}</p>
                                                <p className="font-mono text-xs text-gray-500 truncate">{link.url}</p>
                                            </div>
                                        </div>

                                        <button onClick={() => setConfirmDelete(index)} aria-label={`Delete ${link.label || 'link'}`}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-lg transition shrink-0"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <p className={`text-center py-6 italic`} style={{ color: THEME.TEXT_MUTED }}>{'No links yet. Tap Add link to start.'}</p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-6 py-3 text-black font-extrabold rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center"
                    style={{ background: saved ? '#34D399' : THEME.ACCENT, boxShadow: `0 12px 30px -10px ${al(THEME.ACCENT, '99')}`, transition: 'background 0.3s' }}
                >
                    {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save links'}
                </motion.button>
            </div>
        </>
    );
});

// --- Editor: Design ---
const DesignEditor = memo(function DesignEditor({ user, userData, setUserData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const [wide, setWide] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => setWide(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    const lockedSelected = CARD_THEMES[userData?.design?.theme]?.free === false && userData?.is_pro !== true ? userData.design.theme : null;
    const goFree = () => {
        setSelectedThemeKey('cyberpunk');
        setUserData((prev) => ({ ...prev, design: { ...(prev.design || {}), theme: 'cyberpunk', colors: { ...(prev.design?.colors || {}), ...CARD_THEMES.cyberpunk.colors } } }));
    };
    const [selectedThemeKey, setSelectedThemeKey] = useState(userData?.design?.theme || 'cyberpunk');
    // Phone only: the theme being previewed full screen (nothing is changed until "Use")
    const [previewKey, setPreviewKey] = useState(null);
    const [applying, setApplying] = useState(false);
    // The preview gets its own history entry: the phone's back swipe closes the preview and leaves you on the looks list
    useEffect(() => {
        if (!previewKey) return undefined;
        try { window.history.pushState({ ...window.history.state, muPreview: true }, '', window.location.href); } catch { /* history can be blocked */ }
        const onPop = () => setPreviewKey(null);
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, [previewKey !== null]); // eslint-disable-line react-hooks/exhaustive-deps
    const closePreview = () => {
        if (window.history.state?.muPreview) window.history.back(); // the listener above then clears the preview
        else setPreviewKey(null);
    };
    const sheetKey = previewKey || (!wide ? lockedSelected : null);
    const sheetLocked = !!sheetKey && CARD_THEMES[sheetKey]?.free === false && userData?.is_pro !== true;
    const designFor = (key) => ({ ...(userData.design || {}), theme: key, colors: { ...(userData.design?.colors || {}), ...CARD_THEMES[key].colors } });
    const activeKey = wide ? selectedThemeKey : (userData?.design?.theme || 'cyberpunk');

    // "Use this look": pick the previewed theme and save it in one step
    const applyTheme = async (key) => {
        setApplying(true);
        try {
            const updated = await updateProfile(user.id, { design: designFor(key) });
            setUserData((prev) => ({ ...prev, ...updated }));
            setSelectedThemeKey(key);
            closePreview();
            toast.success(`${CARD_THEMES[key].name} is now your card.`);
        } catch {
            toast.error('Could not save your design. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    const handleDesignChange = (field, value) => {
        if (field === 'iconShape') {
             const updatedLinks = (userData.socialLinks || []).map(link => {
                return { ...link, iconShape: value };
            });
            
            setUserData(prev => ({ 
                ...prev, 
                design: { ...(prev.design || { colors: {} }), [field]: value },
                socialLinks: updatedLinks,
            }));
            return;
        }

        setUserData(prev => ({ ...prev, design: { ...(prev.design || { colors: {} }), [field]: value } }));
    };


    const handleSave = async () => {
        if (lockedSelected) { toast('That theme needs Pro. Pick a free theme to save.', { icon: '🔒' }); return; }
        setIsSaving(true);
        const updates = {
            design: userData.design,
        };
        await toast.promise(
            updateProfile(user.id, updates),
            {
                loading: 'Saving your design...',
                success: (updatedProfile) => {
                    setUserData(prev => ({ ...prev, ...updatedProfile }));
                    return 'Design saved.';
                },
                error: 'Could not save your design. Please try again.',
            }
        );
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <>
            <motion.div className="space-y-10">

                {sheetKey && !wide && (
                    <ThemePreviewSheet
                        themeKey={sheetKey}
                        locked={sheetLocked}
                        userData={userData}
                        design={designFor(sheetKey)}
                        busy={applying}
                        onGetPro={openProTab}
                        onFree={() => (previewKey ? closePreview() : goFree())}
                        onUse={() => applyTheme(sheetKey)}
                    />
                )}

                {/* Theme Picker Section */}
                <div>
                    <h3 className="text-2xl font-extrabold tracking-tight border-b pb-3 mb-6" style={{ color: THEME.PRIMARY, borderColor: `${al(THEME.ACCENT, '50')}` }}>{'Choose your profile design'}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {roleOf(userData.design) && (() => {
                            const rmcSelected = activeKey === RMC_THEME_KEY;
                            const pickRmc = async () => {
                                const design = { ...(userData.design || {}), theme: RMC_THEME_KEY };
                                if (wide) {
                                    setSelectedThemeKey(RMC_THEME_KEY);
                                    setUserData(prev => ({ ...prev, design }));
                                    return;
                                }
                                setApplying(true);
                                try {
                                    const updated = await updateProfile(user.id, { design });
                                    setUserData((prev) => ({ ...prev, ...updated }));
                                    setSelectedThemeKey(RMC_THEME_KEY);
                                    toast.success('RMC 2026 is now your card.');
                                } catch {
                                    toast.error('Could not save your design. Please try again.');
                                } finally {
                                    setApplying(false);
                                }
                            };
                            return (
                                <button
                                    key={RMC_THEME_KEY}
                                    onClick={pickRmc}
                                    className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-semibold"
                                    style={{
                                        backgroundColor: rmcSelected ? `${al(THEME.PRIMARY, '20')}` : 'var(--db-surface)',
                                        borderColor: rmcSelected ? THEME.PRIMARY : 'var(--db-line)',
                                        color: rmcSelected ? THEME.PRIMARY : THEME.TEXT_MUTED,
                                        boxShadow: rmcSelected ? `0 8px 22px -10px ${al(THEME.PRIMARY, '88')}` : 'none',
                                    }}
                                >
                                    <ThemeIcon themeKey={RMC_THEME_KEY} colors={{ gradientStart: '#F4B860', gradientEnd: '#2DD4A8' }} />
                                    <span className="text-xs">{'RMC 2026'}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: THEME.ACCENT }}>{roleLabel(roleOf(userData.design))}</span>
                                </button>
                            );
                        })()}
                        {wsRoleOf(userData.design) && (() => {
                            const wsSelected = activeKey === WS_THEME_KEY;
                            const pickWs = async () => {
                                const design = { ...(userData.design || {}), theme: WS_THEME_KEY };
                                if (wide) {
                                    setSelectedThemeKey(WS_THEME_KEY);
                                    setUserData(prev => ({ ...prev, design }));
                                    return;
                                }
                                setApplying(true);
                                try {
                                    const updated = await updateProfile(user.id, { design });
                                    setUserData((prev) => ({ ...prev, ...updated }));
                                    setSelectedThemeKey(WS_THEME_KEY);
                                    toast.success('Your workshop card is now your card.');
                                } catch {
                                    toast.error('Could not save your design. Please try again.');
                                } finally {
                                    setApplying(false);
                                }
                            };
                            return (
                                <button
                                    key={WS_THEME_KEY}
                                    onClick={pickWs}
                                    className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-semibold"
                                    style={{
                                        backgroundColor: wsSelected ? `${al(THEME.PRIMARY, '20')}` : 'var(--db-surface)',
                                        borderColor: wsSelected ? THEME.PRIMARY : 'var(--db-line)',
                                        color: wsSelected ? THEME.PRIMARY : THEME.TEXT_MUTED,
                                        boxShadow: wsSelected ? `0 8px 22px -10px ${al(THEME.PRIMARY, '88')}` : 'none',
                                    }}
                                >
                                    <ThemeIcon themeKey={WS_THEME_KEY} colors={{ gradientStart: '#EF7F52', gradientEnd: '#2DBE8A' }} />
                                    <span className="text-xs">{WS_EVENT_NAME}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: THEME.ACCENT }}>{wsRoleLabel(wsRoleOf(userData.design))}</span>
                                </button>
                            );
                        })()}
                        {Object.entries(CARD_THEMES).filter(([key, t]) => key !== SUIT_WOMEN && !t.rmcOnly).map(([shownKey, shownTheme]) => {
                            // Suit is one tile with a Men / Women switch; the card keeps two theme keys underneath
                            const isSuit = shownKey === SUIT_MEN;
                            const key = isSuit && activeKey === SUIT_WOMEN ? SUIT_WOMEN : shownKey;
                            const theme = isSuit ? { ...CARD_THEMES[key], name: 'Suit' } : shownTheme;
                            const isSelected = isSuit ? (activeKey === SUIT_MEN || activeKey === SUIT_WOMEN) : activeKey === key;
                            const locked = !theme.free && !userData.is_pro;
                            const pickTheme = (k) => {
                                if (!wide) { setPreviewKey(k); return; }
                                setSelectedThemeKey(k);
                                setUserData(prev => ({
                                    ...prev,
                                    design: {
                                        ...(prev.design || {}),
                                        theme: k,
                                        colors: { ...(prev.design?.colors || {}), ...CARD_THEMES[k].colors },
                                    }
                                }));
                            };
                            return (
                                <button
                                    key={shownKey}
                                    onClick={() => pickTheme(key)}
                                    className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-semibold"
                                    style={{
                                        backgroundColor: isSelected ? `${al(THEME.PRIMARY, '20')}` : 'var(--db-surface)',
                                        borderColor: isSelected ? THEME.PRIMARY : 'var(--db-line)',
                                        color: isSelected ? THEME.PRIMARY : THEME.TEXT_MUTED,
                                        boxShadow: isSelected ? `0 8px 22px -10px ${al(THEME.PRIMARY, '88')}` : 'none',
                                    }}
                                >
                                    {locked && (
                                        <span className="absolute top-2 right-2" style={{ color: THEME.ACCENT }}>
                                            <Lock size={14} />
                                        </span>
                                    )}
                                    <ThemeIcon themeKey={key} colors={theme.colors} />
                                    <span className="text-xs">{theme.name}</span>
                                    {isSuit && (
                                        <span role="group" aria-label="Suit style" className="mt-1 grid grid-cols-2 w-full rounded-full p-0.5" style={{ background: 'var(--db-line)' }}>
                                            {[[SUIT_MEN, 'Men'], [SUIT_WOMEN, 'Women']].map(([k, label]) => (
                                                <span
                                                    key={k}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={key === k}
                                                    onClick={(e) => { e.stopPropagation(); pickTheme(k); }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pickTheme(k); } }}
                                                    className="rounded-full py-1 text-[11px] font-bold text-center transition-colors"
                                                    style={{ background: key === k ? THEME.PRIMARY : 'transparent', color: key === k ? 'var(--db-on-primary)' : THEME.TEXT_MUTED }}
                                                >{label}</span>
                                            ))}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs" style={{ color: THEME.TEXT_MUTED }}>{wide ? 'Tap a design to preview it on your card, then press Save. Designs with a lock need Pro.' : 'Tap a design to see your card in it. Designs with a lock need Pro.'}</p>
                </div>

                {/* Icon shapes (collapsed so the page stays short) */}
                <details className="group">
                    <summary className="cursor-pointer select-none text-lg font-semibold pb-3 list-none flex items-center justify-between" style={{ color: THEME.PRIMARY }}>{'More options: icon shape'}<ChevronDown size={18} className="transition group-open:rotate-180" /></summary>
                    <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-gray-700/50 shadow-inner shadow-black/50">
                        <label className={`block text-lg font-medium mb-2`} style={{ color: THEME.TEXT_LIGHT }}>{'Icon shape'}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {ICON_SHAPES.map(shape => {
                                const proLocked = shape.pro && userData.is_pro !== true;
                                return (
                                    <RadioPill
                                        key={shape.value} id={`shape-${shape.value}`} name="iconShape" value={shape.value}
                                        checked={(userData.design?.iconShape || 'rounded') === shape.value}
                                        onChange={(e) => {
                                            if (proLocked) { toast('That shape is part of MiniYou Pro.', { icon: '🔒' }); return; }
                                            handleDesignChange('iconShape', e.target.value);
                                        }}
                                        label={proLocked ? `${shape.label} · Pro` : shape.label}
                                        icon={<span aria-hidden="true" style={{ display: 'inline-block', width: 18, height: 18, background: 'currentColor', opacity: proLocked ? 0.55 : 1, ...shape.swatch }} />}
                                    />
                                );
                            })}
                        </div>
                        {userData.is_pro !== true && <p className="text-xs" style={{ color: THEME.TEXT_MUTED }}>{'Pro shapes show on your card once you have MiniYou Pro.'}</p>}
                    </div>
                </details>

                {/* Save Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full mt-8 px-6 py-3 text-black font-extrabold rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center`}
                    style={{ background: saved ? '#34D399' : THEME.ACCENT, boxShadow: `0 12px 30px -10px ${al(THEME.ACCENT, '99')}`, transition: 'background 0.3s' }}
                >
                    {isSaving ? (
                        <span className="flex items-center"><div className="w-5 h-5 border-2 border-t-2 border-black border-opacity-30 border-t-black rounded-full animate-spin mr-2"></div> {'Saving...'}</span>
                    ) : saved ? (
                        <span className="flex items-center"><Check size={20} className="mr-2" /> {'✓ Saved!'}</span>
                    ) : (
                        <span className="flex items-center"><Check size={20} className="mr-2" /> {'Save'}</span>
                    )}
                </motion.button>
            </motion.div>
        </>
    );
});

// --- Overlay: Show My Card (portal-based full-screen modal) ---
const ShowMyCardOverlay = memo(function ShowMyCardOverlay({ userData, currentDesign, onClose }) {
    const [mounted, setMounted] = useState(false);
    const nickname = userData?.nickname || '';
    const profileUrl = buildProfileUrl(nickname);

    // Mount guard — portal needs document.body (client only)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Escape key + body scroll lock
    useEffect(() => {
        if (!mounted) return;
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [mounted, onClose]);

    if (!mounted) return null;

    const overlay = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                backgroundColor: THEME.BG_DARK,
                backgroundImage: 'repeating-linear-gradient(to bottom, var(--db-grid) 0px, var(--db-grid) 1px, transparent 1px, transparent 2px)',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: '16px',
                    right: '16px',
                    padding: '10px',
                    color: 'var(--db-ink)',
                    background: 'var(--db-line)',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    zIndex: 10000,
                    lineHeight: 0,
                }}
                aria-label="Close overlay"
            >
                <X size={28} />
            </button>

            {/* Scrollable content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100%',
                padding: '72px 16px 48px',
                gap: '24px',
            }}>
                {/* QR + caption */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingTop: '16px' }}>
                    <FreshQrPanel
                        kind="profile"
                        fallbackUrl={profileUrl}
                        colors={[THEME.ACCENT, THEME.PRIMARY]}
                        name={nickname}
                        textColor={THEME.TEXT_LIGHT}
                        mutedColor={THEME.TEXT_MUTED}
                    />
                    <p style={{ fontFamily: 'inherit', fontSize: '14px', color: THEME.TEXT_LIGHT, margin: 0 }}>
                        Scan to visit my profile
                    </p>
                    <p style={{ fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold', color: THEME.PRIMARY, margin: 0 }}>
                        miniyou.co.in/{nickname}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    return createPortal(overlay, document.body);
});

// --- Panel: Share (with SVG Generation Feature) ---
const SharePanel = memo(function SharePanel({ link, userData, currentDesign }) {
    const [showCard, setShowCard] = useState(false);
    const [clickCounts, setClickCounts] = useState({});

    useEffect(() => {
        if (!userData?.nickname) return;
        supabase
            .from('link_clicks')
            .select('platform')
            .eq('nickname', userData.nickname)
            .then(({ data: clicks }) => {
                if (clicks) {
                    const counts = clicks.reduce((acc, row) => {
                        acc[row.platform] = (acc[row.platform] || 0) + 1;
                        return acc;
                    }, {});
                    setClickCounts(counts);
                }
            });
    }, [userData?.nickname]);
    
    // --- SVG GENERATION LOGIC ---
    const escapeSvgXml = (str) => String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const createSvgString = (data, design) => {
        const tc = (CARD_THEMES[design.theme] || CARD_THEMES.cyberpunk).colors;
        const bg = tc.background;
        const gradStart = tc.gradientStart;
        const gradEnd = tc.gradientEnd;
        const textCol = tc.text;
        const avatarFallbackText = data.full_name?.charAt(0) || 'U';

        // Simplified link representation for SVG
        const linksHtml = data.socialLinks.map((link, index) => {
            const displayLabel = link.label.substring(0, 20);
            return `
                <text x="15" y="${index * 15 + 15}" fill="${escapeSvgXml(THEME.PRIMARY)}" font-size="10" font-weight="bold">
                    // ${escapeSvgXml(displayLabel)}
                </text>
            `;
        }).join('');

        // Basic SVG structure - hardcoded dimensions for clean embed
        return `
<svg width="350" height="250" viewBox="0 0 350 250" xmlns="http://www.w3.org/2000/svg" style="font-family: monospace;">
    <defs>
        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${gradStart};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradEnd};stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="15" fill="${bg}" stroke="${THEME.PRIMARY}" stroke-width="2" />
    <rect width="100%" height="80" rx="0" fill="url(#neonGradient)" opacity="0.8" />

    <!-- Avatar Placeholder (Simple Text Circle for SVG stability) -->
    <circle cx="175" cy="80" r="40" fill="${THEME.SURFACE_DARK}" stroke="${THEME.PRIMARY}" stroke-width="3" />
    <text x="175" y="85" font-size="40" fill="${textCol}" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${escapeSvgXml(avatarFallbackText)}</text>
    
    <!-- Profile Text -->
    <text x="175" y="140" font-size="16" fill="${textCol}" text-anchor="middle" font-weight="bold">${escapeSvgXml(data.full_name)}</text>
    <text x="175" y="160" font-size="12" fill="${THEME.TEXT_MUTED}" text-anchor="middle">@${escapeSvgXml(data.nickname)}</text>
    

    <!-- Links (Simplified display in bottom-left corner) -->
    <g transform="translate(20, 195)">
        <text fill="${THEME.PRIMARY}" font-size="10" font-weight="bold">Links</text>
        <g transform="translate(0, 15)">
            ${linksHtml}
        </g>
    </g>
    
</svg>
        `;
    };

    const handleDownloadSVG = () => {
        const svgString = createSvgString(userData, currentDesign);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userData.nickname}_miniyou_card.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Download started.');
    };
    // --- END SVG GENERATION LOGIC ---

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`// ${type} COPIED TO CLIPBOARD //`);
        }).catch(() => {
            toast.error('Could not copy. Please try again.');
        });
    };

    const [linkQr, setLinkQr] = useState({ isOpen: false, link: null, index: 0 });
    const themeColors = (CARD_THEMES[currentDesign?.theme] || CARD_THEMES.cyberpunk).colors;
    const rmcTheme = IS_RMC ? getThemeForRole(getRmcDetails(userData).role) : null;
    const qrColors = rmcTheme ? [rmcTheme.qrDark, rmcTheme.palette[0]] : [themeColors.gradientStart, themeColors.gradientEnd];

    return (
        <motion.div className="space-y-8">
            <LinkActionModal state={linkQr} onClose={() => setLinkQr({ isOpen: false, link: null, index: 0 })} colors={qrColors} />
            <AnimatePresence>
                {showCard && (
                    <ShowMyCardOverlay
                        userData={userData}
                        currentDesign={currentDesign}
                        onClose={() => setShowCard(false)}
                    />
                )}
            </AnimatePresence>

            <h3 className={`text-2xl font-extrabold tracking-tight border-b pb-3`} style={{ color: THEME.PRIMARY, borderColor: `${al(THEME.ACCENT, '50')}` }}>{'Share your profile'}</h3>

            <div style={{ background: 'var(--db-surface)', border: '1px solid var(--db-line)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--db-primary)' }}>
                    {userData.view_count || 0}
                </div>
                <div style={{ fontSize: 13, color: 'var(--db-muted)', marginTop: 4 }}>
                    {userData.view_count > 0 ? '👁 unique visitors' : '👁 No visitors yet — share your card!'}
                </div>
            </div>

            <div style={{ background: 'var(--db-surface)', border: '1px solid var(--db-line)', borderRadius: 12, padding: '16px 20px', marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--db-primary)', marginBottom: 12 }}>
                    📊 Link Performance
                </div>
                {userData.socialLinks?.length > 0 ? (
                    userData.socialLinks.map((link) => (
                        <div key={link.platform} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--db-line)' }}>
                            <span style={{ color: 'var(--db-ink)', fontSize: 13 }}>{link.platform}</span>
                            <span style={{ color: 'var(--db-primary)', fontWeight: 600, fontSize: 13 }}>{clickCounts[link.platform] || 0} clicks</span>
                        </div>
                    ))
                ) : (
                    <div style={{ color: 'var(--db-muted)', fontSize: 13 }}>Add social links to track clicks</div>
                )}
                {userData.socialLinks?.length > 0 && Object.keys(clickCounts).length === 0 && (
                    <div style={{ color: 'var(--db-muted)', fontSize: 12, marginTop: 8, textAlign: 'center' }}>No clicks yet — share your card!</div>
                )}
            </div>

            {/* Show My Card button */}
            <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowCard(true)}
                className="w-full px-6 py-4 text-black font-extrabold rounded-full text-lg shadow-lg flex items-center justify-center gap-2 transition"
                style={{ background: `linear-gradient(90deg, ${THEME.ACCENT}, ${THEME.PRIMARY})`, boxShadow: `0 14px 34px -10px ${al(THEME.PRIMARY, '88')}` }}
            >
                📱 Show My Card
            </motion.button>

            {/* Share one link with a fresh QR (owner only) */}
            {userData.socialLinks?.length > 0 && (
                <div className="p-6 rounded-xl bg-white/5 border shadow-inner shadow-black/50" style={{ borderColor: `${al(THEME.TEXT_MUTED, '30')}` }}>
                    <h4 className="text-lg font-bold mb-1" style={{ color: THEME.PRIMARY }}>{'Share one link'}</h4>
                    <p className="text-xs mb-4" style={{ color: THEME.TEXT_MUTED }}>{'Show a short-lived QR for a single link, like your Instagram.'}</p>
                    <div className="space-y-2">
                        {userData.socialLinks.map((l, i) => (
                            <button key={i} onClick={() => setLinkQr({ isOpen: true, link: l, index: i })}
                                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left hover:bg-white/5 transition"
                                style={{ borderColor: `${al(THEME.PRIMARY, '30')}`, color: THEME.TEXT_LIGHT }}>
                                <span className="flex items-center gap-3 min-w-0">
                                    <span style={{ color: THEME.PRIMARY }}>{socialIconMap[l.platform]?.icon || socialIconMap.custom.icon}</span>
                                    <span className="truncate">{l.label || socialIconMap[l.platform]?.name || 'Link'}</span>
                                </span>
                                <span className="flex items-center gap-2 text-xs shrink-0" style={{ color: THEME.PRIMARY }}><QrCode size={16} /> {'Show QR'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Direct Link Section */}
            <div>
                <label className={`block text-sm font-medium mb-2`} style={{ color: THEME.TEXT_MUTED }}>{'Your profile link'}</label>
                <div className="relative flex items-center">
                    <input readOnly value={link}
                        className={`w-full p-3 pr-12 border rounded-xl text-white focus:ring-1 transition-all duration-200 shadow-inner shadow-black/50`}
                        style={{ backgroundColor: THEME.SURFACE_DARK, borderColor: `${al(THEME.ACCENT, '50')}`, caretColor: THEME.PRIMARY, outline: 'none' }}
                    />
                    <button onClick={() => handleCopy(link, 'LINK')}
                        className={`absolute right-0 top-0 h-full px-3 text-black rounded-r-xl hover:bg-[#1AD1FF]/80 transition`}
                        style={{ backgroundColor: THEME.PRIMARY }}
                    >
                        <Copy size={20} />
                    </button>
                </div>
            </div>

            {/* SVG DOWNLOAD CARD (NEW FEATURE) */}
            <div className="p-6 rounded-xl border-2 bg-white/5 shadow-inner shadow-black/50" style={{ borderColor: `${al(THEME.ACCENT, '50')}` }}>
                <h4 className={`text-xl font-bold mb-4 flex items-center`} style={{ color: THEME.ACCENT }}><Code size={24} className="mr-2" style={{ color: THEME.ACCENT }}/> {'Download your card'}</h4>
                <p className={`text-sm mb-4`} style={{ color: THEME.TEXT_MUTED }}>{'Save your card as an image file (SVG) that you can print or add to a website.'}</p>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadSVG}
                    className={`w-full px-6 py-3 flex items-center justify-center font-extrabold rounded-full text-black hover:bg-[#4C8DFF]/80 transition shadow-lg`}
                    style={{ backgroundColor: THEME.ACCENT, boxShadow: `0 12px 30px -10px ${al(THEME.ACCENT, '99')}` }}
                >
                    <Download size={20} className="mr-2" /> {'Download card (SVG)'}
                </motion.button>
            </div>

        </motion.div>
    );
});


// --- Utility Components ---
const InputWithIcon = memo(function InputWithIcon({ icon, label, ...props }) {
    return (
        <div>
            <label className={`block text-sm font-medium mb-1`} style={{ color: THEME.TEXT_MUTED }}>{label}</label>
            <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`} style={{ color: THEME.PRIMARY }}>{icon}</div>
                <input
                    {...props}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-white placeholder-gray-500 transition-all duration-200 shadow-inner shadow-black/50`}
                    style={{ 
                        backgroundColor: THEME.SURFACE_DARK, 
                        borderColor: `${al(THEME.ACCENT, '50')}`, 
                        caretColor: THEME.PRIMARY, 
                        outline: 'none',
                    }}
                />
            </div>
        </div>
    );
});


const RadioPill = memo(function RadioPill({ id, name, value, checked, onChange, label, icon }) {
    return (
        <div className="flex-1">
            <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
            <label htmlFor={id}
                className={`block cursor-pointer px-4 py-3 text-center rounded-xl text-sm font-semibold transition duration-200 border-2 flex items-center justify-center gap-2 ${
                    checked ? 'shadow-md' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                style={{
                    backgroundColor: checked ? `${al(THEME.PRIMARY, '33')}` : '#374151',
                    color: checked ? THEME.PRIMARY : THEME.TEXT_MUTED,
                    borderColor: checked ? THEME.PRIMARY : '#4B5563',
                    boxShadow: checked ? `0 8px 22px -10px ${al(THEME.PRIMARY, '88')}` : 'none',
                }}
            >
                {icon}
                {label}
            </label>
        </div>
    );
});

const LinkConfigDropdown = memo(function LinkConfigDropdown({ label, value, options, onChange }) {
    return (
        <div className="flex flex-col flex-1 min-w-[120px]">
            <label className={`block text-sm font-medium mb-1`} style={{ color: THEME.TEXT_MUTED }}>{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-2 border rounded-xl text-white appearance-none pr-8 shadow-inner shadow-black/50`}
                    style={{ backgroundColor: THEME.SURFACE_DARK, borderColor: `${al(THEME.ACCENT, '50')}`, outline: 'none' }}
                >
                    {options.map(opt => (
                        // Filtering out options that might not exist in ICON_SHAPES is handled implicitly by ensuring the default state uses valid options.
                        <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">{opt.label}</option>
                    ))}
                </select>
                <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`} style={{ color: THEME.ACCENT }} />
            </div>
        </div>
    );
});