'use client'
import { useRouter } from 'next/navigation'
import { BUSINESS } from '@/lib/business'
import { PLANS, formatRupees } from '@/lib/billing/plans'

const s = {
  heading: { color: '#7FF7FF', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, marginTop: 40 },
  body: { color: '#BFE6FF', fontSize: 17, lineHeight: 1.8 },
  hi: { color: '#FFFFFF', fontWeight: 700 },
  email: { color: '#FFC864', fontWeight: 600, textDecoration: 'underline' },
}

export default function TermsPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#00000A', color: '#E0FFFF', fontFamily: 'var(--font-geist-sans)' }}>
      <button onClick={() => router.back()} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, background: 'rgba(15,15,42,0.9)', border: '1px solid rgba(0,255,255,0.2)', color: '#66FFFF', borderRadius: 999, padding: '8px 16px', fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.2)', color: '#00FFFF', fontSize: 12, letterSpacing: 3, borderRadius: 999, padding: '5px 14px', display: 'inline-block', marginBottom: 16 }}>LEGAL</div>
        <h1 style={{ color: '#E0FFFF', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 48 }}>Last updated: November 2026</p>
        <hr style={{ height: 1, background: 'rgba(0,255,255,0.08)', marginBottom: 40, border: 'none' }} />

        <p style={s.heading}>About MiniYou</p>
        <p style={s.body}>MiniYou is an <span style={s.hi}>online software service (SaaS)</span> that lets you create a digital profile card: a personal web page with your details, your links and a QR code that you can share. The basic service is free. An optional Pro subscription unlocks premium card designs and animations.</p>

        <p style={s.heading}>Acceptance</p>
        <p style={s.body}>By creating a MiniYou account you agree to these terms. <span style={s.hi}>If you do not agree, do not use MiniYou.</span></p>

        <p style={s.heading}>Your Account</p>
        <p style={s.body}>You are responsible for your account security. You must provide accurate information. You must be <span style={s.hi}>at least 10 years old</span> to use MiniYou.</p>

        <p style={s.heading}>Acceptable Use</p>
        <p style={s.body}>You may not use MiniYou to share malicious or phishing links, impersonate real people or brands, spam, or scrape other profiles. <span style={s.hi}>Violations result in immediate account termination.</span></p>

        <p style={s.heading}>Your Content</p>
        <p style={s.body}><span style={s.hi}>You own your content.</span> By using MiniYou you grant us a licence to display it on our platform.</p>

        <p style={s.heading}>Our Rights</p>
        <p style={s.body}>We may suspend accounts that violate these terms without prior notice. We may modify features at any time.</p>

        <p style={s.heading}>Pro Subscription and Payments</p>
        <p style={s.body}>MiniYou is free to use. Pro is an optional paid subscription at <span style={s.hi}>{formatRupees(PLANS.monthly.price)} per month or {formatRupees(PLANS.yearly.price)} per year</span>, prices inclusive of applicable taxes. Payments are processed securely by our payment partner; we never see or store your card or UPI details.</p>
        <p style={s.body}>Your subscription <span style={s.hi}>renews automatically</span> at the end of each billing period until you cancel. You can cancel at any time; Pro stays active until the end of the period you have paid for. Refunds are covered by our <a href="/refund" style={s.email}>Refund Policy</a>.</p>
        <p style={s.body}>If we change Pro prices, the new price applies only from your next renewal, and we will tell you before it does.</p>

        <p style={s.heading}>Limitation of Liability</p>
        <p style={s.body}>MiniYou is provided as-is. We are not liable for damages from your use of the platform.</p>

        <p style={s.heading}>Governing Law</p>
        <p style={s.body}>These terms are governed by the laws of India. Disputes are subject to the courts of <span style={s.hi}>Chennai, Tamil Nadu.</span></p>

        <p style={s.heading}>Contact</p>
        <p style={s.body}>Questions about these terms: <a href={`mailto:${BUSINESS.email}`} style={s.email}>{BUSINESS.email}</a></p>
      </div>
    </div>
  )
}
