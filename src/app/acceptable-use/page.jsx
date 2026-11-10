'use client'
import { useRouter } from 'next/navigation'


const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
  // email: { color: '#FFC864', fontWeight: 600, textDecoration: 'underline' },
}

export default function AcceptableUsePage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0F', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Acceptable Use Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>Last updated: April 2026</p>
        <hr style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, border: 'none' }} />

        <p style={s.heading}>Prohibited Content</p>
        <p style={s.body}>The following are <span style={s.hi}>strictly prohibited:</span> phishing or malicious links, adult content, impersonation of real individuals or brands, spam profiles, hate speech, illegal content.</p>

        <p style={s.heading}>Link Safety</p>
        <p style={s.body}>All links are subject to <span style={s.hi}>automated safety checks.</span> Malicious links will be removed and your account may be suspended.</p>

        <p style={s.heading}>Enforcement</p>
        <p style={s.body}>Violations result in <span style={s.hi}>immediate account suspension or termination</span> without notice.</p>

        <p style={s.heading}>Reporting</p>
        <p style={s.body}>Use the <span style={s.hi}>Report button</span> on any public profile page to report violations.</p>
      </div>
    </div>
  )
}
