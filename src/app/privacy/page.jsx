'use client'
import { useRouter } from 'next/navigation'

const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
  email: { color: '#FFC864', fontWeight: 600, textDecoration: 'underline' },
}

export default function PrivacyPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0F', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>Last updated: November 2026</p>
        <hr style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40, border: 'none' }} />

        <p style={s.body}>MiniYou is an online tool for creating a digital profile card. This policy explains what data the service uses and why.</p>

        <p style={s.heading}>What We Collect</p>
        <p style={s.body}>We collect your <span style={s.hi}>full name, nickname, email, bio, avatar, and the links you add to your card</span> when you create an account. We also collect profile view counts and link click data for analytics.</p>

        <p style={s.heading}>How We Use It</p>
        <p style={s.body}>Your data is used solely to operate your MiniYou profile. <span style={s.hi}>We DO NOT SELL YOUR DATA</span> or use it for advertising. Your profile is publicly visible only by your shareable link.</p>

        <p style={s.heading}>Data Security</p>
        <p style={s.body}>All connections are TLS-encrypted. Auth tokens are stored in secure cookies.</p>

        <p style={s.heading}>Your Rights (DPDP Act 2023)</p>
        <p style={s.body}>Under India's <span style={s.hi}>Digital Personal Data Protection Act 2023</span> you may access or correct your data from your dashboard, and ask us to permanently delete your account and data by emailing <a href="mailto:support@miniyou.co.in" style={s.email}>support@miniyou.co.in</a>. We act on deletion requests within 30 days.</p>

        <p style={s.heading}>Payments</p>
        <p style={s.body}>If you subscribe to Pro, your payment is handled by <span style={s.hi}>Razorpay</span>. We receive only the payment status and a reference number. <span style={s.hi}>We never see or store your card, bank or UPI details.</span></p>

        <p style={s.heading}>Third Parties</p>
        <p style={s.body}>We use <span style={s.hi}>Supabase</span> for database and auth, <span style={s.hi}>DiceBear</span> for avatars, <span style={s.hi}>Vercel</span> for hosting, and <span style={s.hi}>Razorpay</span> for payments. Each operates under their own privacy policy.</p>

        <p style={s.heading}>Contact</p>
        <p style={s.body}><a href="mailto:support@miniyou.co.in" style={s.email}>support@miniyou.co.in</a></p>
      </div>
    </div>
  )
}
