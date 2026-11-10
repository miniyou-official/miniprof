import { openableHref } from '@/lib/linkSafety';

// Small helpers for the profile card: initials, safe link targets and the vCard file.

// Link icon shapes. The first three are free; the rest show only on a Pro card (a free card falls back to the hexagon).
export const FREE_ICON_SHAPES = ['rounded', 'circle', 'square'];
export const PRO_ICON_SHAPES = ['diamond', 'octagon', 'shield', 'squircle', 'leaf'];

export function getInitials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'M';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

// Only open links that pass the same rules used when saving them (https only, right site for the app, no tricks).
// Plain mailto: and tel: links are allowed. Pass the link's platform so an app icon cannot point at another site.
export function safeHref(raw, platform) {
    return openableHref(raw, platform || 'custom');
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const EMAIL = /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9.\-]{1,100}\.[A-Za-z]{2,}$/;
export const isValidContactEmail = (value) => typeof value === 'string' && EMAIL.test(value.trim());

// A phone number: an optional +, then 7 to 15 digits (spaces, dashes and brackets are allowed while typing)
export const cleanPhone = (value) => (typeof value === 'string' ? value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '') : '');
export const isValidContactPhone = (value) => /^\+?\d{7,15}$/.test(cleanPhone(value));

// The file a visitor saves as "Save MiniMe": name, a note from the owner with their MiniYou link, and only what the owner chose to share (email, phone).
export function buildVCard({ fullName, title, organization, profileUrl, email, phone, note }) {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${esc(fullName)}`, `N:${esc(fullName)};;;;`];
    if (organization) lines.push(`ORG:${esc(organization)}`);
    if (title) lines.push(`TITLE:${esc(title)}`);
    if (isValidContactEmail(email)) lines.push(`EMAIL;TYPE=INTERNET:${email.trim()}`);
    if (isValidContactPhone(phone)) lines.push(`TEL;TYPE=CELL:${cleanPhone(phone)}`);
    if (typeof profileUrl === 'string' && /^https:\/\/[A-Za-z0-9._~:/?#@!$&()*+=%-]+$/.test(profileUrl)) lines.push(`URL:${profileUrl}`);
    const link = typeof profileUrl === 'string' && /^https:\/\//.test(profileUrl) ? profileUrl : '';
    const message = [typeof note === 'string' ? note.trim() : '', link ? `My MiniYou: ${link}` : ''].filter(Boolean).join('\n');
    if (message) lines.push(`NOTE:${esc(message)}`);
    lines.push('END:VCARD');
    return lines.join('\r\n');
}
