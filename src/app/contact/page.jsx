'use client'
import { useRouter } from 'next/navigation'
import { BUSINESS } from '@/lib/business'

const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
  email: { color: '#FFC864', fontWeight: 600, textDecoration: 'underline' },
}

export default function ContactPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0F', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>CONTACT</div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Contact Us</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>We usually reply within 2 working days.</p>
        <hr style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, border: 'none' }} />

        <p style={s.heading}>Who we are</p>
        <p style={s.body}>{BUSINESS.brand} is based in {BUSINESS.city}, India.</p>

        <p style={s.heading}>Email</p>
        <p style={s.body}>General questions: <a href={`mailto:${BUSINESS.email}`} style={s.email}>{BUSINESS.email}</a></p>
        <p style={s.body}>Payments and refunds: <a href={`mailto:${BUSINESS.billingEmail}`} style={s.email}>{BUSINESS.billingEmail}</a></p>

        {BUSINESS.phone && (
          <>
            <p style={s.heading}>Phone</p>
            <p style={s.body}>{BUSINESS.phone}</p>
          </>
        )}

        {BUSINESS.address && (
          <>
            <p style={s.heading}>Address for correspondence</p>
            <p style={s.body}>{BUSINESS.address}</p>
          </>
        )}

        <p style={s.heading}>Complaints and privacy requests</p>
        <p style={s.body}>Write to <a href={`mailto:${BUSINESS.email}`} style={s.email}>{BUSINESS.email}</a> with the subject &quot;Grievance&quot;. We acknowledge every complaint within 48 hours.</p>
      </div>
    </div>
  )
}
