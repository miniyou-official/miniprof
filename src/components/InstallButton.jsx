'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, X } from 'lucide-react';

// "Add to home screen". On Chrome and Android one tap installs the app straight away. Only where the browser does not
// allow that (iPhone, some others) a short note says where to tap. It hides itself once MiniYou is already installed.
export default function InstallButton({ className, style }) {
    const [deferred, setDeferred] = useState(null);
    const [installed, setInstalled] = useState(false);
    const [help, setHelp] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (standalone) { setInstalled(true); return undefined; }
        if (window.__muInstall) setDeferred(window.__muInstall); // the browser offered install before this button existed
        const onPrompt = (e) => { e.preventDefault(); window.__muInstall = e; setDeferred(e); };
        const onInstalled = () => { setInstalled(true); setDeferred(null); setHelp(false); };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    if (installed) return null;

    const click = async () => {
        if (deferred) {
            deferred.prompt();
            try { await deferred.userChoice; } catch { /* closed without choosing */ }
            setDeferred(null);
            window.__muInstall = null;
            return;
        }
        setHelp(true); // only where the browser has no install button of its own (iPhone, or already offered once)
    };

    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
    const android = /android/i.test(ua);
    const steps = ios
        ? ['Tap the Share button in Safari (the square with an arrow).', 'Scroll down and tap "Add to Home Screen".', 'Tap "Add".']
        : android
            ? ['Tap the menu button (three dots) in your browser.', 'Tap "Install app" or "Add to Home screen".', 'Tap "Install".']
            : ['Look for the install icon at the right end of the address bar and click it.', 'Or open the browser menu and choose "Install MiniYou".'];

    return (
        <>
            <button type="button" onClick={click} aria-label="Add MiniYou to your home screen" title="Add to home screen" className={className} style={style}>
                <Smartphone size={18} />
            </button>
            {mounted && help && createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Add to home screen"
                    onClick={() => setHelp(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(5,6,10,0.8)', backdropFilter: 'blur(6px)' }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 380px)', borderRadius: 24, padding: 24, background: '#0B0D14', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', position: 'relative' }}>
                        <button type="button" onClick={() => setHelp(false)} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'transparent', border: 0, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}><X size={18} /></button>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{'Add MiniYou to your home screen'}</h3>
                        <ol style={{ margin: '16px 0 0', paddingLeft: 20, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)', fontSize: 15 }}>
                            {steps.map((s) => <li key={s}>{s}</li>)}
                        </ol>
                        <button type="button" onClick={() => setHelp(false)} style={{ marginTop: 20, width: '100%', minHeight: 46, borderRadius: 999, border: 0, background: '#1AD1FF', color: '#05060A', fontWeight: 800, cursor: 'pointer' }}>{'Got it'}</button>
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
