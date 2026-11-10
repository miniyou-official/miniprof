'use client';

import { useEffect } from 'react';

const THEME = {
  BG_DARK: '#00000A',
  SURFACE_DARK: '#0F0F2A',
  PRIMARY: '#00FFFF',
  ACCENT: '#FF00FF',
  TEXT_LIGHT: '#E0FFFF',
  TEXT_MUTED: '#66FFFF',
};

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') console.error('App error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: THEME.BG_DARK,
        color: THEME.TEXT_LIGHT,
        fontFamily: 'monospace',
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl text-center space-y-6"
        style={{
          backgroundColor: THEME.SURFACE_DARK,
          border: `2px solid ${THEME.ACCENT}`,
          boxShadow: `0 0 30px ${THEME.ACCENT}40`,
        }}
      >
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold" style={{ color: THEME.ACCENT }}>
          SYSTEM ERROR
        </h1>
        <p style={{ color: THEME.TEXT_MUTED, fontSize: '0.9rem' }}>
          {'Something went wrong. Please try again.'}
        </p>
        <p className="text-sm" style={{ color: THEME.TEXT_MUTED }}>
          Something went wrong. Try again or return to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-bold text-black"
            style={{ backgroundColor: THEME.PRIMARY }}
          >
            RETRY
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-xl font-bold border-2"
            style={{
              borderColor: THEME.ACCENT,
              color: THEME.ACCENT,
            }}
          >
            HOME
          </a>
        </div>
      </div>
    </div>
  );
}
