import Link from 'next/link';

const THEME = {
  BG_DARK: '#00000A',
  SURFACE_DARK: '#0F0F2A',
  PRIMARY: '#00FFFF',
  ACCENT: '#FF00FF',
  TEXT_LIGHT: '#E0FFFF',
  TEXT_MUTED: '#66FFFF',
};

export default function NotFound() {
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
          border: `2px solid ${THEME.PRIMARY}`,
          boxShadow: `0 0 30px ${THEME.PRIMARY}40`,
        }}
      >
        <div className="text-7xl font-bold" style={{ color: THEME.PRIMARY }}>404</div>
        <h1 className="text-xl font-bold" style={{ color: THEME.TEXT_LIGHT }}>
          Page not found
        </h1>
        <p style={{ color: THEME.TEXT_MUTED, fontSize: '0.9rem' }}>
          {'This page does not exist or has moved.'}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl font-bold text-black"
          style={{ backgroundColor: THEME.PRIMARY }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
