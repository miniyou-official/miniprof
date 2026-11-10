'use client'
import { useEffect, useRef, useState } from 'react'
import HolographicCard from '../HolographicCard'

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

function useAnimationFrame(callback) {
  const rafRef = useRef(null)
  const callbackRef = useRef(callback)
  useEffect(() => { callbackRef.current = callback }, [callback])
  useEffect(() => {
    const loop = () => { callbackRef.current(); rafRef.current = requestAnimationFrame(loop) }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

// ─── SHARED CARD ON TOP OF CANVAS ─────────────────────────────────────────────

function CardOverlay({ userData, currentDesign, isOwner }) {
  return (
    // Scrolls when the card is taller than the screen (long bio, many links) instead of cutting it off.
    // margin:auto on the inner box centres a short card and keeps a tall one reachable from the top.
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', zIndex: 10, padding: '24px 16px',
      overflowY: 'auto', overscrollBehavior: 'contain',
    }}>
      <div style={{ width: '100%', maxWidth: 480, margin: 'auto' }}>
        <HolographicCard
          userData={userData}
          currentDesign={currentDesign}
          avatarFallbackText={userData?.full_name?.charAt(0) || 'U'}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}

// ─── CYBERPUNK THEME ──────────────────────────────────────────────────────────

export function CyberpunkTheme({ userData, currentDesign, isOwner, themeSettings = {} }) {
  const cvRef = useRef(null)
  const tRef = useRef(0)
  const mousePosRef = useRef({ x: 0.5, y: 0 })
  const reduced = useReducedMotion()
  const get = (key) => themeSettings[key] !== false

  const rainRef = useRef([])
  const particlesRef = useRef([])
  const scanYRef = useRef(0)

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const W = cv.offsetWidth || 380, H = cv.offsetHeight || 520
    cv.width = W; cv.height = H
    rainRef.current = Array(250).fill(0).map(() => ({ x: Math.random() * W, y: Math.random() * H, speed: 5 + Math.random() * 5, len: 8 + Math.random() * 14, alpha: 0.15 + Math.random() * 0.2 }))
    particlesRef.current = Array(80).fill(0).map(() => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, r: Math.random() * 1.5 + 0.3, hue: Math.random() > 0.5 ? 190 : 280 }))
    const onMove = (e) => { const r = cv.getBoundingClientRect(); mousePosRef.current = { x: (e.clientX - r.left) / W, y: (e.clientY - r.top) / H } }
    cv.parentElement?.addEventListener('mousemove', onMove)
    return () => cv.parentElement?.removeEventListener('mousemove', onMove)
  }, [])

  useAnimationFrame(() => {
    const cv = cvRef.current; if (!cv || reduced) return
    const ctx = cv.getContext('2d')
    const W = cv.width, H = cv.height
    tRef.current += 0.016
    const t = tRef.current
    const { x: mx, y: my } = mousePosRef.current

    ctx.fillStyle = 'rgba(2,0,10,0.2)'; ctx.fillRect(0, 0, W, H)

    if (get('grid')) {
      ctx.strokeStyle = 'rgba(0,255,255,0.05)'; ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    }
    if (get('rain')) {
      rainRef.current.forEach(r => {
        ctx.strokeStyle = `rgba(0,200,255,${r.alpha})`; ctx.lineWidth = 0.6
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 1, r.y + r.len); ctx.stroke()
        r.y += r.speed; r.x -= 0.8
        if (r.y > H) { r.y = -r.len; r.x = Math.random() * W }
      })
    }
    if (get('particles')) {
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${p.hue},100%,65%)`; ctx.fill()
      })
    }
    if (get('scanline')) {
      scanYRef.current = (scanYRef.current + 1.2) % H
      const sg = ctx.createLinearGradient(0, scanYRef.current - 20, 0, scanYRef.current + 20)
      sg.addColorStop(0, 'transparent'); sg.addColorStop(0.5, 'rgba(0,255,255,0.05)'); sg.addColorStop(1, 'transparent')
      ctx.fillStyle = sg; ctx.fillRect(0, scanYRef.current - 20, W, 40)
    }
    const g = ctx.createRadialGradient(mx * W, my * H, 0, mx * W, my * H, 120)
    g.addColorStop(0, 'rgba(0,255,255,0.06)'); g.addColorStop(0.5, 'rgba(255,0,255,0.03)'); g.addColorStop(1, 'transparent')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = `rgba(0,255,255,${0.12 + Math.sin(t) * 0.04})`; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(0, H * 0.82)
    for (let x = 0; x < W; x += 3) ctx.lineTo(x, H * 0.82 + Math.sin(x * 0.025 + t) * 10)
    ctx.stroke()
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#02000A', overflow: 'hidden' }}>
      {reduced
        ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#02000A,#0a0030)' }} />
        : <canvas ref={cvRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      }
      <CardOverlay userData={userData} currentDesign={currentDesign} isOwner={isOwner} />
    </div>
  )
}

// ─── ANIME THEME ──────────────────────────────────────────────────────────────

export function AnimeTheme({ userData, currentDesign, isOwner, themeSettings = {} }) {
  const cvRef = useRef(null)
  const tRef = useRef(0)
  const reduced = useReducedMotion()
  const get = (key) => themeSettings[key] !== false

  const particlesRef = useRef([])
  const boltsRef = useRef([])
  const btRef = useRef(0)

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const W = cv.offsetWidth || 380, H = cv.offsetHeight || 520
    cv.width = W; cv.height = H
    particlesRef.current = Array(120).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2, r: 40 + Math.random() * 100,
      speed: (Math.random() - 0.5) * 0.025, size: 1 + Math.random() * 2.5,
      hue: 20 + Math.random() * 50, alpha: 0.3 + Math.random() * 0.6, drift: Math.random() * Math.PI * 2,
    }))
  }, [])

  const KANJI = ['力', '炎', '気', '魂', '道', '夢', '闘', '光']

  useAnimationFrame(() => {
    const cv = cvRef.current; if (!cv || reduced) return
    const ctx = cv.getContext('2d')
    const W = cv.width, H = cv.height
    tRef.current += 0.016
    const t = tRef.current
    const cx = W * 0.5, cy = H * 0.44

    ctx.fillStyle = 'rgba(4,0,10,0.16)'; ctx.fillRect(0, 0, W, H)

    if (get('speedlines')) {
      for (let i = 0; i < 24; i++) {
        const a = i * (Math.PI * 2 / 24) + t * 0.06
        const r1 = 50 + Math.sin(t * 2 + i) * 6, r2 = 130 + Math.sin(t * 1.5 + i) * 18
        ctx.strokeStyle = `rgba(255,${140 + i * 3},0,${0.06 + Math.sin(t * 3 + i) * 0.03})`
        ctx.lineWidth = 0.9; ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke()
      }
    }
    if (get('aura')) {
      for (let i = 3; i >= 0; i--) {
        const pr = 52 + i * 20 + Math.sin(t * 1.8 + i) * 5
        const ag = ctx.createRadialGradient(cx, cy, pr * 0.6, cx, cy, pr)
        ag.addColorStop(0, `rgba(255,${130 + i * 22},0,0)`)
        ag.addColorStop(0.7, `rgba(255,${130 + i * 22},0,${0.1 - i * 0.02})`); ag.addColorStop(1, 'transparent')
        ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.fill()
      }
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45)
      cg.addColorStop(0, `rgba(255,210,80,${0.65 + Math.sin(t * 4) * 0.12})`)
      cg.addColorStop(0.4, 'rgba(255,130,0,0.3)'); cg.addColorStop(1, 'transparent')
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fill()
    }
    particlesRef.current.forEach(p => {
      p.angle += p.speed
      const wobble = Math.sin(t * 1.5 + p.drift) * 10
      const px = cx + Math.cos(p.angle) * (p.r + wobble)
      const py = cy + Math.sin(p.angle) * (p.r + wobble) * 0.75
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.alpha * (0.6 + Math.sin(t * 2.5 + p.drift) * 0.4)})`; ctx.fill()
    })
    if (get('lightning')) {
      btRef.current += 0.016
      if (btRef.current > 0.4 + Math.random() * 0.5) {
        btRef.current = 0
        boltsRef.current.push({ a: Math.random() * Math.PI * 2, life: 0, len: 35 + Math.random() * 40 })
      }
      boltsRef.current = boltsRef.current.filter(b => {
        b.life += 0.08
        const x1 = cx + Math.cos(b.a) * 42, y1 = cy + Math.sin(b.a) * 42
        const x2 = cx + Math.cos(b.a) * (42 + b.len), y2 = cy + Math.sin(b.a) * (42 + b.len)
        ctx.strokeStyle = `rgba(255,255,100,${0.75 * (1 - b.life)})`; ctx.lineWidth = 1.2
        ctx.beginPath(); ctx.moveTo(x1, y1)
        for (let s = 1; s <= 4; s++) {
          ctx.lineTo(x1 + (x2 - x1) * s / 4 + (Math.random() - 0.5) * 7, y1 + (y2 - y1) * s / 4 + (Math.random() - 0.5) * 7)
        }
        ctx.stroke(); return b.life < 1
      })
    }
    if (get('kanji')) {
      ctx.font = 'bold 14px serif'
      KANJI.forEach((k, i) => {
        const kx = cx + Math.cos(t * 0.25 + i * 1.26) * 105
        const ky = cy + Math.sin(t * 0.18 + i * 1.26) * 65
        ctx.fillStyle = `rgba(255,200,50,${0.14 + Math.sin(t + i) * 0.08})`
        ctx.fillText(k, kx - 6, ky + 5)
      })
    }
    for (let y = 0; y < H; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(0, y, W, 1) }
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#04000A', overflow: 'hidden' }}>
      {reduced
        ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a0030,#3d0a00)' }} />
        : <canvas ref={cvRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      }
      <CardOverlay userData={userData} currentDesign={currentDesign} isOwner={isOwner} />
    </div>
  )
}

// ─── BOOK READER THEME ────────────────────────────────────────────────────────

export function BookReaderTheme({ userData, currentDesign, isOwner, themeSettings = {} }) {
  const cvRef = useRef(null)
  const tRef = useRef(0)
  const reduced = useReducedMotion()
  const get = (key) => themeSettings[key] !== false

  const lettersRef = useRef([])
  const pagesRef = useRef([])

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const W = cv.offsetWidth || 380, H = cv.offsetHeight || 520
    cv.width = W; cv.height = H
    const CHARS = 'ABCDEFGHabcdefghαβγδ∞∑∫πΩ'
    lettersRef.current = Array(30).fill(0).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.25,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      alpha: 0.06 + Math.random() * 0.1, size: 10 + Math.random() * 14,
      rot: (Math.random() - 0.5) * 0.4,
    }))
    pagesRef.current = Array(6).fill(0).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: -0.2 - Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.02,
      alpha: 0.1 + Math.random() * 0.15, w: 20 + Math.random() * 30, h: 28 + Math.random() * 20,
    }))
  }, [])

  const CANDLES = [{ x: 0.15, y: 0.75 }, { x: 0.85, y: 0.72 }]

  useAnimationFrame(() => {
    const cv = cvRef.current; if (!cv || reduced) return
    const ctx = cv.getContext('2d')
    const W = cv.width, H = cv.height
    tRef.current += 0.016
    const t = tRef.current

    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#FFF8E7'); bg.addColorStop(0.5, '#FFF0D0'); bg.addColorStop(1, '#FFE8C0')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    for (let y = 16; y < H; y += 13) {
      ctx.strokeStyle = 'rgba(160,110,50,0.07)'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(200,80,60,0.12)'; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(24, H); ctx.stroke()

    if (get('candles')) {
      CANDLES.forEach((c, ci) => {
        const flicker = Math.sin(t * 4 + ci * 2) * 0.04
        const cg = ctx.createRadialGradient(c.x * W, c.y * H, 0, c.x * W, c.y * H, 120)
        cg.addColorStop(0, `rgba(255,200,80,${0.18 + flicker})`)
        cg.addColorStop(0.4, `rgba(255,150,50,${0.08 + flicker})`); cg.addColorStop(1, 'transparent')
        ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = `rgba(255,${180 + Math.sin(t * 6 + ci) * 20},50,${0.8 + flicker})`
        ctx.beginPath(); ctx.ellipse(c.x * W, c.y * H - 8, 3, 6 + Math.sin(t * 8 + ci) * 1.5, 0, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,240,200,0.6)'; ctx.fillRect(c.x * W - 4, c.y * H, 8, 20)
      })
    }
    if (get('pages')) {
      pagesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed
        if (p.y < -30) { p.y = H + 10; p.x = Math.random() * W }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.fillStyle = `rgba(255,248,220,${p.alpha})`; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.strokeStyle = `rgba(160,110,50,${p.alpha * 1.5})`; ctx.lineWidth = 0.5; ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h)
        for (let l = 0; l < 4; l++) {
          ctx.strokeStyle = `rgba(100,60,20,${p.alpha * 0.8})`
          ctx.beginPath(); ctx.moveTo(-p.w / 2 + 3, -p.h / 2 + 5 + l * 5); ctx.lineTo(p.w / 2 - 3, -p.h / 2 + 5 + l * 5); ctx.stroke()
        }
        ctx.restore()
      })
    }
    if (get('letters')) {
      lettersRef.current.forEach(l => {
        l.x += l.vx; l.y += l.vy
        if (l.x < 0 || l.x > W) l.vx *= -1
        if (l.y < 0 || l.y > H) l.vy *= -1
        ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot + Math.sin(t * 0.3) * 0.05)
        ctx.fillStyle = `rgba(80,40,10,${l.alpha + Math.sin(t * 0.5 + l.x) * 0.03})`
        ctx.font = `${l.size}px serif`; ctx.fillText(l.char, -l.size / 4, l.size / 3)
        ctx.restore()
      })
    }
    if (get('warmglow')) {
      const wo = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, 220)
      wo.addColorStop(0, `rgba(255,200,100,${0.06 + Math.sin(t * 0.4) * 0.02})`); wo.addColorStop(1, 'transparent')
      ctx.fillStyle = wo; ctx.fillRect(0, 0, W, H)
    }
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#FFF8E7', overflow: 'hidden' }}>
      {reduced
        ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#FFF8E7,#FFE8C0)' }} />
        : <canvas ref={cvRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      }
      <CardOverlay userData={userData} currentDesign={currentDesign} isOwner={isOwner} />
    </div>
  )
}

// ─── MARVEL THEME ─────────────────────────────────────────────────────────────

export function MarvelTheme({ userData, currentDesign, isOwner, themeSettings = {} }) {
  const cvRef = useRef(null)
  const tRef = useRef(0)
  const mousePosRef = useRef({ x: 0.5, y: 0.45 })
  const reduced = useReducedMotion()
  const get = (key) => themeSettings[key] !== false

  const blastsRef = useRef([])
  const btRef = useRef(0)
  const shieldRotRef = useRef(0)
  const energyRef = useRef([])
  const scanYRef = useRef(0)

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const W = cv.offsetWidth || 380, H = cv.offsetHeight || 520
    cv.width = W; cv.height = H
    energyRef.current = Array(50).fill(0).map(() => ({
      angle: Math.random() * Math.PI * 2, r: 15 + Math.random() * 28,
      speed: 0.04 + Math.random() * 0.07, life: Math.random(), decay: 0.008 + Math.random() * 0.015,
    }))
    const onMove = (e) => {
      const r = cv.getBoundingClientRect()
      mousePosRef.current = { x: (e.clientX - r.left) / W, y: (e.clientY - r.top) / H }
    }
    cv.parentElement?.addEventListener('mousemove', onMove)
    return () => cv.parentElement?.removeEventListener('mousemove', onMove)
  }, [])

  useAnimationFrame(() => {
    const cv = cvRef.current; if (!cv || reduced) return
    const ctx = cv.getContext('2d')
    const W = cv.width, H = cv.height
    tRef.current += 0.016
    const t = tRef.current
    const { x: mx, y: my } = mousePosRef.current
    const cx = mx * W * 0.3 + W * 0.5, cy = my * H * 0.3 + H * 0.45

    ctx.fillStyle = 'rgba(4,0,8,0.2)'; ctx.fillRect(0, 0, W, H)

    if (get('hexgrid')) {
      const hs = 22
      for (let hx = 0; hx < W + hs; hx += hs * 1.73) {
        for (let hy = 0; hy < H + hs; hy += hs * 2) {
          const offY = (Math.floor(hx / (hs * 1.73)) % 2) * hs
          const dist = Math.hypot(hx - mx * W, hy + offY - my * H)
          const glow = Math.max(0, 1 - dist / 180)
          ctx.strokeStyle = `rgba(255,${80 + glow * 80},0,${0.07 + glow * 0.2})`
          ctx.lineWidth = 0.6 + glow * 0.8; ctx.beginPath()
          for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.lineTo(hx + Math.cos(a) * hs * 0.5, hy + offY + Math.sin(a) * hs * 0.5) }
          ctx.closePath(); ctx.stroke()
        }
      }
    }
    scanYRef.current = (scanYRef.current + 1.5) % H
    const sg = ctx.createLinearGradient(0, scanYRef.current - 20, 0, scanYRef.current + 20)
    sg.addColorStop(0, 'transparent'); sg.addColorStop(0.5, 'rgba(255,100,0,0.05)'); sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg; ctx.fillRect(0, scanYRef.current - 20, W, 40)

    if (get('shield')) {
      shieldRotRef.current += 0.006
      for (let i = 0; i < 4; i++) {
        const sr = 45 + i * 18; const segs = 10 + i * 4
        for (let s = 0; s < segs; s++) {
          const a1 = (s / segs) * Math.PI * 2 + shieldRotRef.current * (i % 2 ? 1 : -1) + i
          const a2 = a1 + (0.5 / segs) * Math.PI * 2
          ctx.strokeStyle = `rgba(255,${100 + i * 20},0,${0.45 - i * 0.07})`
          ctx.lineWidth = 2 - i * 0.3; ctx.beginPath(); ctx.arc(cx, cy, sr, a1, a2); ctx.stroke()
        }
      }
    }
    if (get('reactor')) {
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28)
      ag.addColorStop(0, `rgba(255,200,100,${0.9 + Math.sin(t * 5) * 0.08})`)
      ag.addColorStop(0.3, 'rgba(255,100,0,0.55)'); ag.addColorStop(0.7, 'rgba(200,40,0,0.2)'); ag.addColorStop(1, 'transparent')
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = `rgba(255,220,150,${0.85 + Math.sin(t * 7) * 0.12})`; ctx.lineWidth = 1.8
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.6)
      ctx.beginPath()
      for (let i = 0; i < 3; i++) { const a = i * (Math.PI * 2 / 3); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16) }
      ctx.closePath(); ctx.stroke(); ctx.restore()
    }
    if (get('blasts')) {
      btRef.current += 0.016
      if (btRef.current > 0.5 + Math.random() * 0.8) {
        btRef.current = 0
        blastsRef.current.push({ x: cx, y: cy, angle: Math.random() * Math.PI * 2, len: 0, maxLen: 80 + Math.random() * 120, life: 0 })
      }
      blastsRef.current = blastsRef.current.filter(b => {
        b.life += 0.05; b.len = b.maxLen * Math.min(1, b.life * 3)
        const ex = b.x + Math.cos(b.angle) * b.len, ey = b.y + Math.sin(b.angle) * b.len
        const grad = ctx.createLinearGradient(b.x, b.y, ex, ey)
        grad.addColorStop(0, `rgba(255,200,80,${0.85 * (1 - b.life)})`)
        grad.addColorStop(0.4, `rgba(255,100,0,${0.6 * (1 - b.life)})`); grad.addColorStop(1, 'transparent')
        ctx.strokeStyle = grad; ctx.lineWidth = 2.5 * (1 - b.life * 0.6)
        ctx.beginPath(); ctx.moveTo(b.x, b.y)
        for (let s = 1; s <= 5; s++) {
          ctx.lineTo(b.x + (ex - b.x) * s / 5 + (Math.random() - 0.5) * 5, b.y + (ey - b.y) * s / 5 + (Math.random() - 0.5) * 5)
        }
        ctx.stroke()
        ctx.strokeStyle = `rgba(255,120,0,${0.15 * (1 - b.life)})`; ctx.lineWidth = 7 * (1 - b.life)
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke()
        return b.life < 1
      })
    }
    energyRef.current.forEach(e => {
      e.life += e.decay; e.angle += e.speed
      if (e.life > 1) { e.life = 0; e.angle = Math.random() * Math.PI * 2; e.r = 15 + Math.random() * 28 }
      const ex = cx + Math.cos(e.angle) * e.r * (1 + e.life * 0.4)
      const ey = cy + Math.sin(e.angle) * e.r * (1 + e.life * 0.4)
      ctx.fillStyle = `rgba(255,${120 + e.r * 3},0,${(1 - e.life) * 0.7})`
      ctx.beginPath(); ctx.arc(ex, ey, 1.5 * (1 - e.life * 0.4), 0, Math.PI * 2); ctx.fill()
    })
    ctx.strokeStyle = `rgba(255,100,0,${0.5 + Math.sin(t * 3) * 0.15})`; ctx.lineWidth = 1.5
    ;[[8, 8, 1, 1], [W - 8, 8, -1, 1], [8, H - 8, 1, -1], [W - 8, H - 8, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + sy * 18); ctx.lineTo(x, y); ctx.lineTo(x + sx * 18, y); ctx.stroke()
    })
    ctx.fillStyle = 'rgba(255,100,0,0.35)'; ctx.font = '8px monospace'
    ctx.fillText(`SUIT: MARK L  PWR: ${Math.floor(94 + Math.sin(t) * 4)}%`, 10, H - 8)
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#04000A', overflow: 'hidden' }}>
      {reduced
        ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a0500,#300800)' }} />
        : <canvas ref={cvRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      }
      <CardOverlay userData={userData} currentDesign={currentDesign} isOwner={isOwner} />
    </div>
  )
}

// ─── THEME MAP ────────────────────────────────────────────────────────────────

export const THEME_COMPONENTS = {
  cyberpunk: CyberpunkTheme,
  anime: AnimeTheme,
  bookreader: BookReaderTheme,
  marvel: MarvelTheme,
}

export function ProThemeRenderer({ themeKey, userData, currentDesign, isOwner, themeSettings }) {
  const Component = THEME_COMPONENTS[themeKey] || CyberpunkTheme
  return (
    <Component
      userData={userData}
      currentDesign={currentDesign}
      isOwner={isOwner}
      themeSettings={themeSettings || {}}
    />
  )
}
