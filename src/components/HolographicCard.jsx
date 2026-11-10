'use client';

import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import FreshQrPanel from './qr/FreshQrPanel';
import {
    Twitter, Linkedin, Github, Facebook, Instagram, Youtube,
    MessageSquare, Send, Code, Globe, Zap, Palette, Link, X,
    Sparkles, Heart, ArrowLeft, Briefcase, Mic, Building2, Check, Download, MapPin, QrCode, Share2, FileText, Link as LinkIcon
} from 'lucide-react';
import { trackLinkClick } from '@/lib/auth';
import CardArt from './card/CardArt';
import { CARD_CSS } from './card/cardStyles';
import { THEME_CSS, THEME_FONT_IMPORT, RING_FX } from './card/themeDesigns';
import { RMC_RING_FX, RMC_RING_FX_CSS } from './rmc/RmcRingFx';
import { getRmcDetails } from './rmc/rmcUtils';
import { ROLE_CARD_THEME, roleLabel } from '@/lib/rmcRole';
import { WS_EVENT_NAME, isWsTheme, wsRoleLabel, getWsDetails, wsHasSession } from '@/lib/workshopRole';
import { WS_RING_FX } from './workshop/WorkshopRingFx';
import { WS_EXTRA_RING_FX } from './workshop/WorkshopStylesArt';
import { WS_EXTRA_THEMES, WS_EXTRA_CSS } from './workshop/workshopThemes';
import { WS_CSS } from './workshop/workshopCss';
import { getCardStyle, inkOn, isLight, withAlpha } from './card/cardThemes';
import { buildVCard, getInitials, safeHref, PRO_ICON_SHAPES } from './card/cardUtils';
import { getCardDetails, FREE_TAGS, PRO_TAGS } from '@/lib/cardDetails';

// Shown faded, to the card's owner only, until they add their own
const SAMPLE_BIO = 'Designer and maker. I turn ideas into things people use. Say hello below.';
const SAMPLE_LINKS = [{ platform: 'instagram' }, { platform: 'linkedin' }];

// --- Theme Constants ---
export const THEME = {
    BG_DARK: '#00000A',
    SURFACE_DARK: '#0F0F2A',
    PRIMARY: '#00FFFF',
    ACCENT: '#FF00FF',
    TEXT_LIGHT: '#E0FFFF',
    TEXT_MUTED: '#66FFFF',
    DEFAULT_GRADIENT_START: '#FF00FF',
    DEFAULT_GRADIENT_END: '#00FFFF',
};

// --- Social Icon Map ---
export const socialIconMap = {
    twitter: { icon: <Twitter size={20} />, name: 'Twitter' },
    linkedin: { icon: <Linkedin size={20} />, name: 'LinkedIn' },
    github: { icon: <Github size={20} />, name: 'GitHub' },
    facebook: { icon: <Facebook size={20} />, name: 'Facebook' },
    instagram: { icon: <Instagram size={20} />, name: 'Instagram' },
    youtube: { icon: <Youtube size={20} />, name: 'YouTube' },
    twitch: { icon: <Zap size={20} />, name: 'Twitch' },
    discord: { icon: <MessageSquare size={20} />, name: 'Discord' },
    reddit: { icon: <MessageSquare size={20} />, name: 'Reddit' },
    medium: { icon: <Code size={20} />, name: 'Medium' },
    behance: { icon: <Palette size={20} />, name: 'Behance' },
    snapchat: { icon: <MessageSquare size={20} />, name: 'Snapchat' },
    telegram: { icon: <Send size={20} />, name: 'Telegram' },
    leetcode: { icon: <Code size={20} />, name: 'LeetCode' },
    hackerrank: { icon: <Code size={20} />, name: 'HackerRank' },
    patreon: { icon: <Heart size={20} />, name: 'Patreon' },
    whatsapp: { icon: <MessageSquare size={20} />, name: 'WhatsApp' },
    custom: { icon: <Globe size={20} />, name: 'Website' },
};

// --- Card Themes ---
export const CARD_THEMES = {
    cyberpunk: {
        name: 'Neon',
        free: true,
        colors: {
            background: '#07061A',
            text: '#E8F6FF',
            gradientStart: '#FF2E9A',
            gradientEnd: '#19E3FF',
        }
    },
    anime: {
        name: 'Sakura',
        free: true,
        colors: {
            background: '#2A0E1F',
            text: '#FFEFF4',
            gradientStart: '#FF7BA9',
            gradientEnd: '#FFC1D6',
        }
    },
    artist: {
        name: 'Studio',
        free: false,
        colors: {
            background: '#0D0D1A',
            text: '#E8E0FF',
            gradientStart: '#8B5CF6',
            gradientEnd: '#06B6D4',
        }
    },
    bookreader: {
        name: 'Storybook',
        free: false,
        colors: {
            background: '#F4E9D0',
            text: '#3B2A1A',
            gradientStart: '#7A4B22',
            gradientEnd: '#B8862B',
        }
    },
    marvel: {
        name: 'Armor',
        free: false,
        colors: {
            background: '#0B0A0F',
            text: '#FFEFD6',
            gradientStart: '#C8102E',
            gradientEnd: '#F0B323',
        }
    },
    pathways: {
        name: 'Sunrise',
        free: false,
        colors: {
            background: '#052A3A',
            text: '#FFFFFF',
            gradientStart: '#F4B860',
            gradientEnd: '#1B8DA6',
        }
    },
    professional: {
        name: 'Suit',
        free: true,
        colors: {
            background: '#161B26',
            text: '#F3F1EA',
            gradientStart: '#C9A24B',
            gradientEnd: '#8E2C3A',
        }
    },
    suitwoman: {
        name: 'Suit',
        free: true,
        colors: {
            background: '#1B0F19',
            text: '#FBF1EC',
            gradientStart: '#E0B4A4',
            gradientEnd: '#9C3D54',
        }
    },
    // The three themes below belong to the IEEE RMC 2026 role cards (organizer, mentor, attendee) and are never offered in the picker
    unity: {
        name: 'Unity', free: false, rmcOnly: true,
        colors: { background: '#042A30', text: '#FFFFFF', gradientStart: '#F4B860', gradientEnd: '#2DD4A8' }
    },
    balance: {
        name: 'Balance', free: false, rmcOnly: true,
        colors: { background: '#FBF8EA', text: '#0B3B3F', gradientStart: '#0B7A75', gradientEnd: '#12B5A8' }
    },
    empowerment: {
        name: 'Empowerment', free: false, rmcOnly: true,
        colors: { background: '#032B33', text: '#FFFFFF', gradientStart: '#D9F55A', gradientEnd: '#3BAE74' }
    },
    // The four themes below belong to the Innovation Workshop role cards (see lib/workshopRole.js) and are never offered in the picker
    ws_speaker: {
        name: 'Workshop Speaker', free: false, rmcOnly: true,
        colors: { background: '#063B3C', text: '#FFFFFF', gradientStart: '#C8E83A', gradientEnd: '#1FA58A' }
    },
    ws_organizer: {
        name: 'Workshop Organizer', free: false, rmcOnly: true,
        colors: { background: '#042326', text: '#FFFFFF', gradientStart: '#8DEBC2', gradientEnd: '#B6E02E' }
    },
    ws_panelist: {
        name: 'Workshop Panelist', free: false, rmcOnly: true,
        colors: { background: '#EAF7E4', text: '#0B4A4A', gradientStart: '#0E6B63', gradientEnd: '#8CC63F' }
    },
    ws_attendee: {
        name: 'Workshop Attendee', free: false, rmcOnly: true,
        colors: { background: '#0B6B62', text: '#FFFFFF', gradientStart: '#E2FF5C', gradientEnd: '#7BE0B5' }
    },
    ...WS_EXTRA_THEMES,
    community: {
        name: 'Community',
        free: true,
        colors: {
            background: '#12134A',
            text: '#F4EFFF',
            gradientStart: '#B39DFF',
            gradientEnd: '#F7B8A0',
        }
    }
};

// --- CardLink Component ---
export const CardLink = memo(function CardLink({ link, linkIndex = 0, gradientStart, setActionModalState, isOwner, userData }) {
    const platform = link.platform || 'custom';
    const icon = socialIconMap[platform]?.icon || <Link size={20} />;
    const color = gradientStart;
    const shape = link.iconShape || 'rounded';
    const [ripple, setRipple] = useState(false);

    let shapeClass = '';
    switch (shape) {
        case 'circle': shapeClass = 'rounded-full'; break;
        case 'rounded': shapeClass = 'hexagonal-border'; break;
        case 'square': shapeClass = 'square-border'; break;
        case 'diamond': shapeClass = 'diamond-border'; break;
        case 'octagon': shapeClass = 'octagon-border'; break;
        case 'shield': shapeClass = 'shield-border'; break;
        case 'squircle': shapeClass = 'squircle-border'; break;
        case 'leaf': shapeClass = 'leaf-border'; break;
        default: shapeClass = 'hexagonal-border';
    }

    const handleClick = () => {
        setRipple(true);
        setTimeout(() => setRipple(false), 400);
        if (!isOwner) {
            trackLinkClick(userData?.id, userData?.nickname, platform);
        }
        // Only the account owner can show a QR for a link; visitors always open it directly
        if (link.clickAction === 'qr_prompt' && isOwner) {
            setActionModalState({ isOpen: true, link, index: linkIndex });
        } else {
            const href = safeHref(link.url, platform);
            if (href) window.open(href, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            title={link.label}
            aria-label={link.label}
            whileHover={{ scale: 1.15, boxShadow: `0 0 25px ${color}`, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className={`shrink-0 transition-all duration-300 ${shapeClass}`}
            style={{
                color,
                backgroundColor: `${color}20`,
                boxShadow: `0 0 10px ${color}80, inset 0 0 5px ${color}50`,
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                width: 48,
                height: 48,
                display: 'grid',
                placeItems: 'center',
            }}
        >
            {icon}
            {ripple && (
                <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: '#00FFFF',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </motion.button>
    );
});

// --- LinkActionModal: owner-only pop-up with a short-lived QR for one link ---
export const LinkActionModal = memo(function LinkActionModal({ state, onClose, colors = [THEME.ACCENT, THEME.PRIMARY] }) {
    if (!state?.isOpen || !state?.link) return null;

    const handleDirectOpen = () => {
        const href = safeHref(state.link.url, state.link.platform);
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: -30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-2xl shadow-2xl w-full max-w-sm p-6 border text-center relative"
                    style={{ backgroundColor: THEME.SURFACE_DARK, boxShadow: '0 0 30px rgba(0,255,255,0.25)', borderColor: `${THEME.PRIMARY}80`, color: THEME.TEXT_LIGHT }}
                >
                    <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:text-white transition" style={{ color: THEME.TEXT_MUTED }} aria-label="Close">
                        <X size={20} />
                    </button>

                    <h3 className="text-xl font-bold mb-1" style={{ color: THEME.PRIMARY }}>Share this link</h3>
                    <p className="text-xs mb-4" style={{ color: THEME.TEXT_MUTED }}>{state.link.label}</p>

                    <FreshQrPanel
                        kind="link"
                        linkIndex={state.index}
                        fallbackUrl={safeHref(state.link.url, state.link.platform) || ''}
                        colors={colors}
                        name={state.link.label || 'link'}
                        textColor={THEME.TEXT_LIGHT}
                        mutedColor={THEME.TEXT_MUTED}
                    />

                    <button
                        onClick={handleDirectOpen}
                        className="mt-5 w-full py-3 font-bold rounded-xl flex items-center justify-center text-black"
                        style={{ backgroundColor: THEME.PRIMARY }}
                    >
                        <Link size={18} className="inline mr-2" /> Open link
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
});

// --- HolographicCard (default export) ---
// One shared structure for every theme. Colours come from the user's design; the theme only
// picks decoration (see card/cardThemes.js and card/CardArt.jsx).
const PROFILE_BASE_URL = 'https://www.miniyou.co.in';
// Name of the paid plan shown on the card (change it here)
const PRO_LABEL = 'MegaYou';

function particleStyle(i, kind) {
    const left = ((i * 37 + 11) % 92) + 2;
    const base = { '--pl': `${left}%`, '--dx': `${((i % 5) - 2) * 10}px`, '--pd': `${6 + (i % 5) * 1.6}s`, '--pdl': `${(i * 0.7) % 6}s` };
    if (kind === 'petal') return { ...base, '--pb': '96%', '--ps': `${7 + (i % 3) * 3}px`, '--pd': `${9 + (i % 4) * 2}s` };
    if (kind === 'firefly') return { ...base, '--pb': `${8 + ((i * 29) % 70)}%`, '--ps': `${3 + (i % 3)}px` };
    if (kind === 'mote') return { ...base, '--pb': `${6 + ((i * 23) % 60)}%`, '--ps': `${4 + (i % 4)}px` };
    return { ...base, '--pb': `${4 + ((i * 19) % 40)}%`, '--ps': `${2 + (i % 3)}px` };
}

const HolographicCard = memo(function HolographicCard({ userData, currentDesign, avatarFallbackText, isOwner, previewLocked = false, rmcRole = null }) {
    const [actionModalState, setActionModalState] = useState({ isOpen: false, link: null });
    const [gyroPermission, setGyroPermission] = useState('unknown');
    const [flipped, setFlipped] = useState(false);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState('');
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [bioOpen, setBioOpen] = useState(false);
    const tiltRef = useRef(null);
    const frontBtn = useRef(null);
    const backBtn = useRef(null);
    const mounted = useRef(false);
    const raf = useRef(null);
    const gyroHandlerRef = useRef(null);

    const design = currentDesign || userData?.design || {};
    // Colours come from the chosen theme only, so every card keeps its designed look
    const isPro = userData?.is_pro === true;
    // A Pro theme is only ever shown for a Pro account. The dashboard preview (previewLocked) is the one exception,
    // and it is always drawn blurred under an upgrade panel. Everywhere else a free account falls back to the default.
    const wanted = CARD_THEMES[design.theme] ? design.theme : 'cyberpunk';
    // An IEEE RMC role card shows its own theme whether or not the account is Pro
    const roleTheme = rmcRole ? ROLE_CARD_THEME[rmcRole] : null;
    // A workshop role card is the same: its own theme shows whether or not the account is Pro
    const wsCard = !!rmcRole && isWsTheme(wanted);
    const themeKey = CARD_THEMES[wanted].free === false && !isPro && !previewLocked && wanted !== roleTheme && !wsCard ? 'cyberpunk' : wanted;
    const colors = CARD_THEMES[themeKey].colors;
    const style = getCardStyle(themeKey);

    const cardBg = colors.background || THEME.SURFACE_DARK;
    const g1 = colors.gradientStart || THEME.DEFAULT_GRADIENT_START;
    const g2 = colors.gradientEnd || THEME.DEFAULT_GRADIENT_END;
    const ink = cardBg.toLowerCase() === '#ffffff' ? '#1f2937' : (colors.text || THEME.TEXT_LIGHT);
    const light = isLight(cardBg);
    const globalIconShape = design.iconShape || 'rounded';
    // Extra icon shapes are a Pro perk; a free card shows the hexagon instead
    const shapeFor = (s) => (PRO_ICON_SHAPES.includes(s) && !isPro ? 'rounded' : s);

    const name = userData?.full_name || userData?.nickname || 'MiniYou member';
    const nickname = userData?.nickname;
    const profileUrl = nickname ? `${PROFILE_BASE_URL}/${nickname}` : '';
    const fallbackChar = avatarFallbackText || name.charAt(0) || 'U';
    const showPhoto = userData?.avatar_url?.trim() && !avatarFailed;
    const details = getCardDetails(userData);
    // An RMC role card uses the details written for it (falling back to the regular ones)
    const rmcD = rmcRole ? (wsCard ? getWsDetails({ ...userData, design }) : getRmcDetails({ ...userData, design })) : null;
    const showSession = wsCard ? wsHasSession(rmcRole) : rmcRole === 'speaker';
    if (rmcD) Object.assign(details, { title: rmcD.title, organization: rmcD.organization, location: rmcD.location, skills: rmcD.skills });
    const links = (Array.isArray(userData?.socialLinks) ? userData.socialLinks : [])
        .map((l, i) => ({ ...l, _i: i }))
        .filter((l) => safeHref(l?.url, l?.platform));
    // The owner of an empty card sees a faded sample bio and two sample links (only while they have no link at all, never beside a real one) so the card shows its worth.
    // Nothing is saved, and visitors never see them.
    const sampleBio = isOwner === true && !userData?.bio;
    const sampleLinks = isOwner === true && links.length === 0 ? SAMPLE_LINKS : [];
    // QR codes are for the account owner only
    const canShowQr = isOwner === true && !!nickname;

    const cssVars = {
        '--bg': cardBg, '--ink': ink, '--ink-soft': withAlpha(ink, 0.72),
        '--g1': g1, '--g2': g2, '--g1-soft': withAlpha(g1, 0.14), '--on-g': inkOn(g1),
        '--glass': light ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.07)',
        '--glass-bd': light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.16)',
        '--glass-hi': light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)',
        '--glow': withAlpha(g1, isPro ? 0.4 : 0.22), '--pc': g2, '--banner-o': style.bannerOpacity,
        '--bg-layers': `radial-gradient(420px 260px at 88% -4%, ${withAlpha(g1, 0.3)}, transparent 70%), radial-gradient(380px 300px at 0% 104%, ${withAlpha(g2, 0.24)}, transparent 70%), ${cardBg}`,
    };

    // Pointer position drives tilt, parallax and glare through CSS variables (no re-render)
    const setPointer = useCallback((x, y, mx, my) => {
        const el = tiltRef.current;
        if (!el) return;
        el.style.setProperty('--px', x.toFixed(3));
        el.style.setProperty('--py', y.toFixed(3));
        if (mx !== undefined) { el.style.setProperty('--mx', `${mx}%`); el.style.setProperty('--my', `${my}%`); }
    }, []);

    const onPointerMove = (e) => {
        if (raf.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const { clientX, clientY, pointerType } = e;
        const el = tiltRef.current;
        raf.current = requestAnimationFrame(() => {
            raf.current = null;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const nx = (clientX - r.left) / r.width;
            const ny = (clientY - r.top) / r.height;
            const k = pointerType === 'touch' ? 0.5 : 1; // lighter movement for touch
            setPointer((nx * 2 - 1) * k, (ny * 2 - 1) * k, (nx * 100).toFixed(0), (ny * 100).toFixed(0));
            el.dataset.active = 'true';
        });
    };
    const onPointerLeave = () => {
        const el = tiltRef.current;
        setPointer(0, 0);
        if (el) el.dataset.active = 'false';
    };
    useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

    // Optional phone motion tilt (Android starts automatically, iOS asks first)
    const attachGyroHandler = useCallback(() => {
        if (gyroHandlerRef.current) window.removeEventListener('deviceorientation', gyroHandlerRef.current);
        const handler = (e) => {
            const rx = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 35));
            const ry = Math.max(-1, Math.min(1, (e.gamma || 0) / 35));
            setPointer(ry * 0.6, rx * 0.6);
        };
        gyroHandlerRef.current = handler;
        window.addEventListener('deviceorientation', handler);
        setGyroPermission('granted');
    }, [setPointer]);

    useEffect(() => {
        const isTouch = window.matchMedia('(hover: none)').matches;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!isTouch || reduce) return undefined;
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            setGyroPermission('needs-request'); // iOS asks first; there is no button for it, so tilt stays off there
        } else if (typeof DeviceOrientationEvent !== 'undefined') {
            attachGyroHandler();
        } else {
            setGyroPermission('unsupported');
        }
        return () => {
            if (gyroHandlerRef.current) window.removeEventListener('deviceorientation', gyroHandlerRef.current);
        };
    }, [attachGyroHandler]);

    // Move keyboard focus with the flip
    useEffect(() => {
        if (!mounted.current) { mounted.current = true; return; }
        (flipped ? backBtn : frontBtn).current?.focus({ preventScroll: true });
    }, [flipped]);

    const announce = useCallback((msg) => { setStatus(''); setTimeout(() => setStatus(msg), 30); }, []);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true); announce('Link copied');
            setTimeout(() => setCopied(false), 2000);
        } catch { announce('Could not copy the link'); }
    };
    const shareProfile = async () => {
        if (navigator.share) {
            try { await navigator.share({ title: `${name} on MiniYou`, url: profileUrl }); announce('Shared'); return; }
            catch (err) { if (err?.name === 'AbortError') return; }
        }
        copyLink();
    };
    const saveContact = () => {
        const vcf = buildVCard({ fullName: name, title: details.title, organization: details.organization, profileUrl, email: details.email, phone: details.phone, note: details.note });
        const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
        const a = document.createElement('a');
        a.href = url; a.download = `${nickname || 'contact'}.vcf`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        announce('MiniMe saved to your downloads');
    };

    const particles = Array.from({ length: style.particle === 'petal' ? 22 : 12 }, (_, i) => i);
    const longBio = (userData?.bio || '').length > 180;
    const hasDetails = details.title || details.organization || details.location || (showSession && (rmcD?.session_title || rmcD?.session_time));
    const tagLimit = userData?.is_pro === true ? PRO_TAGS : FREE_TAGS;

    return (
        <>
            <LinkActionModal
                state={actionModalState}
                onClose={() => setActionModalState({ isOpen: false, link: null })}
                colors={[g1, g2]}
            />

            <div className="mu-card" data-flipped={flipped} data-theme={themeKey} data-rmc={rmcRole ? 'true' : undefined} style={cssVars}>
                <style>{(THEME_FONT_IMPORT[themeKey] || '') + CARD_CSS + THEME_CSS + (isWsTheme(themeKey) ? WS_CSS + (WS_EXTRA_CSS[themeKey] || '') : '')}</style>
                <div className="mu-enter">
                    <div className="mu-tilt" ref={tiltRef} data-active="false" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerCancel={onPointerLeave} onPointerUp={(e) => { if (e.pointerType === 'touch') onPointerLeave(); }}>
                        {isPro && <div className="mu-pro-ring" aria-hidden="true" />}
                        <div className="mu-inner">
                            {/* FRONT */}
                            <section className="mu-face mu-front" aria-label={`${name}'s profile`} aria-hidden={flipped} inert={flipped}>
                                <CardArt deco={style.deco} />
                                <div className="mu-particles" aria-hidden="true">
                                    {particles.map((i) => <span key={i} className="mu-p" data-k={style.particle} style={particleStyle(i, style.particle)} />)}
                                </div>
                                <div className="mu-glare" aria-hidden="true" />

                                <div className="mu-content">
                                    {isPro && <span className="mu-mega"><Sparkles size={11} aria-hidden="true" /> {PRO_LABEL}</span>}
                                    {rmcRole && <span className="mu-rmc-pill"><b>{wsCard ? WS_EVENT_NAME : 'IEEE RMC 2026'}</b><i>{wsCard ? wsRoleLabel(rmcRole) : roleLabel(rmcRole)}</i></span>}
                                    <div className="mu-banner" aria-hidden="true" />
                                    <div className="mu-ident">
                                        <div className="mu-ring mu-pop" style={{ '--d': '60ms' }}>
                                            {showPhoto ? (
                                                <Image
                                                    className="mu-avatar"
                                                    src={userData.avatar_url.trim()}
                                                    alt={`Photo of ${name}`}
                                                    width={108}
                                                    height={108}
                                                    priority
                                                    unoptimized
                                                    onError={() => setAvatarFailed(true)}
                                                />
                                            ) : (
                                                <div className="mu-avatar" role="img" aria-label={`Initials of ${name}`}>
                                                    {avatarFallbackText ? fallbackChar : getInitials(name)}
                                                </div>
                                            )}
                                            {rmcRole && RMC_RING_FX[themeKey] ? (() => { const Fx = RMC_RING_FX[themeKey]; return <><style>{RMC_RING_FX_CSS}</style><Fx /></>; })() : ((WS_RING_FX[themeKey] || WS_EXTRA_RING_FX[themeKey] || RING_FX[themeKey]) ? (() => { const Fx = WS_RING_FX[themeKey] || WS_EXTRA_RING_FX[themeKey] || RING_FX[themeKey]; return <Fx />; })() : null)}
                                        </div>
                                        <div className="mu-pop" style={{ '--d': '160ms' }}>
                                            <div className="mu-name-row">
                                                <h1 className="mu-name">{name}</h1>
                                            </div>
                                            {nickname && <span className="mu-handle">@{nickname}</span>}
                                            {details.role && <span className="mu-tag" style={{ marginLeft: 8 }}>{details.role}</span>}
                                        </div>
                                        {hasDetails && (
                                            <div className="mu-pop" style={{ '--d': '240ms' }}>
                                                {details.title && <p className="mu-meta"><Briefcase size={14} aria-hidden="true" /> {details.title}</p>}
                                                {(details.organization || (rmcRole && details.location)) && <p className="mu-meta"><Building2 size={14} aria-hidden="true" /> {rmcRole ? [details.organization, details.location].filter(Boolean).join(' · ') : details.organization}</p>}
                                                {!rmcRole && details.location && <p className="mu-meta"><MapPin size={14} aria-hidden="true" /> {details.location}</p>}
                                                {showSession && (rmcD.session_title || rmcD.session_time) && <p className="mu-meta"><Mic size={14} aria-hidden="true" /> {[rmcD.session_title, rmcD.session_time].filter(Boolean).join(' · ')}</p>}
                                            </div>
                                        )}
                                        {details.skills.length > 0 && (
                                            <ul className="mu-tags mu-pop" style={{ '--d': '300ms' }} aria-label="Interests">
                                                {details.skills.slice(0, tagLimit).map((s) => <li key={s} className="mu-tag">{s}</li>)}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="mu-stack">
                                        {sampleBio && (
                                            <div className="mu-panel mu-pop" style={{ '--d': '360ms', opacity: 0.6 }}>
                                                <p className="mu-bio">{SAMPLE_BIO}</p>
                                            </div>
                                        )}
                                        {userData?.bio && (
                                            <div className="mu-panel mu-pop" style={{ '--d': '360ms' }}>
                                                <p className={`mu-bio ${longBio && !bioOpen ? 'mu-clamp' : ''}`}>{userData.bio}</p>
                                                {longBio && (
                                                    <button type="button" className="mu-more" onClick={() => setBioOpen((v) => !v)} aria-expanded={bioOpen}>
                                                        {bioOpen ? 'Show less' : 'Read more'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {(links.length > 0 || sampleLinks.length > 0) && (
                                            <div className="mu-panel mu-pop" style={{ '--d': '430ms' }}>
                                                <h2 className="mu-panel-title">Links</h2>
                                                <div className="mu-links" data-many={links.length > 8} data-scroll={links.length > 16}>
                                                    {links.map((link, i) => (
                                                        <CardLink
                                                            key={i}
                                                            linkIndex={link._i}
                                                            link={{ ...link, iconShape: shapeFor(link.iconShape || globalIconShape) }}
                                                            gradientStart={g1}
                                                            setActionModalState={setActionModalState}
                                                            isOwner={isOwner}
                                                            userData={userData}
                                                        />
                                                    ))}
                                                    {sampleLinks.map((s) => (
                                                        <span
                                                            key={s.platform}
                                                            aria-hidden="true"
                                                            className="shrink-0 hexagonal-border"
                                                            style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', color: g1, backgroundColor: `${g1}20`, opacity: 0.45 }}
                                                        >
                                                            {socialIconMap[s.platform]?.icon}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {profileUrl && (
                                            <div className="mu-actions mu-pop" style={{ '--d': '500ms' }}>
                                                <button type="button" className="mu-btn mu-primary" onClick={shareProfile}><Share2 size={16} aria-hidden="true" /> Share</button>
                                                {canShowQr ? (
                                                    <button ref={frontBtn} type="button" className="mu-btn mu-ghost" onClick={() => setFlipped(true)} aria-label="Show your QR code">
                                                        <QrCode size={16} aria-hidden="true" /> Show QR
                                                    </button>
                                                ) : (
                                                    <button type="button" className="mu-btn mu-ghost" onClick={saveContact}>
                                                        <Download size={16} aria-hidden="true" /> Save MiniMe
                                                    </button>
                                                )}
                                                {details.resumeUrl && (
                                                    <a className="mu-btn mu-ghost" style={{ gridColumn: '1 / -1' }} href={details.resumeUrl} target="_blank" rel="noopener noreferrer" download={`${nickname || 'resume'}-resume.pdf`}>
                                                        <FileText size={16} aria-hidden="true" /> Resume
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* BACK (owner only) */}
                            {canShowQr && (
                                <section className="mu-face mu-back" aria-label={`Share ${name}'s profile`} aria-hidden={!flipped} inert={!flipped}>
                                    <CardArt deco={style.deco} face="back" />
                                    <div className="mu-particles" aria-hidden="true">
                                        {particles.slice(0, 7).map((i) => <span key={i} className="mu-p" data-k={style.particle} style={particleStyle(i + 3, style.particle)} />)}
                                    </div>
                                    <div className="mu-glare" aria-hidden="true" />

                                    <div className="mu-content mu-back-content">
                                        <div className="mu-back-top">
                                            <span className="mu-brand">Mini<b>You</b></span>
                                            <button ref={backBtn} type="button" className="mu-backbtn" onClick={() => setFlipped(false)} aria-label="Back to your card">
                                                <ArrowLeft size={14} aria-hidden="true" /> Back
                                            </button>
                                        </div>
                                        <h2 className="mu-name" style={{ fontSize: 22 }}>{name}</h2>
                                        <FreshQrPanel
                                            enabled={flipped}
                                            kind="profile"
                                            fallbackUrl={profileUrl}
                                            colors={[g1, g2]}
                                            name={name}
                                            textColor={ink}
                                            mutedColor={withAlpha(ink, 0.72)}
                                        />
                                        <p className="mu-scan">SCAN TO OPEN</p>
                                        <p className="mu-url">{profileUrl.replace('https://', '')}</p>
                                        <div className="mu-actions" style={{ width: '100%', marginTop: 'auto' }}>
                                            <button type="button" className="mu-btn mu-primary mu-wide" onClick={shareProfile}><Share2 size={16} aria-hidden="true" /> Share profile</button>
                                            <button type="button" className="mu-btn mu-ghost" onClick={copyLink}>
                                                {copied ? <Check size={15} aria-hidden="true" /> : <LinkIcon size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy link'}
                                            </button>
                                            <button type="button" className="mu-btn mu-ghost" onClick={saveContact}><Download size={15} aria-hidden="true" /> Save MiniMe</button>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mu-status" role="status" aria-live="polite">{status}</div>
            </div>
        </>
    );
});

export default HolographicCard;
