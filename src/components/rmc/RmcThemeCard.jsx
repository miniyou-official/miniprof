'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Space_Mono } from 'next/font/google';
import MiniQr from '../qr/MiniQr';
import FreshQrPanel from '../qr/FreshQrPanel';
import { RMC_ART_CSS } from './rmcArtCss';
import { DISPLAY_ONLY } from '@/lib/edition';
import { ArrowLeft, Building2, Check, Download, Link as LinkIcon, MapPin, QrCode, Share2, Users } from 'lucide-react';
import { CardLink, LinkActionModal } from '../HolographicCard';
import { THEME_ART } from './RmcThemeArt';
import { RMC_RING_FX, RMC_RING_FX_CSS } from './RmcRingFx';
import { getThemeForRole } from './themes';
import { buildVCard, getInitials, getRoleLabel, safeUrl } from './rmcUtils';

const mono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--rt-mono', display: 'swap' });

const CSS = `
${RMC_RING_FX_CSS}
/* Same size as every other MiniYou card (338 x 664) */
.rt-card { font-family: var(--rt-mono), 'Space Mono', monospace; width: 338px; max-width: 100%; position: relative; color: var(--ink); }
.rt-card *, .rt-card *::before, .rt-card *::after { box-sizing: border-box; }
.rt-enter { position: relative; opacity: 0; transform: translateY(18px) scale(0.97); animation: rtEnter 650ms cubic-bezier(.22,.61,.36,1) forwards; animation-delay: var(--ed, 0ms); }
.rt-tilt { position: relative; transform: perspective(1100px) rotateX(calc(var(--py,0) * -5deg)) rotateY(calc(var(--px,0) * 5deg)); transition: transform 260ms ease-out; }
/* Front and back share one grid cell and swap with a blur-fade (no 3D rotation, so nothing is clipped) */
.rt-inner { display: grid; min-height: 664px; }
.rt-face { grid-area: 1 / 1; position: relative; border-radius: 26px; overflow: hidden; transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,.61,.36,1); border: 1px solid var(--bd); box-shadow: 0 18px 50px rgba(0,0,0,0.28), 0 0 34px var(--glow); }
.rt-back { opacity: 0; filter: blur(10px); transform: scale(1.03); visibility: hidden; pointer-events: none; transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,.61,.36,1), visibility 0s linear 450ms; }
.rt-card[data-flipped='true'] .rt-back { opacity: 1; filter: none; transform: none; visibility: visible; pointer-events: auto; transition-delay: 0s; }
.rt-card[data-flipped='true'] .rt-front { opacity: 0; filter: blur(10px); transform: scale(.97); visibility: hidden; pointer-events: none; transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,.61,.36,1), visibility 0s linear 450ms; }

/* artwork + effects layers */
${RMC_ART_CSS}
.rt-scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 46%; pointer-events: none; background: linear-gradient(to top, var(--scrim) 8%, transparent 100%); opacity: 0.8; }
.rt-sheen { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; opacity: 0; transition: opacity 300ms; background: linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.55) 50%, transparent 68%); transform: translateX(calc(var(--px,0) * 70%)); }
.rt-tilt:hover .rt-sheen { opacity: 0.7; }
.rt-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.rt-p { position: absolute; left: var(--pl); bottom: var(--pb); width: var(--ps); height: var(--ps); border-radius: 50%; background: var(--pc); opacity: 0; animation: rtFloat var(--pd) ease-in-out infinite; animation-delay: var(--pdl); }
.rt-p[data-k='firefly'] { box-shadow: 0 0 8px 2px var(--pc); animation-name: rtFirefly; }
.rt-p[data-k='mote'] { filter: blur(1.2px); }
.rt-p[data-k='dust'] { box-shadow: 0 0 5px var(--pc); }
.rt-p[data-k='petal'] { border-radius: 60% 0 60% 0; background: linear-gradient(135deg, #FFFFFF, #F5C6E3); animation-name: rtPetal; }

/* content */
.rt-content { position: relative; z-index: 3; min-height: 664px; display: flex; flex-direction: column; padding: 18px 20px 18px; }
.rt-head { position: relative; z-index: 8; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.rt-brand { font-weight: 700; font-size: 19px; line-height: 1; color: var(--brand); }
.rt-brand b { color: var(--brand-2); font-weight: 700; }
.rt-sub { display: block; margin-top: 4px; font-size: 9.5px; letter-spacing: .06em; color: var(--ink-soft); }
.rt-pill { position: relative; z-index: 9; overflow: hidden; font-size: 12px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; padding: 9px 16px; border-radius: 999px; border: 1.5px solid var(--r1); background: var(--pill-solid-bg); color: var(--pill-solid-ink); white-space: nowrap; box-shadow: 0 0 0 3px rgba(255,255,255,0.10), 0 8px 22px -6px var(--r1), 0 6px 18px -6px rgba(0,0,0,0.55); }
.rt-pill::after { content: ''; position: absolute; top: 0; bottom: 0; left: -70%; width: 45%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent); transform: skewX(-20deg); animation: rtPillShine 4.2s ease-in-out infinite; }
@keyframes rtPillShine { 0%, 55% { left: -70%; } 100% { left: 140%; } }
.rt-ident { display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 14px; }
.rt-ring { position: relative; width: 98px; height: 98px; border-radius: 50%; }
.rt-ring::before { content: ''; position: absolute; inset: -5px; border-radius: 50%; background: conic-gradient(var(--r1), var(--r2), var(--r3), var(--r1)); animation: rtSpin 7s linear infinite; }
.rt-ring::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; box-shadow: 0 0 20px var(--r1); opacity: .55; animation: rtGlow 3.4s ease-in-out infinite; }
.rt-avatar { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; border-radius: 50%; object-fit: cover; display: grid; place-items: center; font-size: 30px; font-weight: 700; color: #fff; background: var(--avatar-bg); box-shadow: 0 0 0 4px var(--scrim); }
.rt-name { margin: 11px 0 0; font-size: 23px; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; color: var(--ink); overflow-wrap: anywhere; }
.rt-handle { margin: 3px 0 0; font-size: 11px; letter-spacing: .04em; color: var(--ink-soft); text-transform: uppercase; }
.rt-role { margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; background: #DFFF38; color: #14232b; box-shadow: 0 0 14px rgba(223,255,56,0.45); }
.rt-title { margin: 10px 0 0; font-size: 13px; font-weight: 700; color: var(--ink); }
.rt-meta { margin: 4px 0 0; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11.5px; color: var(--ink-soft); }
.rt-card[data-dark='true'] .rt-links > button { background: rgba(3,43,51,0.82) !important; }
.rt-card[data-dark='false'] .rt-links > button { background: var(--link-fill) !important; color: var(--link-ink) !important; box-shadow: 0 4px 12px rgba(20,20,60,0.25) !important; }
.rt-tags { margin: 12px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; }
.rt-tag { font-size: 10.5px; padding: 5px 10px; border-radius: 8px; border: 1px solid var(--chip-bd); background: var(--pill-bg); color: var(--ink); }
.rt-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.rt-links[data-many='true'] { gap: 8px; }
.rt-links[data-scroll='true'] { max-height: 150px; overflow-y: auto; padding: 4px; }
.rt-card .hexagonal-border { clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%); }
.rt-card .square-border { border-radius: 10px; }
.rt-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.rt-btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 0 14px; border-radius: 13px; font-family: inherit; font-size: 12.5px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; cursor: pointer; transition: transform 170ms ease, box-shadow 170ms ease; border: 1px solid transparent; }
.rt-btn:hover { transform: translateY(-2px); }
.rt-btn:active { transform: scale(.97); }
.rt-btn:focus-visible { outline: 2px solid var(--brand-2); outline-offset: 3px; }
.rt-lime { background: #DFFF38; color: #14232b; box-shadow: 0 0 16px rgba(223,255,56,0.4); }
.rt-lime:hover { box-shadow: 0 6px 22px rgba(223,255,56,0.55); }
.rt-lime::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.75), transparent); transform: skewX(-20deg); animation: rtShine 5.5s ease-in-out infinite; animation-delay: 1.8s; pointer-events: none; }
.rt-ghost { background: var(--b2-bg); color: var(--b2-ink); border-color: var(--b2-bd); }
.rt-wide { grid-column: 1 / -1; }
.rt-actions .rt-ghost { font-size: 11.5px; padding: 0 8px; white-space: nowrap; }
.rt-pop { opacity: 0; transform: translateY(10px); animation: rtPop 560ms cubic-bezier(.22,.61,.36,1) forwards; animation-delay: calc(var(--ed, 0ms) + var(--d, 0ms)); }

/* back */
.rt-back-top { display: flex; align-items: center; justify-content: space-between; }
.rt-backbtn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 999px; border: 1px solid var(--chip-bd); background: var(--chip-bg); color: var(--ink); font: inherit; font-size: 11px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: transform 170ms; }
.rt-backbtn:hover { transform: translateX(-2px); }
.rt-backbtn:focus-visible { outline: 2px solid var(--brand-2); outline-offset: 3px; }
.rt-body { flex: 1; min-height: 0; overflow-y: auto; margin-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; padding-right: 2px; text-align: center; }
.rt-body > * { flex-shrink: 0; }
.rt-body::-webkit-scrollbar { width: 5px; } .rt-body::-webkit-scrollbar-thumb { background: var(--chip-bd); border-radius: 3px; }
.rt-fine { margin: 10px 0 0; text-align: center; font-size: 9.5px; line-height: 1.5; color: var(--ink-soft); }
.rt-qr { width: 176px; height: 176px; flex: none; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 26px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.4); animation: rtQr 700ms 250ms cubic-bezier(.22,.61,.36,1) both; }
.rt-qr svg { width: 100%; height: 100%; display: block; }
.rt-more { display: block; margin: 4px auto 0; padding: 3px 12px; border-radius: 999px; border: 1px solid var(--chip-bd); background: transparent; color: var(--brand-2); font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.rt-plate { width: 100%; margin-top: 10px; padding: 10px 12px 12px; border-radius: 20px; background: var(--plate-bg); border: 1px solid var(--plate-bd); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; }
.rt-plate .rt-name { margin-top: 0; }
.rt-scan { display: inline-flex; align-items: center; width: auto; padding: 5px 14px; border-radius: 999px; background: var(--plate-bg); border: 1px solid var(--plate-bd); font-size: 10.5px; font-weight: 700; letter-spacing: .12em; color: var(--ink); }
.rt-bio { margin: 0; font-size: 12px; line-height: 1.55; color: var(--ink); max-width: 290px; padding: 9px 12px; border-radius: 14px; background: var(--plate-bg); border: 1px solid var(--plate-bd); }
.rt-body h2 { padding: 6px 16px; border-radius: 999px; background: var(--plate-bg); border: 1px solid var(--plate-bd); }
.rt-clamp { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.rt-panel { width: 100%; text-align: left; border: 1px solid var(--panel-bd); background: var(--panel-bg); border-radius: 12px; padding: 10px 12px; }
.rt-panel h3 { margin: 0 0 6px; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--brand-2); }
.rt-panel strong { display: block; font-size: 13px; line-height: 1.3; }
.rt-panel span { display: block; margin-top: 3px; font-size: 11.5px; color: var(--ink-soft); }
.rt-panel .rt-tags { justify-content: flex-start; margin: 0; }
.rt-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

@keyframes rtEnter { to { opacity: 1; transform: none; } }
@keyframes rtPop { to { opacity: 1; transform: none; } }
@keyframes rtQr { from { opacity: 0; transform: scale(.85) rotate(-3deg); } to { opacity: 1; transform: none; } }
@keyframes rtSpin { to { transform: rotate(360deg); } }
@keyframes rtGlow { 0%,100% { opacity: .35; } 50% { opacity: .8; } }
@keyframes rtShine { 0%,70% { left: -60%; } 100% { left: 130%; } }
@keyframes rtFloat { 0% { opacity: 0; transform: translate(0,0); } 20% { opacity: .85; } 80% { opacity: .6; } 100% { opacity: 0; transform: translate(var(--dx), -150px); } }
@keyframes rtFirefly { 0% { opacity: 0; transform: translate(0,0); } 25% { opacity: 1; } 50% { opacity: .2; } 75% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), -60px); } }
@keyframes rtPetal { 0% { opacity: 0; transform: translate(0,0) rotate(0); } 12% { opacity: .9; } 85% { opacity: .7; } 100% { opacity: 0; transform: translate(var(--dx), 430px) rotate(300deg); } }

@media (prefers-reduced-motion: reduce) {
  .rt-pill::after { animation: none; display: none; }
  .rt-enter, .rt-pop, .rt-qr { animation: none; opacity: 1; transform: none; }
  .rt-art, .rt-sway, .rt-pulse, .rt-road, .rt-ring::before, .rt-ring::after, .rt-lime::after { animation: none; }
  .rt-p { display: none; }
  .rt-tilt { transform: none; }
  .rt-l1, .rt-l2, .rt-l3 { transform: none; }
  .rt-face { transition: opacity 200ms linear; filter: none !important; transform: none !important; }
  .rt-back { transition: opacity 200ms linear, visibility 0s linear 200ms; }
  .rt-btn, .rt-backbtn { transition: none; }
}
`;

// Deterministic particle layout (no randomness, so server and client render the same)
function particleStyle(i, kind) {
  const left = ((i * 37 + 11) % 92) + 2;
  const base = { '--pl': `${left}%`, '--dx': `${((i % 5) - 2) * 10}px`, '--pd': `${6 + (i % 5) * 1.6}s`, '--pdl': `${(i * 0.7) % 6}s` };
  if (kind === 'petal') return { ...base, '--pb': '96%', '--ps': `${7 + (i % 3) * 3}px`, '--pd': `${9 + (i % 4) * 2}s` };
  if (kind === 'firefly') return { ...base, '--pb': `${8 + ((i * 29) % 70)}%`, '--ps': `${3 + (i % 3)}px` };
  if (kind === 'mote') return { ...base, '--pb': `${6 + ((i * 23) % 60)}%`, '--ps': `${4 + (i % 4)}px` };
  return { ...base, '--pb': `${4 + ((i * 19) % 40)}%`, '--ps': `${2 + (i % 3)}px` }; // dust
}

/**
 * Themed MiniYou x RMC 2026 card. One theme per role.
 * profile: { id, full_name, nickname, avatar_url, bio }
 * details: { role, title, organization, location, skills[], session_title, session_time }
 * links:   MiniYou datapaths [{ platform, url, label, iconShape, customColor, clickAction }]
 */
export default function RmcThemeCard({ profile, details = {}, links = [], profileUrl, theme: themeProp, delay = 0, isOwner = false, demo = false }) {
  const role = details.role || 'attendee';
  const theme = themeProp || getThemeForRole(role);
  const Art = THEME_ART[theme.key];

  const [flipped, setFlipped] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, link: null });
  const tiltRef = useRef(null);
  const frontBtn = useRef(null);
  const backBtn = useRef(null);
  const mounted = useRef(false);
  const raf = useRef(null);

  const name = profile?.full_name || profile?.nickname || 'MiniYou member';
  const roleLabel = getRoleLabel(role);
  const skills = Array.isArray(details.skills) ? details.skills.filter(Boolean) : [];
  const dataLinks = (links || []).filter((l) => safeUrl(l.url, l.platform)).map((l) => ({ ...l, iconShape: l.iconShape || theme.iconShape }));
  const showPhoto = profile?.avatar_url && !avatarFailed;
  const hasSession = role === 'speaker' && (details.session_title || details.session_time);
  const longBio = (profile?.bio || '').length > 180;
  // Display-only (pitch/demo): everyone sees a plain, instant QR that opens the card. Otherwise only the owner sees a QR.
  const staticQr = demo || DISPLAY_ONLY;
  const canShowQr = staticQr || (isOwner && !!profile?.nickname);
  const hasPanel = hasSession || ((role === 'mentor' || role === 'organizer') && skills.length > 0);

  const cssVars = {
    ...theme.vars,
    '--plate-bg': theme.dark ? 'rgba(3,32,40,0.74)' : 'rgba(255,255,255,0.74)',
    '--plate-bd': theme.dark ? 'rgba(255,255,255,0.16)' : 'rgba(20,20,60,0.14)',
    '--pill-solid-bg': theme.dark ? '#F4F9FC' : '#14232B',
    '--pill-solid-ink': theme.dark ? '#0B2F3A' : '#FFFFFF',
    '--bd': theme.border, '--glow': theme.glow, '--scrim': theme.scrim,
    '--r1': theme.ring[0], '--r2': theme.ring[1], '--r3': theme.ring[2],
    '--avatar-bg': `linear-gradient(135deg, ${theme.palette[1]}, ${theme.palette[0]})`,
    '--pc': theme.particle.color,
  };

  // Pointer position drives tilt, parallax and sheen through CSS variables (no re-render)
  const onMove = (e) => {
    if (raf.current || e.pointerType === 'touch') return;
    const el = tiltRef.current;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  };
  const onLeave = () => {
    const el = tiltRef.current;
    if (el) { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0'); }
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

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
    const vcf = buildVCard({ fullName: name, title: details.title, organization: details.organization, profileUrl });
    const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${profile?.nickname || 'contact'}.vcf`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    announce('Contact file downloaded');
  };

  const particles = Array.from({ length: theme.particle.kind === 'petal' ? 9 : 14 }, (_, i) => i);

  return (
    <div className={`rt-card ${mono.variable}`} data-flipped={flipped} data-theme={theme.key} data-dark={theme.dark ? 'true' : 'false'} style={cssVars}>
      <style>{CSS}</style>
      <LinkActionModal state={modal} onClose={() => setModal({ isOpen: false, link: null })} userData={profile} />

      <div className="rt-enter" style={{ '--ed': `${delay}ms` }}>
        <div className="rt-tilt" ref={tiltRef} onPointerMove={onMove} onPointerLeave={onLeave}>
          <div className="rt-inner">
            {/* FRONT */}
            <section className="rt-face rt-front" aria-label={`${name}, ${roleLabel}`} aria-hidden={flipped} inert={flipped} style={{ background: theme.frontBg }}>
              <Art.front />
              <div className="rt-scrim" />
              <div className="rt-particles" aria-hidden="true">
                {particles.map((i) => <span key={i} className="rt-p" data-k={theme.particle.kind} style={particleStyle(i, theme.particle.kind)} />)}
              </div>
              <div className="rt-sheen" aria-hidden="true" />

              <div className="rt-content">
                <header className="rt-head rt-pop" style={{ '--d': '0ms' }}>
                  <div>
                    <span className="rt-brand">Mini<b>You</b></span>
                  </div>
                  <span className="rt-pill">IEEE RMC 2026</span>
                </header>

                <div className="rt-ident">
                  <div className="rt-ring rt-pop" style={{ '--d': '120ms' }}>
                    {showPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="rt-avatar" src={profile.avatar_url} alt={`Photo of ${name}`} width={98} height={98} onError={() => setAvatarFailed(true)} />
                    ) : (
                      <div className="rt-avatar" role="img" aria-label={`Initials of ${name}`}>{getInitials(name)}</div>
                    )}
                    {RMC_RING_FX[theme.key] ? (() => { const Fx = RMC_RING_FX[theme.key]; return <Fx />; })() : null}
                  </div>
                  <div className="rt-plate rt-pop" style={{ '--d': '220ms' }}>
                  <div>
                    <h1 className="rt-name">{name}</h1>
                    <p className="rt-handle">@{profile?.nickname}</p>
                    <span className="rt-role"><Users size={13} aria-hidden="true" /> {roleLabel}</span>
                  </div>
                  <div>
                    {details.title && <p className="rt-title">{details.title}</p>}
                    {details.organization && <p className="rt-meta"><Building2 size={13} aria-hidden="true" /> {details.organization}</p>}
                    {details.location && <p className="rt-meta"><MapPin size={13} aria-hidden="true" /> {details.location}</p>}
                  </div>
                  {skills.length > 0 && (
                    <ul className="rt-tags" aria-label="Expertise">
                      {skills.slice(0, 4).map((s) => <li key={s} className="rt-tag">{s}</li>)}
                    </ul>
                  )}
                  </div>
                </div>

                <div style={{ flex: 1 }} />

                <div className="rt-pop" style={{ '--d': '460ms' }}>
                  {dataLinks.length > 0 && (
                    <div className="rt-links" data-many={dataLinks.length > 8} data-scroll={dataLinks.length > 16} style={{ marginBottom: 14 }}>
                      {dataLinks.map((l, i) => (
                        <CardLink key={i} link={l} gradientStart={theme.linkColor} setActionModalState={setModal} isOwner={isOwner} userData={profile} />
                      ))}
                    </div>
                  )}
                  <div className="rt-actions">
                    <button type="button" className="rt-btn rt-lime" onClick={shareProfile}><Share2 size={16} aria-hidden="true" /> Share</button>
                    {canShowQr ? (
                      <button ref={frontBtn} type="button" className="rt-btn rt-ghost" onClick={() => setFlipped(true)} aria-label="Show your QR code">
                        <QrCode size={16} aria-hidden="true" /> Show QR
                      </button>
                    ) : (
                      <button type="button" className="rt-btn rt-ghost" onClick={saveContact}>
                        <Download size={15} aria-hidden="true" /> Save MiniMe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* BACK */}
            {canShowQr && (
            <section className="rt-face rt-back" aria-label={`Connect with ${name}`} aria-hidden={!flipped} inert={!flipped} style={{ background: theme.backBg }}>
              <Art.back />
              <div className="rt-scrim" style={{ height: '34%' }} />
              <div className="rt-particles" aria-hidden="true">
                {particles.slice(0, 8).map((i) => <span key={i} className="rt-p" data-k={theme.particle.kind} style={particleStyle(i + 3, theme.particle.kind)} />)}
              </div>
              <div className="rt-sheen" aria-hidden="true" />

              <div className="rt-content">
                <div className="rt-back-top">
                  <div>
                    <span className="rt-brand">Mini<b>You</b></span>
                  </div>
                  <button ref={backBtn} type="button" className="rt-backbtn" onClick={() => setFlipped(false)} aria-label="Flip card back to the front">
                    <ArrowLeft size={14} aria-hidden="true" /> Back
                  </button>
                </div>

                <div className="rt-body">
                  <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>{name}</h2>
                  {staticQr ? (
                    <MiniQr className="rt-qr" value={profileUrl} colors={[theme.qrDark, theme.palette[0]]} label={`QR code that opens ${name}'s profile`} />
                  ) : (
                    <FreshQrPanel enabled={flipped} kind="profile" fallbackUrl={profileUrl} colors={[theme.qrDark, theme.palette[0]]} name={name} textColor={theme.vars['--ink']} mutedColor={theme.vars['--ink-soft']} />
                  )}
                  <p className="rt-scan">SCAN TO CONNECT</p>

                  {profile?.bio && (
                    <>
                      <p className={`rt-bio ${hasPanel || (longBio && !bioOpen) ? 'rt-clamp' : ''}`}>{profile.bio}</p>
                      {longBio && !hasPanel && (
                        <button type="button" className="rt-more" onClick={() => setBioOpen((v) => !v)} aria-expanded={bioOpen}>{bioOpen ? 'Show less' : 'Read more'}</button>
                      )}
                    </>
                  )}

                  {hasSession && (
                    <div className="rt-panel">
                      <h3>Session</h3>
                      {details.session_title && <strong>{details.session_title}</strong>}
                      {details.session_time && <span>{details.session_time}</span>}
                    </div>
                  )}
                  {(role === 'mentor' || role === 'organizer') && skills.length > 0 && (
                    <div className="rt-panel">
                      <h3>{role === 'mentor' ? 'Happy to mentor on' : 'Focus areas'}</h3>
                      <ul className="rt-tags">{skills.map((s) => <li key={s} className="rt-tag">{s}</li>)}</ul>
                    </div>
                  )}
                </div>

                <div className="rt-actions" style={{ marginTop: 12 }}>
                  <button type="button" className="rt-btn rt-lime rt-wide" onClick={shareProfile}><Share2 size={16} aria-hidden="true" /> Share profile</button>
                  <button type="button" className="rt-btn rt-ghost" onClick={copyLink}>
                    {copied ? <Check size={15} aria-hidden="true" /> : <LinkIcon size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <button type="button" className="rt-btn rt-ghost" onClick={saveContact}><Download size={15} aria-hidden="true" /> Save MiniMe</button>
                </div>
              </div>
            </section>
            )}
          </div>
        </div>
      </div>
      <div className="rt-status" role="status" aria-live="polite">{status}</div>
    </div>
  );
}
