// Small helpers for the RMC card. No React in here so they are easy to test.

import { openableHref } from '@/lib/linkSafety';

export const RMC_ROLES = {
  attendee: { label: 'Attendee' },
  speaker: { label: 'Speaker' },
  mentor: { label: 'Mentor' },
  organizer: { label: 'Organizer' },
};

export function getRoleLabel(role) {
  return (RMC_ROLES[role] || RMC_ROLES.attendee).label;
}

export function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// Only links that pass the shared safety rules are shown (https, right site, no tricks).
export function safeUrl(url, platform) {
  return openableHref(url, platform || 'custom');
}

function escapeVCard(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

// Builds a vCard from the fields that are really present. No email or phone is invented.
export function buildVCard({ fullName, title, organization, profileUrl }) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  lines.push(`FN:${escapeVCard(fullName || 'MiniYou contact')}`);
  if (organization) lines.push(`ORG:${escapeVCard(organization)}`);
  if (title) lines.push(`TITLE:${escapeVCard(title)}`);
  if (profileUrl) lines.push(`URL:${profileUrl}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export const RMC_ROLE_ORDER = ['attendee', 'mentor', 'speaker', 'organizer'];

// RMC details live inside the profile's design object (design.rmc), so no database change is needed.
export function getRmcDetails(userData) {
  const d = userData?.design?.rmc || {};
  // Someone who made their card in regular MiniYou has their title, organisation and interests there; use them when the RMC ones are empty
  const c = userData?.design?.details || {};
  const skills = Array.isArray(d.skills) && d.skills.length ? d.skills : (Array.isArray(c.skills) ? c.skills : []);
  return {
    role: RMC_ROLES[d.role] ? d.role : 'attendee',
    title: d.title || c.title || '',
    organization: d.organization || c.organization || '',
    location: d.location || c.location || '',
    skills: skills.filter(Boolean).slice(0, 6),
    session_title: d.session_title || '',
    session_time: d.session_time || '',
  };
}
