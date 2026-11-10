'use client'
import { useRouter } from 'next/navigation'


const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
}

export default function CookiesPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0F', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Cookie Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>Last updated: April 2026</p>
        <hr style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, border: 'none' }} />

        <p style={s.heading}>What Are Cookies</p>
        <p style={s.body}>Cookies are small files stored on your device. <span style={s.hi}>MiniYou uses essential cookies only.</span></p>

        <p style={s.heading}>What We Use</p>
        <p style={s.body}>We use <span style={s.hi}>authentication cookies set by Supabase</span> to keep you logged in. We do not use advertising cookies, tracking pixels, or third-party analytics.</p>

        <p style={s.heading}>Your Control</p>
        <p style={s.body}>You can clear cookies through your browser at any time. <span style={s.hi}>Clearing auth cookies will log you out.</span></p>
      </div>
    </div>
  )
}
