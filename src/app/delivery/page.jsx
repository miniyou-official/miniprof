'use client'
import { useRouter } from 'next/navigation'
import { BUSINESS } from '@/lib/business'

const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
  email: { color: '#FFC864', fontWeight: 600, textDecoration: 'underline' },
}

export default function DeliveryPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0F', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Shipping &amp; Delivery Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>Last updated: November 2026</p>
        <hr style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, border: 'none' }} />

        <p style={s.heading}>Nothing is shipped</p>
        <p style={s.body}>{BUSINESS.brand} sells a <span style={s.hi}>digital service only</span>. No physical goods are sent, so there are no shipping charges.</p>

        <p style={s.heading}>When you get access</p>
        <p style={s.body}>Pro features are switched on in your account <span style={s.hi}>as soon as your payment is confirmed</span>, usually within a few minutes. You will see them in your dashboard the next time it loads.</p>

        <p style={s.heading}>If access does not appear</p>
        <p style={s.body}>If Pro is not active within 24 hours of a successful payment, email <a href={`mailto:${BUSINESS.billingEmail}`} style={s.email}>{BUSINESS.billingEmail}</a> with your username and payment reference, and we will fix it or refund you.</p>
      </div>
    </div>
  )
}
