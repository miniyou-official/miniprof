// Shared styles for the RMC artwork layers (parallax layers, sway, pulse). Used by the RMC card and the Pathways theme.
export const RMC_ART_CSS = `
.rt-art { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; animation: rtBreath 9s ease-in-out infinite; }
.rt-l1 { transform: translate(calc(var(--px,0) * -4px), calc(var(--py,0) * -3px)); transition: transform 300ms ease-out; }
.rt-l2 { transform: translate(calc(var(--px,0) * -8px), calc(var(--py,0) * -6px)); transition: transform 300ms ease-out; }
.rt-l3 { transform: translate(calc(var(--px,0) * -14px), calc(var(--py,0) * -10px)); transition: transform 300ms ease-out; }
.rt-sway { transform-box: fill-box; transform-origin: 50% 100%; animation: rtSway 7s ease-in-out infinite; animation-delay: var(--sd, 0s); }
.rt-pulse { transform-box: fill-box; transform-origin: center; animation: rtPulse 4.8s ease-in-out infinite; }
.rt-road { animation: rtRoad 4.2s ease-in-out infinite; }
@keyframes rtSway { 0%,100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
@keyframes rtPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.07); opacity: .75; } }
@keyframes rtRoad { 0%,100% { opacity: .35; } 50% { opacity: .6; } }
@keyframes rtBreath { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .rt-art, .rt-sway, .rt-pulse, .rt-road { animation: none; } .rt-l1, .rt-l2, .rt-l3 { transform: none; } }
`;
