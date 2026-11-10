'use client';

import { useEffect, useRef, useState } from 'react';

const R = 52;
const C = 2 * Math.PI * R;

// A completion-style loader: a ring and a percentage that always keep moving, so waiting never feels stuck.
// `target` is how far the real work has got (0 to 100). The number eases toward it, and between steps it
// creeps forward a little, never past 96 until the work really finishes.
export default function ProgressLoader({ target = 0, label = 'Loading', hint }) {
  const [shown, setShown] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    let raf;
    let last = performance.now();
    let value = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = targetRef.current;
      if (t >= 100) {
        value += (100 - value) * (1 - Math.exp(-dt * 9));
        if (value > 99.6) value = 100;
      } else {
        value += (t - value) * (1 - Math.exp(-dt * 5));
        // keep a little life between steps
        if (value > t - 1) value = Math.min(value + dt * 2.2, Math.min(t + 10, 96));
      }
      setShown(value);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = Math.round(shown);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}
    >
      <div style={{ position: 'relative', width: 168, height: 168 }}>
        <svg viewBox="0 0 120 120" width="168" height="168" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
          <defs>
            <linearGradient id="pl-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7BE6FF" />
              <stop offset="100%" stopColor="#2A6BFF" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(26,209,255,0.16)" strokeWidth="7" />
          <circle
            cx="60" cy="60" r={R} fill="none" stroke="url(#pl-grad)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - shown / 100)}
            style={{ filter: 'drop-shadow(0 0 6px rgba(26,209,255,0.55))' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--db-ink, #EAF6FF)', fontVariantNumeric: 'tabular-nums' }}>
            {pct}<span style={{ fontSize: 20, fontWeight: 800, opacity: 0.7 }}>%</span>
          </span>
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--db-ink, #EAF6FF)' }}>{label}</p>
        {hint && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--db-muted, #8FA3B8)' }}>{hint}</p>}
      </div>
    </div>
  );
}
