'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import { getPublicProfileByNickname, getUserProfile, incrementViewCount, reportProfile } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';
import HolographicCard, { THEME } from './HolographicCard';
import PublicProfileSkeleton from './PublicProfileSkeleton';
import RmcProfile from './rmc/RmcProfile';
import RoleCard from './RoleCard';
import { IS_RMC } from '@/lib/edition';

// Lazy load Pro theme renderer (canvas-heavy, only for Pro users)
const ProThemeRenderer = dynamic(
    () => import('./themes/ProThemes').then(mod => mod.ProThemeRenderer),
    { ssr: false }
);

// Themes that have a full Pro animated experience
const PRO_FULL_THEMES = []; // every theme now renders through the one designed card

// --- Main Page Logic ---
function ProfileContent({ nickname, rmc, initialProfile }) {
    // initialProfile comes from the server: a profile, null (no such public profile), or undefined (look it up here)
    const [userData, setUserData] = useState(initialProfile ?? null);
    const [loading, setLoading] = useState(initialProfile === undefined);
    const [isOwner, setIsOwner] = useState(null); // null = checking, true = owner, false = visitor

    useEffect(() => {
        if (initialProfile !== undefined) return;
        const fetchProfile = async () => {
            try {
                const profile = await getPublicProfileByNickname(nickname);
                setUserData(profile);
            } catch (err) {
                console.error('Error fetching public profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [nickname, initialProfile]);

    useEffect(() => {
        let off = false;
        const checkOwner = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            if (off) return;
            const session = sessionData?.session;
            if (!session) {
                setIsOwner(false);
                return;
            }
            // The profile is already here, so compare ids; no second request is needed
            if (userData?.id) {
                setIsOwner(session.user.id === userData.id);
                return;
            }
            if (loading) return; // the profile is still loading; this runs again when it arrives
            try {
                const profile = await getUserProfile(session.user.id);
                if (!off) setIsOwner(profile?.nickname === nickname);
            } catch {
                if (!off) setIsOwner(false);
            }
        };
        checkOwner();
        return () => { off = true; };
    }, [nickname, userData?.id, loading]);

    useEffect(() => {
        if (isOwner === false) {
            incrementViewCount(nickname); // fire and forget — never count owner views
        }
    }, [isOwner, nickname]);

    if (loading) return <PublicProfileSkeleton />;

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME.BG_DARK }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold" style={{ color: THEME.PRIMARY }}>{'PROFILE NOT FOUND'}</h2>
                    <p className="mt-2" style={{ color: THEME.TEXT_MUTED }}>{'Either this profile does not exist or it is set to private.'}</p>
                </div>
            </div>
        );
    }

    if (IS_RMC || rmc) return <RmcProfile userData={userData} nickname={nickname} isOwner={isOwner === true} />;

    return (
        <>
            <style jsx="true" global="true">{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
                body {
                    overflow-x: hidden;
                    font-family: 'Space Mono', monospace;
                    background-color: ${THEME.BG_DARK};
                }
                .cosmic-background {
                    position: fixed; inset: 0; z-index: -1;
                    background: radial-gradient(ellipse at 10% 10%, rgba(255,20,147,0.06) 0%, transparent 18%),
                                radial-gradient(ellipse at 90% 80%, rgba(0,255,255,0.04) 0%, transparent 20%),
                                linear-gradient(180deg, rgba(6,10,15,1) 0%, rgba(8,12,22,1) 100%);
                    background-blend-mode: screen, screen, normal;
                    overflow: hidden;
                }
                .cosmic-background::after {
                    content: ''; position: absolute; inset: 0;
                    background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 10%),
                                      radial-gradient(circle at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 8%);
                    opacity: 0.9; pointer-events: none; mix-blend-mode: overlay;
                }
                @keyframes subtle-float-anim {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-subtle-float-card { animation: subtle-float-anim 5s ease-in-out infinite; }
                @keyframes pulsing-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .pulsing-gradient-bg { background-size: 200% 200%; animation: pulsing-gradient 8s ease infinite; }
                .hexagonal-border { clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%); }
                .square-border { border-radius: 4px; }
                .scanlines-overlay {
                    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12) 1px, transparent 1px, transparent 2px);
                    pointer-events: none;
                }
                .perspective-1000 { perspective: 1000px; }
            `}</style>

            {(() => {
                const activeTheme = userData?.design?.theme || 'cyberpunk';
                const hasFullTheme = userData?.is_pro && PRO_FULL_THEMES.includes(activeTheme);

                // Pro users with full animated themes — render ONLY the themed experience (no HolographicCard overlap)
                if (hasFullTheme) {
                    return (
                        <>
                            <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 1, background: '#00000A' }}>
                                <ProThemeRenderer
                                    themeKey={activeTheme}
                                    userData={userData}
                                    currentDesign={userData?.design || {}}
                                    isOwner={isOwner === true}
                                    themeSettings={userData?.theme_settings || {}}
                                />
                            </div>

                            {/* Floating controls on top of the themed page. The QR lives on the back of the card, so there is no separate QR button here. */}
                            <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: 10 }}>
                                {isOwner === false && (
                                    <button
                                        onClick={async () => {
                                            const { data: sessionCheck } = await supabase.auth.getSession();
                                            if (!sessionCheck?.session) { alert('You must be logged in to report.'); return; }
                                            const confirmed = window.confirm('Report this profile for inappropriate content?');
                                            if (!confirmed) return;
                                            try {
                                                await reportProfile(nickname);
                                                alert('Report submitted.');
                                            } catch { alert('Could not submit report.'); }
                                        }}
                                        style={{
                                            padding: '6px 16px', borderRadius: 12, fontSize: 10,
                                            fontFamily: 'monospace', cursor: 'pointer',
                                            background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.4)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        Report
                                    </button>
                                )}
                            </div>
                        </>
                    );
                }

                // Free users / non-animated themes — standard view with HolographicCard
                return (
                    <>
                        <div className="cosmic-background"></div>

                        <main className="flex flex-col items-center justify-center min-h-screen w-full p-6 relative overflow-hidden font-mono gap-6">
                            <RoleCard userData={userData} isOwner={isOwner === true} />

                            {isOwner === false && (
                                <button
                                    onClick={async () => {
                                        const { data: sessionCheck } = await supabase.auth.getSession();
                                        if (!sessionCheck?.session) { alert('You must be logged in to report a profile.'); return; }
                                        const confirmed = window.confirm('Report this profile for inappropriate or harmful content?');
                                        if (!confirmed) return;
                                        try {
                                            await reportProfile(nickname);
                                            alert('Report submitted. Thank you.');
                                        } catch { alert('Could not submit report. Please try again.'); }
                                    }}
                                    style={{ color: THEME.TEXT_MUTED, fontSize: '12px', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Report this profile
                                </button>
                            )}

                            <footer className="flex items-center justify-center pointer-events-none w-full">
                                <div className="pointer-events-auto bg-[rgba(255,255,255,0.03)] backdrop-blur-sm rounded-2xl px-4 py-3 flex flex-col items-center gap-2 max-w-md w-full shadow-xl border" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                    <motion.a
                                        href="/signup"
                                        className="px-5 py-2 rounded-lg font-semibold text-black w-full text-center"
                                        whileHover={{ scale: 1.02 }}
                                        style={{ background: `linear-gradient(90deg, ${THEME.ACCENT}, ${THEME.PRIMARY})`, boxShadow: `0 6px 18px ${THEME.ACCENT}30` }}
                                    >
                                        Create your own MiniYou
                                    </motion.a>
                                    <p className="text-xs text-center" style={{ color: THEME.TEXT_MUTED }}>
                                        Craft your own MiniYou in just 30 secs!
                                    </p>
                                    <a
                                        href="https://www.miniyou.co.in"
                                        className="text-center mt-1 hover:opacity-80 transition-opacity"
                                        style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px', textDecoration: 'none', letterSpacing: '1px' }}
                                    >
                                        made with MiniYou
                                    </a>
                                </div>
                            </footer>
                        </main>
                    </>
                );
            })()}
        </>
    );
}

export default function ProfileView({ nickname, rmc = false, initialProfile }) {
    return (
        <Suspense fallback={<PublicProfileSkeleton />}>
            <ProfileContent nickname={nickname} rmc={rmc} initialProfile={initialProfile} />
        </Suspense>
    );
}
