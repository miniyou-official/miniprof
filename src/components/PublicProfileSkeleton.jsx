'use client';

import { motion } from 'framer-motion';

const SHIMMER_CSS = `
@keyframes shimmer {
  0% { background-position: -600px 0 }
  100% { background-position: 600px 0 }
}
`;

function shimmerStyle(delay = 0) {
  return {
    background: 'linear-gradient(90deg, rgba(0,255,255,0.04) 25%, rgba(0,255,255,0.10) 50%, rgba(0,255,255,0.04) 75%)',
    backgroundSize: '600px 100%',
    animation: `shimmer 1.8s linear infinite`,
    animationDelay: `${delay}s`,
  };
}

export default function PublicProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen w-full p-3 sm:p-6"
      style={{ backgroundColor: '#00000A' }}
    >
      <style>{SHIMMER_CSS}</style>

      {/* Card container — matches HolographicCard max-width */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(0,255,255,0.12)',
        backgroundColor: '#0F0F2A',
      }}>
        {/* 1. Banner */}
        <div style={{ ...shimmerStyle(), height: 90, width: '100%' }} />

        {/* 2. Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -32 }}>
          <div style={{
            ...shimmerStyle(0.1),
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '3px solid #00000A',
            flexShrink: 0,
          }} />
        </div>

        <div style={{ padding: '14px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* 3. Name */}
          <div style={{ ...shimmerStyle(0.15), height: 16, width: 120, borderRadius: 6 }} />

          {/* 4. Handle */}
          <div style={{ ...shimmerStyle(0.2), height: 11, width: 80, borderRadius: 6 }} />

          {/* 5. Bio — two lines */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%', marginTop: 4 }}>
            <div style={{ ...shimmerStyle(0.25), height: 10, width: '85%', borderRadius: 6 }} />
            <div style={{ ...shimmerStyle(0.3), height: 10, width: '65%', borderRadius: 6 }} />
          </div>

          {/* 6. Social icons row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                ...shimmerStyle(0.1 * i),
                width: 36,
                height: 36,
                borderRadius: '50%',
              }} />
            ))}
          </div>

          {/* 7. Link buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 12 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{
                ...shimmerStyle(0.1 * i),
                height: 42,
                width: '100%',
                borderRadius: 12,
              }} />
            ))}
          </div>

          {/* 8. Branding */}
          <div style={{ ...shimmerStyle(0.5), height: 10, width: 120, borderRadius: 6, marginTop: 12 }} />
        </div>
      </div>
    </motion.div>
  );
}
