// The opening screen for the home page: dark, with the MiniYou logo in the centre.
//
// It is plain server-rendered HTML and CSS, so it shows from the very first paint (no white flash and no wait
// for JavaScript). A small inline script fades it out as soon as the page has loaded, never later than 1.2 s,
// and only once per browser session. It is an overlay: the real page is in the HTML underneath, so search
// engines and screen readers still get all of it. Without JavaScript, or with reduced motion, it is not shown.

import SplashGuard from '@/components/SplashGuard';

const CSS = `
html { background: #05060A; }
#mu-splash {
  position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center;
  background: radial-gradient(700px 420px at 50% 42%, rgba(26,209,255,0.14), transparent 70%), #05060A;
  transition: opacity .45s ease, transform .45s ease, visibility 0s linear .45s;
}
#mu-splash.mu-out { opacity: 0; transform: scale(1.04); visibility: hidden; pointer-events: none; }
#mu-splash .mu-stage { position: relative; width: 150px; height: 150px; display: grid; place-items: center; }
#mu-splash svg { position: absolute; inset: 0; transform: rotate(-90deg); }
#mu-splash .mu-track { fill: none; stroke: rgba(26,209,255,0.14); stroke-width: 3; }
#mu-splash .mu-arc {
  fill: none; stroke: url(#mu-grad); stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: 327; stroke-dashoffset: 327; animation: mu-draw 1s cubic-bezier(.22,1,.36,1) .05s forwards;
}
#mu-splash .mu-glow {
  position: absolute; inset: -20%; border-radius: 9999px; opacity: 0;
  background: radial-gradient(circle, rgba(26,209,255,0.4), transparent 62%); animation: mu-glow 1.6s ease-in-out .1s infinite;
}
#mu-splash img { position: relative; width: 84px; height: auto; opacity: 0; transform: scale(.86); animation: mu-logo .6s cubic-bezier(.22,1,.36,1) .12s forwards; filter: drop-shadow(0 0 10px rgba(26,209,255,0.6)); }
@keyframes mu-draw { to { stroke-dashoffset: 0; } }
@keyframes mu-logo { to { opacity: 1; transform: none; } }
@keyframes mu-glow { 0%, 100% { opacity: .25; } 50% { opacity: .85; } }
@media (prefers-reduced-motion: reduce) { #mu-splash { display: none; } }
`;

// Runs right after the overlay is parsed, so a returning visitor never sees it at all.
const SCRIPT = `(function(){var el=document.getElementById('mu-splash');if(!el)return;window.__muSplashAt=Date.now();
try{if(sessionStorage.getItem('mu-splash')){el.style.display='none';return;}sessionStorage.setItem('mu-splash','1');}catch(e){}
var t0=Date.now(),done=false;
function hide(){if(done)return;done=true;el.classList.add('mu-out');}
function ready(){setTimeout(hide,Math.max(0,700-(Date.now()-t0)));}
if(document.readyState==='complete')ready();else window.addEventListener('load',ready);
setTimeout(hide,1200);})();`;

export default function Splash() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <noscript><style>{'#mu-splash{display:none}'}</style></noscript>
            <div id="mu-splash" aria-hidden="true" suppressHydrationWarning>
                <div className="mu-stage">
                    <span className="mu-glow" />
                    <svg viewBox="0 0 120 120" width="150" height="150" focusable="false">
                        <defs>
                            <linearGradient id="mu-grad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#7BE6FF" />
                                <stop offset="100%" stopColor="#2A6BFF" />
                            </linearGradient>
                        </defs>
                        <circle className="mu-track" cx="60" cy="60" r="52" />
                        <circle className="mu-arc" cx="60" cy="60" r="52" />
                    </svg>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/miniyou-logo.png" alt="" width="84" height="75" decoding="async" fetchPriority="high" />
                </div>
            </div>
            <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
            <SplashGuard />
        </>
    );
}
