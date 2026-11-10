'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { IS_RMC } from '@/lib/edition'

// Pages that are real app routes. Any other single-segment path is someone's public card.
const APP_ROUTES = ['login', 'signup', 'dashboard', 'privacy', 'terms', 'cookies', 'refund', 'proyou', 'rmc-themes', 'forgot-password', 'reset-password', 'acceptable-use', 'auth', 'api', 'q', 'community']

const BLUE = '#1AD1FF'

// A slim notice, not a wall: one row, about 60px tall on phones, so it never covers the page.
export default function CookieConsent() {
  const pathname = usePathname() || '/'
  // In the event edition the public card link shows only the card, so no banner there (visitors get no cookies)
  const isPublicCard = pathname.startsWith('/rmc2026/') || (IS_RMC && /^\/[^/]+$/.test(pathname) && !APP_ROUTES.includes(pathname.slice(1)))
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('miniyou_cookies_accepted')
      if (!accepted) setVisible(true)
    } catch (e) {
      setVisible(true)
    }
  }, [])

  const save = (value) => {
    try { localStorage.setItem('miniyou_cookies_accepted', value) } catch (e) { /* private mode: just close it */ }
    setVisible(false)
  }

  if (isPublicCard) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Cookie notice"
          className="mycookie"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <style>{`
            .mycookie { position: fixed; z-index: 9999; left: 10px; right: 10px; bottom: max(10px, env(safe-area-inset-bottom)); margin: 0 auto; max-width: 460px;
              display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 14px; border-radius: 20px; color: #fff;
              background: rgba(11,13,20,0.94); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
              border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 24px 60px -24px rgba(26,209,255,0.4);
              font-family: var(--font-geist-sans), system-ui, sans-serif; }
            @media (min-width: 640px) { .mycookie { left: auto; right: 24px; bottom: 24px; margin: 0; width: 460px; } }
            @media (max-width: 399px) { .mycookie .ck-shield { display: none; } .mycookie { padding-left: 12px; } }
            .mycookie a { color: ${BLUE}; text-decoration: underline; text-underline-offset: 2px; }
            .mycookie button { min-height: 44px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: inherit; }
            .mycookie button:focus-visible, .mycookie a:focus-visible { outline: 2px solid ${BLUE}; outline-offset: 2px; }
          `}</style>

          <Shield className="ck-shield" size={18} color={BLUE} style={{ flexShrink: 0 }} aria-hidden="true" />

          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Essential cookies only</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.62)', whiteSpace: 'nowrap' }}>No tracking · <a href="/cookies">Cookie Policy</a></div>
          </div>

          <button onClick={() => save('declined')} style={{ padding: '0 8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)' }}>
            Decline
          </button>
          <button onClick={() => save('true')} style={{ padding: '0 14px', background: BLUE, border: 'none', color: '#05060A', boxShadow: `0 8px 24px -8px ${BLUE}` }}>
            Accept
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
