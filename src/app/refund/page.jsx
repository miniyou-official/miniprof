'use client'
import { useRouter } from 'next/navigation'

const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
  email: { color: '#FFC864', fontWeight: 600, textDecoration: 'underline' },
}

export default function RefundPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0F', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Refund Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>Last updated: November 2026</p>
        <hr style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, border: 'none' }} />

        <p style={s.heading}>No Refund Policy</p>
        <p style={s.body}>All payments for ProYou subscription are <span style={s.hi}>final and non-refundable.</span> By completing payment you acknowledge no refunds will be issued under any circumstances.</p>

        <p style={s.heading}>Why No Refunds</p>
        <p style={s.body}>ProYou is a digital subscription. Upon payment you receive <span style={s.hi}>immediate access to all premium features.</span> Due to the nature of digital services we cannot offer refunds once access is granted.</p>

        <p style={s.heading}>Renewal</p>
        <p style={s.body}>Pro is a subscription that <span style={s.hi}>renews automatically</span> every month or every year, depending on the plan you choose, until you cancel it.</p>

        <p style={s.heading}>Cancellation</p>
        <p style={s.body}>You may cancel your subscription at any time from dashboard settings. Cancellation stops future charges. <span style={s.hi}>Access continues until end of billing period.</span> You can subscribe again whenever you like.</p>

        <p style={s.heading}>Exceptions</p>
        <p style={s.body}>In case of a duplicate charge or technical error on our part, contact <a href="mailto:miniyou.official@gmail.com" style={s.email}>miniyou.official@gmail.com</a> within 48 hours.</p>
      </div>
    </div>
  )
}
