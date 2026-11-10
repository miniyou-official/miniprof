'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { updateProfile } from '@/lib/auth'
import { checkPlatformLink, useLinkFinder } from '@/lib/socialLinks'
import { FREE_TAGS, INTEREST_OPTIONS } from '@/lib/cardDetails'
import ProgressLoader from '@/components/ProgressLoader'

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', emoji: '📸' },
  { id: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@channel',  emoji: '🎬' },
  { id: 'twitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/username', emoji: '🐦' },
  { id: 'github',    label: 'GitHub',    placeholder: 'https://github.com/username',   emoji: '💻' },
  { id: 'discord',   label: 'Discord',   placeholder: 'https://discord.gg/invite',     emoji: '🎮' },
  { id: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/you',   emoji: '💼' },
]

const IDENTITIES = [
  {
    id: 'boi',
    name: 'MiniBoi',
    emoji: '🎮',
    tagline: 'Bold. Built different. Here to win.',
    welcome: "Let's go. Your profile is about to go legendary.",
    tag: 'Fire Energy',
    border: 'rgba(0,200,255,0.45)',
    bg: 'rgba(0,120,255,0.07)',
    glow: 'rgba(0,200,255,0.4)',
    shine: 'linear-gradient(135deg,rgba(0,200,255,0.1),transparent)',
    nameGrad: 'linear-gradient(135deg,#00c8ff,#0066ff)',
    tagBg: 'rgba(0,200,255,0.12)',
    tagColor: '#00c8ff',
    themes: ['Iron Man','Cyberpunk','Gaming','Thor'],
    themeColors: ['rgba(255,100,0,0.15)','rgba(26,209,255,0.12)','rgba(0,255,80,0.12)','rgba(100,180,255,0.12)'],
    themeText: ['#ff7744','#1AD1FF','#00ff80','#88aaff'],
    defaultTheme: 'cyberpunk',
  },
  {
    id: 'gurl',
    name: 'MiniGurl',
    emoji: '✨',
    tagline: 'Fierce. Iconic. Unapologetically her.',
    welcome: 'Iconic. Your MiniYou card is about to be everything.',
    tag: 'Star Energy',
    border: 'rgba(255,80,180,0.45)',
    bg: 'rgba(255,50,150,0.07)',
    glow: 'rgba(255,80,180,0.4)',
    shine: 'linear-gradient(135deg,rgba(255,80,180,0.1),transparent)',
    nameGrad: 'linear-gradient(135deg,#ff50b4,#ffaadd)',
    tagBg: 'rgba(255,80,180,0.12)',
    tagColor: '#ff88cc',
    themes: ['Sakura','Anime','Minimal','Crystal'],
    themeColors: ['rgba(255,140,190,0.15)','rgba(255,160,50,0.12)','rgba(200,200,255,0.12)','rgba(180,100,255,0.12)'],
    themeText: ['#ff88cc','#ffaa44','#ccccff','#cc88ff'],
    defaultTheme: 'sakura',
  },
  {
    id: 'x',
    name: 'MiniX',
    emoji: '🌀',
    tagline: 'Beyond labels. Pure energy.',
    welcome: 'No limits. No boxes. Just pure MiniYou energy.',
    tag: 'Void Energy',
    border: 'rgba(0,255,180,0.4)',
    bg: 'rgba(0,200,140,0.07)',
    glow: 'rgba(0,255,180,0.4)',
    shine: 'linear-gradient(135deg,rgba(0,255,180,0.1),transparent)',
    nameGrad: 'linear-gradient(135deg,#00ffb4,#00ddff)',
    tagBg: 'rgba(0,255,180,0.1)',
    tagColor: '#00ffb4',
    themes: ['Cyberpunk','Crystal','Matrix','Galaxy'],
    themeColors: ['rgba(26,209,255,0.12)','rgba(180,100,255,0.12)','rgba(0,255,80,0.12)','rgba(140,80,255,0.12)'],
    themeText: ['#1AD1FF','#cc88ff','#00ff80','#aa66ff'],
    defaultTheme: 'cyberpunk',
  },
]

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,10,0.97)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 12, overflow: 'auto',
  },
  outer: {
    position: 'relative',
    width: 'min(480px, 100vw - 24px)',
  },
  rotBorder: {
    position: 'absolute', zIndex: -1,
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 'calc(100% + 2px)', height: 'calc(100% + 2px)',
    backgroundImage: 'linear-gradient(0deg,rgba(26,209,255,0.8) -50%,rgba(76,141,255,0.4) 100%)',
    borderRadius: '1.1rem', overflow: 'hidden',
  },
  rotInner: {
    position: 'absolute',
    top: '50%', left: '50%',
    width: '200%', height: '10rem',
    backgroundImage: 'linear-gradient(0deg,transparent 0%,#1AD1FF 40%,#4C8DFF 60%,transparent 100%)',
    transformOrigin: 'center',
  },
  card: {
    background: '#05060A',
    backgroundImage: `
      radial-gradient(at 0% 64%,rgba(76,141,255,0.32) 0px,transparent 85%),
      radial-gradient(at 100% 99%,rgba(26,209,255,0.22) 0px,transparent 85%),
      radial-gradient(at 41% 94%,rgba(130,0,255,0.15) 0px,transparent 85%)
    `,
    borderRadius: '1.1rem',
    boxShadow: '0 -16px 24px 0 rgba(26,209,255,0.1) inset',
    padding: 'clamp(20px,4vw,32px)',
    display: 'flex', flexDirection: 'column', gap: 20,
    fontFamily: 'inherit',
  },
  badge: {
    background: 'linear-gradient(135deg,rgba(76,141,255,0.14),rgba(26,209,255,0.14))',
    border: '1px solid rgba(26,209,255,0.32)',
    color: '#1AD1FF', fontSize: 9, letterSpacing: 4,
    borderRadius: 999, padding: '5px 16px',
    display: 'inline-block', width: 'fit-content',
  },
  divider: { height: 1, background: 'rgba(26,209,255,0.1)', border: 'none', margin: 0 },
  input: {
    width: '100%', background: '#05060A',
    border: '1px solid rgba(26,209,255,0.25)',
    borderRadius: 8, padding: '10px 14px',
    color: '#EAF6FF', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  label: { fontSize: 11, color: '#8FA3B8', display: 'block', marginBottom: 6, letterSpacing: 1 },
  primaryBtn: {
    width: '100%', padding: '12px',
    backgroundImage: 'linear-gradient(0deg,rgba(76,141,255,1) 0%,rgba(26,209,255,0.8) 100%)',
    color: '#fff', border: 'none', borderRadius: 9999,
    fontSize: 13, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'inherit', letterSpacing: 0.5,
    boxShadow: 'inset 0 -2px 25px -4px rgba(255,255,255,0.2)',
    transition: 'opacity 0.2s, transform 0.2s',
  },
  ghostBtn: {
    width: '100%', padding: '10px',
    background: 'transparent', color: '#8FA3B8',
    border: '1px solid rgba(26,209,255,0.2)',
    borderRadius: 9999, fontSize: 12, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
}

// ─── STEP DOTS ────────────────────────────────────────────────────────────────

function StepDots({ current, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(26,209,255,0.4)' }}>
        STEP {current} OF {total}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            height: 6, borderRadius: 3,
            width: i + 1 === current ? 20 : 6,
            background: i + 1 <= current ? '#1AD1FF' : 'rgba(26,209,255,0.15)',
            boxShadow: i + 1 === current ? '0 0 8px rgba(26,209,255,0.5)' : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Onboarding({ profile, onComplete }) {
  const [step, setStep] = useState(1)
  const [identity, setIdentity] = useState(null)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [activeLinks, setActiveLinks] = useState({})
  const [title, setTitle] = useState(profile.design?.details?.title || '')
  const [organization, setOrganization] = useState(profile.design?.details?.organization || '')
  const [interests, setInterests] = useState(Array.isArray(profile.design?.details?.skills) ? profile.design.details.skills.slice(0, FREE_TAGS) : [])
  const [customInterest, setCustomInterest] = useState('')
  const hasInterest = (t) => interests.some(i => i.toLowerCase() === t.toLowerCase())
  const toggleInterest = (t) => {
    if (hasInterest(t)) setInterests(prev => prev.filter(i => i.toLowerCase() !== t.toLowerCase()))
    else if (interests.length >= FREE_TAGS) toast(`Pick up to ${FREE_TAGS}. Pro lets you show more later.`)
    else setInterests(prev => [...prev, t])
  }
  const addCustomInterest = () => {
    const t = customInterest.trim().replace(/\s+/g, ' ').slice(0, 24)
    if (!t) return
    if (!hasInterest(t)) toggleInterest(t)
    setCustomInterest('')
  }
  const [saving, setSaving] = useState(false)

  const selectedId = IDENTITIES.find(i => i.id === identity)

  const togglePlatform = (id) => {
    setActiveLinks(prev => ({ ...prev, [id]: prev[id] === undefined ? '' : undefined }))
  }
  const setLinkUrl = (id, url) => {
    setActiveLinks(prev => ({ ...prev, [id]: url }))
  }

  // Open the app in a small window, read the link they copy, fill it in and close that window
  const [saveTarget, setSaveTarget] = useState(null)
  const finder = useLinkFinder({
    onLink: (platform, url) => {
      setLinkUrl(platform, url)
      toast.success('Link added')
    },
  })

  const handleComplete = async () => {
    setSaving(true)
    setSaveTarget(12)
    try {
      // Check every link before saving, and save the clean version
      const socialLinks = []
      const bad = []
      PLATFORMS.forEach(p => {
        const raw = activeLinks[p.id]
        if (raw === undefined || raw === '') return
        const result = checkPlatformLink(raw, p.id)
        if (result.ok) {
          socialLinks.push({ platform: p.id, url: result.url, label: p.label, clickAction: 'direct', iconShape: 'rounded' })
        } else {
          bad.push(p.label)
        }
      })
      if (bad.length) {
        toast.error(`Check your ${bad.join(', ')} link`)
        setSaveTarget(null)
        setSaving(false)
        setStep(4)
        return
      }
      setSaveTarget(55)
      await updateProfile(profile.id, {
        full_name: fullName, bio,
        identity: identity,
        design: {
          ...(profile.design || {}),
          details: { ...(profile.design?.details || {}), title: title.trim(), organization: organization.trim(), skills: interests },
        },
        socialLinks,
        onboarding_complete: true,
      })
      setSaveTarget(100)
      await new Promise(r => setTimeout(r, 550))
      onComplete()
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error(err)
      toast.error('We could not save your profile. Please try again.')
    } finally {
      setSaveTarget(null)
      setSaving(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://www.miniyou.co.in/${profile.nickname}`)
    toast.success('Link copied')
  }

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  }

  return (
    <div style={S.overlay}>
      <style>{`
        @keyframes rotate { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes floatEmoji { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-8px) } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1 } 100% { transform: translateY(100px) rotate(720deg); opacity: 0 } }
        .id-card-inner:hover { opacity: 0.88 !important; transform: scale(1.02) !important; }
        .float-emoji { animation: floatEmoji 3s ease-in-out infinite; display: inline-block; }
        .primary-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ghost-btn:hover { border-color: rgba(26,209,255,0.45) !important; }
        input:focus { border-color: rgba(26,209,255,0.6) !important; box-shadow: 0 0 0 2px rgba(26,209,255,0.08); }
        .platform-btn:hover { opacity: 0.9; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,209,255,0.15); border-radius: 2px; }
      `}</style>

      {saveTarget !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'grid', placeItems: 'center', background: 'rgba(5,6,10,0.9)', backdropFilter: 'blur(6px)' }}>
          <ProgressLoader target={saveTarget} label={saveTarget >= 100 ? 'All set' : 'Saving your profile'} hint="Almost there" />
        </div>
      )}

      <div style={S.outer}>
        {/* rotating border */}
        <div style={S.rotBorder}>
          <div style={{ ...S.rotInner, animation: 'rotate 8s linear infinite' }} />
        </div>

        <div style={S.card}>

          {/* ── STEP 1 — Identity ── */}
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                <StepDots current={1} total={5} />

                <div style={{ textAlign: 'center' }}>
                  <div style={S.badge}>Welcome to MiniYou</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#EAF6FF', marginTop: 12, marginBottom: 6, lineHeight: 1.25 }}>
                    Pick your starting style
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(102,255,255,0.6)', lineHeight: 1.6 }}>
                    You can change this any time.
                  </div>
                </div>

                <hr style={S.divider} />

                {/* identity cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {IDENTITIES.map(id => {
                    const sel = identity === id.id
                    return (
                      <div
                        key={id.id}
                        className="id-card-inner"
                        onClick={() => setIdentity(id.id)}
                        style={{
                          borderRadius: 14, padding: '14px 8px 12px',
                          textAlign: 'center', cursor: 'pointer',
                          border: `1.5px solid ${sel ? id.border : 'rgba(255,255,255,0.08)'}`,
                          background: sel ? id.bg : 'rgba(255,255,255,0.02)',
                          boxShadow: sel ? `0 0 20px ${id.glow}` : 'none',
                          transform: sel ? 'scale(1.05)' : 'scale(1)',
                          opacity: identity && !sel ? 0.5 : 1,
                          transition: 'all 0.25s',
                        }}
                      >
                        <div className="float-emoji" style={{ fontSize: 30, marginBottom: 8, animationDelay: `${IDENTITIES.indexOf(id) * 0.3}s` }}>{id.emoji}</div>
                        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.5, marginBottom: 4, background: id.nameGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{id.name}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, marginBottom: 8 }}>{id.tagline}</div>
                        <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 999, background: id.tagBg, color: id.tagColor, border: `1px solid ${id.border}`, fontWeight: 700 }}>{id.tag}</span>
                      </div>
                    )
                  })}
                </div>

                {/* welcome preview */}
                <AnimatePresence>
                {identity && selectedId && (
                  <motion.div
                    key={identity}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{ borderRadius: 12, padding: '14px 16px', border: `1px solid ${selectedId.border}`, background: selectedId.bg }}
                  >
                    <div style={{ fontSize: 10, letterSpacing: 1, color: selectedId.tagColor, marginBottom: 6 }}>
                      {selectedId.emoji} WELCOME, {selectedId.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: '#EAF6FF', marginBottom: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{selectedId.welcome}"
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: 1 }}>RECOMMENDED THEMES</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {selectedId.themes.map((t, i) => (
                        <span key={t} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: selectedId.themeColors[i], color: selectedId.themeText[i], border: `1px solid ${selectedId.themeText[i].replace(')', ',0.3)').replace('#', 'rgba(').replace(/([0-9a-f]{2})/gi, (m) => parseInt(m, 16) + ',')}` }}>{t}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>

                <button
                  className="primary-btn"
                  style={S.primaryBtn}
                  onClick={() => setStep(2)}
                  disabled={!identity}
                >
                  Continue as {selectedId ? selectedId.name : '...'} →
                </button>

              </div>
            </motion.div>
          )}

          {/* ── STEP 2 — Name & Bio ── */}
          {step === 2 && (
            <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                <StepDots current={2} total={5} />

                <div>
                  <div style={S.badge}>✦ YOUR IDENTITY</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EAF6FF', marginTop: 12, marginBottom: 4, lineHeight: 1.25 }}>
                    Tell us about you {selectedId?.emoji}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(102,255,255,0.6)', lineHeight: 1.6 }}>
                    This shows on your public MiniYou card
                  </div>
                </div>

                <hr style={S.divider} />

                <div>
                  <label style={S.label}>YOUR NAME</label>
                  <input
                    style={S.input}
                    placeholder="e.g. Robo Shankar"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={S.label}>Short bio</label>
                  <input
                    style={S.input}
                    placeholder="e.g. Developer from Chennai 🚀"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    maxLength={100}
                  />
                  <div style={{ fontSize: 10, color: 'rgba(102,255,255,0.35)', textAlign: 'right', marginTop: 4 }}>
                    {bio.length}/100
                  </div>
                </div>

                <div>
                  <label style={S.label}>What you do</label>
                  <input style={S.input} placeholder="e.g. Product Designer" value={title} onChange={e => setTitle(e.target.value)} maxLength={60} />
                </div>

                <div>
                  <label style={S.label}>Organisation</label>
                  <input style={S.input} placeholder="e.g. Your company or college" value={organization} onChange={e => setOrganization(e.target.value)} maxLength={60} />
                </div>

                <button
                  className="primary-btn"
                  style={S.primaryBtn}
                  onClick={() => setStep(3)}
                  disabled={!fullName.trim()}
                >
                  Next — Pick your interests →
                </button>
                <button className="ghost-btn" style={S.ghostBtn} onClick={() => setStep(1)}>← Back</button>

              </div>
            </motion.div>
          )}

          {/* ── STEP 3 — Interests ── */}
          {step === 3 && (
            <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <StepDots current={3} total={5} />

                <div>
                  <div style={S.badge}>✦ INTERESTS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EAF6FF', marginTop: 12, marginBottom: 4, lineHeight: 1.25 }}>
                    What are you into?
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(102,255,255,0.6)', lineHeight: 1.6 }}>
                    Pick up to {FREE_TAGS}. They show on your card, so people know what to talk to you about.
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group" aria-label="Interests">
                  {[...INTEREST_OPTIONS, ...interests.filter(i => !INTEREST_OPTIONS.some(o => o.toLowerCase() === i.toLowerCase()))].map(t => {
                    const on = hasInterest(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleInterest(t)}
                        style={{
                          padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          border: `1px solid ${on ? '#1AD1FF' : 'rgba(255,255,255,0.18)'}`,
                          background: on ? 'rgba(26,209,255,0.16)' : 'transparent',
                          color: on ? '#1AD1FF' : '#EAF6FF',
                        }}
                      >
                        {on ? '✓ ' : ''}{t}
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={S.input}
                    placeholder="Add your own"
                    value={customInterest}
                    maxLength={24}
                    onChange={e => setCustomInterest(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomInterest() } }}
                  />
                  <button type="button" onClick={addCustomInterest} className="ghost-btn" style={{ ...S.ghostBtn, marginTop: 0, width: 'auto', padding: '0 18px' }}>Add</button>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(102,255,255,0.5)', textAlign: 'right' }}>{interests.length}/{FREE_TAGS} picked</div>

                <button className="primary-btn" style={S.primaryBtn} onClick={() => setStep(4)}>
                  {interests.length ? 'Next — Add your links →' : 'Skip — Add your links →'}
                </button>
                <button className="ghost-btn" style={S.ghostBtn} onClick={() => setStep(2)}>← Back</button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 — Links ── */}
          {step === 4 && (
            <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <StepDots current={4} total={5} />

                <div>
                  <div style={S.badge}>✦ YOUR LINKS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EAF6FF', marginTop: 12, marginBottom: 4, lineHeight: 1.25 }}>
                    Add your links 🔗
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(102,255,255,0.6)', lineHeight: 1.6 }}>
                    Where can people find you?
                  </div>
                </div>

                <hr style={S.divider} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PLATFORMS.map(p => {
                    const active = activeLinks[p.id] !== undefined
                    return (
                      <div key={p.id}>
                        <button
                          className="platform-btn"
                          onClick={() => togglePlatform(p.id)}
                          style={{
                            width: '100%', padding: '10px 14px',
                            background: active ? 'rgba(26,209,255,0.07)' : 'rgba(0,0,0,0.4)',
                            border: `1px solid ${active ? 'rgba(26,209,255,0.4)' : 'rgba(26,209,255,0.15)'}`,
                            borderRadius: active ? '8px 8px 0 0' : 8,
                            color: active ? '#1AD1FF' : '#8FA3B8',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            textAlign: 'left', transition: 'all 0.2s',
                            fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}
                        >
                          <span>{p.emoji}</span>
                          <span style={{ flex: 1 }}>{p.label}</span>
                          <span style={{ fontSize: 14, opacity: 0.7 }}>{active ? '✓' : '+'}</span>
                        </button>
                        <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            {(() => {
                              const value = activeLinks[p.id] || ''
                              const check = value ? checkPlatformLink(value, p.id) : null
                              const waiting = finder.waitingFor === p.id
                              return (
                                <div style={{ border: '1px solid rgba(26,209,255,0.4)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(26,209,255,0.04)' }}>
                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => finder.open(p.id)}
                                      style={{ flex: '1 1 150px', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(26,209,255,0.45)', background: 'rgba(26,209,255,0.12)', color: '#1AD1FF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                      {waiting ? `Reopen ${p.label} ↗` : `Find my ${p.label} link ↗`}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => finder.paste(p.id)}
                                      style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', color: '#EAF6FF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                      Paste
                                    </button>
                                  </div>
                                  {waiting && finder.note && (
                                    <div style={{ fontSize: 11, color: '#8FA3B8', lineHeight: 1.5 }}>{finder.note}</div>
                                  )}
                                  <input
                                    style={{ ...S.input, borderRadius: 8 }}
                                    placeholder={p.placeholder}
                                    value={value}
                                    onChange={e => setLinkUrl(p.id, e.target.value)}
                                    onBlur={() => { if (check && check.ok && check.url !== value) setLinkUrl(p.id, check.url) }}
                                  />
                                  {check && (
                                    <div aria-live="polite" style={{ fontSize: 11, fontWeight: 700, color: check.ok ? '#34D399' : '#FF8FA3' }}>
                                      {check.ok ? '✓ Link looks good. It will be saved to your card.' : check.reason}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </motion.div>
                        )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>

                <button className="primary-btn" style={S.primaryBtn} onClick={() => setStep(5)}>
                  Next →
                </button>
                <button className="ghost-btn" style={S.ghostBtn} onClick={() => setStep(5)}>
                  Skip for now
                </button>
                <button className="ghost-btn" style={{ ...S.ghostBtn, marginTop: 0 }} onClick={() => setStep(3)}>← Back</button>

              </div>
            </motion.div>
          )}

          {/* ── STEP 4 — Done ── */}
          {step === 5 && (
            <motion.div key="s5" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                <StepDots current={5} total={5} />

                <div style={{ textAlign: 'center' }}>
                  <div style={S.badge}>✦ YOU'RE ALL SET</div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    style={{ fontSize: 52, margin: '16px 0 8px' }}
                  >
                    🚀
                  </motion.div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#EAF6FF', marginBottom: 6, lineHeight: 1.25 }}>
                    {selectedId?.name} is live!
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(102,255,255,0.6)', lineHeight: 1.6 }}>
                    Your MiniYou card is ready to share with the world
                  </div>
                </div>

                <hr style={S.divider} />

                {/* profile link */}
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(26,209,255,0.2)',
                  borderRadius: 10, padding: '14px 16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, color: '#8FA3B8', marginBottom: 5, letterSpacing: 1 }}>YOUR PROFILE LINK</div>
                  <div style={{ fontSize: 13, color: '#1AD1FF', fontWeight: 700 }}>
                    miniyou.co.in/{profile.nickname}
                  </div>
                </div>

                {/* identity badge on completion */}
                {selectedId && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ borderRadius: 10, padding: '10px 14px', border: `1px solid ${selectedId.border}`, background: selectedId.bg, display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span style={{ fontSize: 20 }}>{selectedId.emoji}</span>
                    <div>
                      <div style={{ fontSize: 10, color: selectedId.tagColor, letterSpacing: 1, marginBottom: 2 }}>Style selected</div>
                      <div style={{ fontSize: 12, color: '#EAF6FF', fontWeight: 700 }}>{selectedId.name} · {selectedId.tag}</div>
                    </div>
                  </motion.div>
                )}

                {/* actions */}
                <button
                  className="primary-btn"
                  style={S.primaryBtn}
                  onClick={copyLink}
                >
                  📋 Copy My Link
                </button>

                <a
                  href={`https://wa.me/?text=Check out my MiniYou profile: https://www.miniyou.co.in/${profile.nickname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', width: '100%', padding: '11px',
                    background: '#25D366', color: '#fff', border: 'none',
                    borderRadius: 9999, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                    fontFamily: 'inherit', letterSpacing: 0.5,
                    boxSizing: 'border-box',
                  }}
                >
                  💬 Share on WhatsApp
                </a>

                <button
                  className="ghost-btn"
                  style={S.ghostBtn}
                  onClick={handleComplete}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Go to my Dashboard →'}
                </button>

              </div>
            </motion.div>
          )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}