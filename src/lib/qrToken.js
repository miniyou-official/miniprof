// Short-lived signed codes for QR links. Server only (uses Node crypto).
//
// A QR holds https://miniyou.co.in/q/<token>. The token says "the owner of <nickname> showed this
// QR for their profile (or one of their links) until <time>". Anyone can read the token, nobody
// can forge or extend it without QR_SIGNING_SECRET. Expired tokens stop working, so an old photo
// or screenshot of a QR cannot be reused later.
import crypto from 'crypto';

export const QR_TTL_MS = 5 * 60 * 1000;
const b64u = (buf) => Buffer.from(buf).toString('base64url');

function getSecret() {
    const s = process.env.QR_SIGNING_SECRET;
    return s && s.length >= 32 ? s : null;
}

export function isQrSigningConfigured() {
    return getSecret() !== null;
}

// Short fingerprint of a link URL, so a token for link #2 stops working if that link is edited
export function linkFingerprint(url) {
    return crypto.createHash('sha256').update(String(url || '')).digest('hex').slice(0, 8);
}

function sign(payload, secret) {
    return b64u(crypto.createHmac('sha256', secret).update(payload).digest()).slice(0, 27);
}

// kind: 'p' (profile) or 'l' (one link). index/fp are only used for links.
export function signQrToken({ nickname, kind, index = 0, fp = '', now = Date.now() }) {
    const secret = getSecret();
    if (!secret) throw new Error('QR signing is not configured');
    const exp = now + QR_TTL_MS;
    const payload = b64u([kind, nickname, index, fp, exp.toString(36)].join('|'));
    return { token: `${payload}.${sign(payload, secret)}`, expiresAt: exp };
}

// Returns { ok: true, kind, nickname, index, fp } or { ok: false, reason }
export function verifyQrToken(token, now = Date.now()) {
    const secret = getSecret();
    if (!secret) return { ok: false, reason: 'not-configured' };
    if (typeof token !== 'string' || token.length > 300) return { ok: false, reason: 'invalid' };
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return { ok: false, reason: 'invalid' };

    const expected = sign(payload, secret);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: 'invalid' };

    let parts;
    try {
        parts = Buffer.from(payload, 'base64url').toString('utf8').split('|');
    } catch {
        return { ok: false, reason: 'invalid' };
    }
    const [kind, nickname, index, fp, expRaw] = parts;
    const exp = parseInt(expRaw, 36);
    if (!['p', 'l'].includes(kind) || !nickname || !Number.isFinite(exp)) return { ok: false, reason: 'invalid' };
    if (now > exp) return { ok: false, reason: 'expired', nickname, kind };
    return { ok: true, kind, nickname, index: parseInt(index, 10) || 0, fp };
}
