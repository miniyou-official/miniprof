'use client'
export default function SkeletonCard() {
  const shimmer = {
    background: 'linear-gradient(90deg, #0B0D14 25%, #1a1a3a 50%, #0B0D14 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 360,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #1AD1FF22',
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>

      {/* Banner */}
      <div style={{ ...shimmer, height: 80 }} />

      {/* Avatar */}
      <div style={{ padding: '0 20px', marginTop: -32 }}>
        <div style={{
          ...shimmer,
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: '2px solid #05060A',
        }} />
      </div>

      {/* Name */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ ...shimmer, height: 18, width: '60%', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ ...shimmer, height: 13, width: '40%', borderRadius: 6, marginBottom: 12 }} />
        <div style={{ ...shimmer, height: 11, width: '80%', borderRadius: 6, marginBottom: 4 }} />
        <div style={{ ...shimmer, height: 11, width: '60%', borderRadius: 6, marginBottom: 20 }} />
      </div>

      {/* Link circles */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '0 20px 20px',
        justifyContent: 'center',
      }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            ...shimmer,
            width: 40,
            height: 40,
            borderRadius: '50%',
          }} />
        ))}
      </div>
    </div>
  )
}
