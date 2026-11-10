// Shared profile-card styles. Every colour comes from CSS variables set on .mu-card, so one
// structure serves all themes: --bg --ink --ink-soft --g1 --g2 --on-g --glass --glass-bd --glass-hi.

export const CARD_CSS = `
.mu-card { position: relative; width: 100%; max-width: 440px; margin: 0 auto; color: var(--ink); }
.mu-card *, .mu-card *::before, .mu-card *::after { box-sizing: border-box; }
.mu-enter { opacity: 0; transform: translateY(16px) scale(0.97); animation: muEnter 640ms cubic-bezier(.22,.61,.36,1) forwards; }
.mu-tilt { position: relative; transform: perspective(1200px) rotateX(calc(var(--py,0) * -5deg)) rotateY(calc(var(--px,0) * 5deg)); transition: transform 280ms ease-out; will-change: transform; }
.mu-tilt[data-active='true'] { transition: transform 90ms linear; }
/* Front and back share one grid cell and swap with a blur-fade (no 3D rotation, so nothing is clipped) */
.mu-inner { display: grid; }
.mu-face { grid-area: 1 / 1; position: relative; overflow: hidden; border-radius: 28px; background: var(--bg-layers); transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,.61,.36,1); border: 1px solid var(--glass-bd); box-shadow: 0 22px 54px -14px rgba(0,0,0,0.5), 0 0 34px -6px var(--glow), inset 0 1px 0 var(--glass-hi); }
.mu-back { opacity: 0; filter: blur(10px); transform: scale(1.03); visibility: hidden; pointer-events: none; transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,.61,.36,1), visibility 0s linear 450ms; }
.mu-card[data-flipped='true'] .mu-back { opacity: 1; filter: none; transform: none; visibility: visible; pointer-events: auto; transition-delay: 0s; }
.mu-card[data-flipped='true'] .mu-front { opacity: 0; filter: blur(10px); transform: scale(.97); visibility: hidden; pointer-events: none; transition: opacity 450ms ease, filter 450ms ease, transform 450ms cubic-bezier(.22,.61,.36,1), visibility 0s linear 450ms; }
.mu-pro-ring { position: absolute; inset: 0; z-index: 7; pointer-events: none; border-radius: 28px; padding: 2px; overflow: hidden; background: linear-gradient(0deg, var(--g1), var(--g2)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.mu-pro-ring::before { content: ''; position: absolute; top: 50%; left: 50%; width: 200%; height: 10rem; background: linear-gradient(0deg, transparent 0%, var(--g2) 40%, var(--g1) 60%, transparent 100%); animation: muRingRotate 6s linear infinite; transform-origin: center; }

/* artwork + effects layers */
.mu-art { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.mu-l1 { transform: translate(calc(var(--px,0) * -4px), calc(var(--py,0) * -3px)); transition: transform 300ms ease-out; }
.mu-l2 { transform: translate(calc(var(--px,0) * -8px), calc(var(--py,0) * -6px)); transition: transform 300ms ease-out; }
.mu-l3 { transform: translate(calc(var(--px,0) * -14px), calc(var(--py,0) * -10px)); transition: transform 300ms ease-out; }
.mu-orb { position: absolute; border-radius: 50%; background: var(--g1); opacity: 0.2; filter: blur(46px); }
.mu-wave { position: absolute; left: -2%; right: -2%; bottom: 0; width: 104%; height: 30%; }
.mu-drift { animation: muDrift 14s ease-in-out infinite alternate; transform-box: fill-box; }
.mu-drift-2 { animation-duration: 18s; animation-direction: alternate-reverse; }
.mu-sprigs { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: auto; aspect-ratio: 400 / 160; opacity: 0.8; }
.mu-sway { transform-box: fill-box; transform-origin: 50% 100%; animation: muSway 7s ease-in-out infinite; animation-delay: var(--sd, 0s); }
.mu-arc { position: absolute; top: -10px; right: -10px; width: 190px; height: 190px; }
.mu-rings { position: absolute; top: 4px; right: -24px; width: 200px; height: 200px; animation: muSpin 60s linear infinite; }
.mu-road { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 34%; }
.mu-sky { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 22%; }
.mu-dash { animation: muDash 3s linear infinite; }
.mu-grid { position: absolute; inset: 0; opacity: 0.55; background-image: linear-gradient(var(--g1-soft) 1px, transparent 1px), linear-gradient(90deg, var(--g1-soft) 1px, transparent 1px); background-size: 34px 34px; -webkit-mask-image: linear-gradient(to bottom, transparent 20%, #000 100%); mask-image: linear-gradient(to bottom, transparent 20%, #000 100%); }
.mu-corner { position: absolute; width: 22px; height: 22px; border: 2px solid var(--g2); opacity: 0.55; }
.mu-c-tl { top: 12px; left: 12px; border-right: 0; border-bottom: 0; border-top-left-radius: 8px; }
.mu-c-tr { top: 12px; right: 12px; border-left: 0; border-bottom: 0; border-top-right-radius: 8px; }
.mu-c-bl { bottom: 12px; left: 12px; border-right: 0; border-top: 0; border-bottom-left-radius: 8px; }
.mu-c-br { bottom: 12px; right: 12px; border-left: 0; border-top: 0; border-bottom-right-radius: 8px; }
.mu-paper-frame { position: absolute; inset: 10px; border-radius: 20px; border: 1px solid var(--g1-soft); box-shadow: inset 0 0 0 4px transparent, inset 0 0 0 5px var(--g1-soft); opacity: 0.8; }
.mu-glare { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; opacity: 0; transition: opacity 300ms; background: radial-gradient(circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.7), transparent 46%); }
.mu-tilt[data-active='true'] .mu-glare { opacity: 0.85; }
.mu-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.mu-p { position: absolute; left: var(--pl); bottom: var(--pb); width: var(--ps); height: var(--ps); border-radius: 50%; background: var(--pc); opacity: 0; animation: muFloat var(--pd) ease-in-out infinite; animation-delay: var(--pdl); }
.mu-p[data-k='firefly'] { box-shadow: 0 0 8px 2px var(--pc); animation-name: muFirefly; }
.mu-p[data-k='mote'] { filter: blur(1px); }
.mu-p[data-k='dust'] { box-shadow: 0 0 5px var(--pc); }
.mu-p[data-k='ember'] { box-shadow: 0 0 7px 1px var(--pc); }
.mu-p[data-k='petal'] { border-radius: 60% 0 60% 0; background: linear-gradient(135deg, var(--pc), var(--g2)); animation-name: muPetal; }

/* content */
.mu-content { position: relative; z-index: 3; display: flex; flex-direction: column; min-height: 100%; }
.mu-banner { position: relative; height: 112px; flex: none; background-image: linear-gradient(110deg, var(--g1), var(--g2), var(--g1)); background-size: 200% 200%; animation: muGradient 9s ease infinite; opacity: var(--banner-o, 1); }
.mu-banner::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px); }
.mu-card[data-theme='community'] .mu-banner::before { display: none; }
.mu-banner::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 60%; background: linear-gradient(to top, var(--bg), transparent); }
.mu-ident { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: -54px; padding: 0 22px; }
.mu-ring { position: relative; width: 108px; height: 108px; border-radius: 50%; flex: none; }
.mu-ring::before { content: ''; position: absolute; inset: -5px; border-radius: 50%; background: conic-gradient(var(--g1), var(--g2), var(--ink), var(--g1)); animation: muSpin 8s linear infinite; }
.mu-ring::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; box-shadow: 0 0 22px var(--g1); opacity: .45; animation: muGlow 3.6s ease-in-out infinite; }
.mu-avatar { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--bg); display: grid; place-items: center; font-size: 34px; font-weight: 800; color: var(--on-g); background: linear-gradient(135deg, var(--g1), var(--g2)); }
.mu-name-row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.mu-name { margin: 0; font-size: clamp(22px, 6vw, 28px); line-height: 1.15; font-weight: 800; letter-spacing: -0.01em; color: var(--ink); overflow-wrap: anywhere; }
.mu-mega { position: absolute; top: 12px; right: 14px; z-index: 4; display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 999px; font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--on-g); background: linear-gradient(120deg, var(--g1), var(--g2)); border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 6px 18px -6px var(--g1), inset 0 1px 0 rgba(255,255,255,0.4); overflow: hidden; }
.mu-mega::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.7), transparent); transform: skewX(-20deg); animation: muShine 4.5s ease-in-out infinite; }
.mu-pro { background: linear-gradient(135deg, var(--g1), var(--g2)); color: var(--on-g); font-size: 9px; font-weight: 800; padding: 3px 9px; border-radius: 999px; letter-spacing: .14em; box-shadow: 0 0 12px -2px var(--g1); white-space: nowrap; }
.mu-handle { margin-top: 8px; display: inline-flex; align-items: center; max-width: 100%; padding: 5px 13px; border-radius: 999px; font-size: 13px; font-weight: 700; color: var(--g1); background: var(--glass); border: 1px solid var(--glass-bd); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mu-meta { margin: 8px 0 0; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; color: var(--ink-soft); }
.mu-meta svg { flex: none; color: var(--g1); }
.mu-tags { margin: 12px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; }
.mu-tag { font-size: 11.5px; padding: 5px 11px; border-radius: 9px; border: 1px solid var(--glass-bd); background: var(--glass); color: var(--ink); }
.mu-stack { display: flex; flex-direction: column; gap: 12px; padding: 18px 20px 22px; margin-top: auto; }
.mu-panel { border-radius: 18px; border: 1px solid var(--glass-bd); background: var(--glass); -webkit-backdrop-filter: blur(14px) saturate(140%); backdrop-filter: blur(14px) saturate(140%); box-shadow: inset 0 1px 0 var(--glass-hi), 0 8px 24px -12px rgba(0,0,0,0.35); padding: 14px 16px; }
.mu-bio { margin: 0; font-size: 14px; line-height: 1.6; color: var(--ink); text-align: center; overflow-wrap: anywhere; }
.mu-panel-title { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft); }
.mu-panel-title::before, .mu-panel-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--glass-bd)); }
.mu-panel-title::after { background: linear-gradient(270deg, transparent, var(--glass-bd)); }
.mu-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.mu-clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.mu-more { display: block; margin: 8px auto 0; padding: 4px 12px; border-radius: 999px; border: 1px solid var(--glass-bd); background: transparent; color: var(--g1); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.mu-more:focus-visible { outline: 2px solid var(--g1); outline-offset: 2px; }
.mu-links[data-many='true'] { gap: 8px; }
.mu-links[data-many='true'] > button { width: 42px !important; height: 42px !important; }
.mu-links[data-scroll='true'] { max-height: 200px; overflow-y: auto; padding: 4px; }
.mu-links[data-layout='vertical'] { flex-direction: column; align-items: center; }
.mu-card .hexagonal-border { clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%); }
.mu-card .square-border { border-radius: 12px; }
.mu-card .diamond-border { clip-path: polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%); }
.mu-card .octagon-border { clip-path: polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%); }
.mu-card .shield-border { clip-path: polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%); }
.mu-card .squircle-border { border-radius: 38%; }
.mu-card .leaf-border { border-radius: 50% 4px 50% 4px; }
.mu-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 8px; border-radius: 22px; background: color-mix(in srgb, var(--bg) 86%, transparent); border: 1px solid var(--glass-bd); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: 0 10px 26px -14px rgba(0,0,0,.55); }
.mu-btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 14px; border-radius: 15px; font-family: inherit; font-size: 13px; font-weight: 800; letter-spacing: .04em; white-space: nowrap; cursor: pointer; border: 1px solid transparent; transition: transform 170ms ease, box-shadow 170ms ease, background 170ms ease; -webkit-tap-highlight-color: transparent; }
.mu-btn:hover { transform: translateY(-2px); }
.mu-btn:active { transform: scale(.97); }
.mu-btn:focus-visible, .mu-backbtn:focus-visible { outline: 2px solid var(--g1); outline-offset: 3px; }
.mu-primary { background: linear-gradient(120deg, var(--g1), var(--g2)); color: var(--on-g); box-shadow: 0 8px 22px -8px var(--g1); }
.mu-primary:hover { box-shadow: 0 12px 28px -8px var(--g1); }
.mu-primary::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.6), transparent); transform: skewX(-20deg); animation: muShine 6s ease-in-out infinite; animation-delay: 2s; pointer-events: none; }
.mu-ghost { background: color-mix(in srgb, var(--bg) 78%, var(--ink) 12%); color: var(--ink); border: 1.5px solid color-mix(in srgb, var(--ink) 38%, transparent); }
.mu-ghost:hover { border-color: var(--g1); }
.mu-wide { grid-column: 1 / -1; }
.mu-pop { opacity: 0; transform: translateY(10px); animation: muPop 560ms cubic-bezier(.22,.61,.36,1) forwards; animation-delay: calc(var(--ed, 0ms) + var(--d, 0ms)); }
.mu-gyro { display: block; margin: 0 auto 12px; min-height: 40px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #E8F7FF; border-radius: 999px; padding: 6px 16px; font: inherit; font-size: 11px; cursor: pointer; letter-spacing: 1px; }

/* back */
.mu-back-content { padding: 18px 20px 22px; align-items: center; text-align: center; gap: 14px; }
.mu-back-top { width: 100%; display: flex; align-items: center; justify-content: space-between; }
.mu-brand { font-weight: 800; font-size: 18px; color: var(--ink); }
.mu-brand b { color: var(--g1); font-weight: 800; }
.mu-backbtn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--glass-bd); background: var(--glass); color: var(--ink); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 170ms; }
.mu-backbtn:hover { transform: translateX(-2px); }
.mu-qr { width: min(236px, 64vw); aspect-ratio: 1; background: #fff; border-radius: 20px; padding: 8px; box-shadow: 0 14px 34px -10px rgba(0,0,0,0.5), 0 0 0 4px var(--glass-bd), 0 0 28px -4px var(--g1); animation: muQr 700ms 250ms cubic-bezier(.22,.61,.36,1) both; }
.mu-qr svg { width: 100%; height: 100%; display: block; }
.mu-scan { width: 100%; display: flex; align-items: center; gap: 10px; margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .14em; color: var(--ink); }
.mu-scan::before, .mu-scan::after { content: ''; flex: 1; height: 1px; background: var(--glass-bd); }
.mu-url { margin: 0; font-size: 13px; color: var(--ink-soft); overflow-wrap: anywhere; }
.mu-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

@keyframes muEnter { to { opacity: 1; transform: none; } }
@keyframes muPop { to { opacity: 1; transform: none; } }
@keyframes muQr { from { opacity: 0; transform: scale(.85) rotate(-3deg); } to { opacity: 1; transform: none; } }
@keyframes muSpin { to { transform: rotate(360deg); } }
@keyframes muRingRotate { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes muGlow { 0%,100% { opacity: .3; } 50% { opacity: .75; } }
@keyframes muGradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes muSway { 0%,100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
@keyframes muDrift { from { transform: translateX(-10px); } to { transform: translateX(10px); } }
@keyframes muDash { to { stroke-dashoffset: -20; } }
@keyframes muShine { 0%,70% { left: -60%; } 100% { left: 130%; } }
@keyframes muFloat { 0% { opacity: 0; transform: translate(0,0); } 20% { opacity: .8; } 80% { opacity: .5; } 100% { opacity: 0; transform: translate(var(--dx), -140px); } }
@keyframes muFirefly { 0% { opacity: 0; transform: translate(0,0); } 25% { opacity: 1; } 50% { opacity: .2; } 75% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), -60px); } }
@keyframes muPetal { 0% { opacity: 0; transform: translate(0,0) rotate(0); } 12% { opacity: .9; } 85% { opacity: .6; } 100% { opacity: 0; transform: translate(var(--dx), 420px) rotate(300deg); } }

@media (hover: none) { .mu-btn:hover, .mu-backbtn:hover { transform: none; } }
@media (max-width: 380px) { .mu-actions { gap: 8px; } .mu-btn { font-size: 12px; padding: 0 8px; } .mu-stack, .mu-back-content { padding-left: 14px; padding-right: 14px; } }
@media (prefers-reduced-motion: reduce) {
  .mu-enter, .mu-pop, .mu-qr { animation: none; opacity: 1; transform: none; }
  .mu-banner, .mu-ring::before, .mu-ring::after, .mu-sway, .mu-drift, .mu-rings, .mu-dash, .mu-primary::after, .mu-mega::after, .mu-pro-ring::before { animation: none; }
  .mu-p { display: none; }
  .mu-tilt { transform: none; }
  .mu-l1, .mu-l2, .mu-l3 { transform: none; }
  .mu-face { transition: opacity 200ms linear; filter: none !important; transform: none !important; }
  .mu-back { transition: opacity 200ms linear, visibility 0s linear 200ms; }
  .mu-btn, .mu-backbtn { transition: none; }
}
`;
