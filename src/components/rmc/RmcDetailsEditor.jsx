'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { updateProfile } from '@/lib/auth';
import { RMC_THEMES, ROLE_TO_THEME } from './themes';
import { RMC_ROLE_ORDER, getRmcDetails, getRoleLabel } from './rmcUtils';

// Colours are the dashboard's own tokens, so this works in both dark and light mode
const INK = 'var(--db-ink)';
const MUTED = 'var(--db-muted)';
const LINE = 'var(--db-line)';
const field = { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${LINE}`, background: 'var(--db-surface)', color: INK, outline: 'none', font: 'inherit' };
const label = { display: 'block', fontSize: 13, color: MUTED, margin: '0 0 6px' };

// Role, title, organisation, location and interests for the RMC 2026 card.
// Saved inside the profile's design object, and the card updates live as you type.
export default function RmcDetailsEditor({ user, userData, setUserData, showRole = true }) {
    const d = getRmcDetails(userData);
    const [skillsText, setSkillsText] = useState(d.skills.join(', '));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = (key, value) => setUserData((prev) => ({ ...prev, design: { ...(prev.design || {}), rmc: { ...(prev.design?.rmc || {}), [key]: value } } }));

    const onSkills = (text) => {
        setSkillsText(text);
        set('skills', text.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6));
    };

    const save = async () => {
        setSaving(true);
        try {
            const updated = await updateProfile(user.id, { design: userData.design });
            setUserData((prev) => ({ ...prev, ...updated }));
            toast.success('Card saved.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            toast.error('Could not save your card. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold border-b-2 border-dashed pb-3" style={{ color: 'var(--db-primary)', borderColor: LINE }}>{showRole ? 'Your RMC 2026 card' : 'IEEE RMC 2026 card details'}</h3>
            {!showRole && <p style={{ margin: '-8px 0 0', fontSize: 14, color: MUTED }}>{'This section is only for your IEEE RMC 2026 card. What you write here shows on that card, not on your regular MiniYou card. Everything is optional, so fill in what you like.'}</p>}

            {showRole && (
            <div>
                <span style={label}>{'I am joining as'}</span>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Role">
                    {RMC_ROLE_ORDER.map((role) => {
                        const theme = RMC_THEMES[ROLE_TO_THEME[role]];
                        const on = d.role === role;
                        return (
                            <button key={role} type="button" role="radio" aria-checked={on} onClick={() => set('role', role)}
                                className="text-left rounded-xl p-3 border-2 transition"
                                style={{ borderColor: on ? 'var(--db-primary)' : LINE, background: on ? 'color-mix(in srgb, var(--db-primary) 12%, transparent)' : 'var(--db-surface)', color: INK, boxShadow: 'none' }}>
                                <span className="flex items-center justify-between gap-2">
                                    <strong style={{ color: on ? 'var(--db-primary)' : INK }}>{getRoleLabel(role)}</strong>
                                    <span className="flex gap-1" aria-hidden="true">{theme.palette.slice(0, 3).map((c) => <i key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid var(--db-line)' }} />)}</span>
                                </span>
                                <span className="block text-xs mt-1" style={{ color: MUTED }}>{theme.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            )}

            <div><label style={label} htmlFor="rmc-title">{'Title or what you do'}</label><input id="rmc-title" style={field} value={d.title} maxLength={60} placeholder="e.g. Product Designer" onChange={(e) => set('title', e.target.value)} /></div>
            <div><label style={label} htmlFor="rmc-org">{'Organisation'}</label><input id="rmc-org" style={field} value={d.organization} maxLength={60} placeholder="e.g. Your company or college" onChange={(e) => set('organization', e.target.value)} /></div>
            <div><label style={label} htmlFor="rmc-loc">{'City'}</label><input id="rmc-loc" style={field} value={d.location} maxLength={40} placeholder="e.g. Bengaluru, India" onChange={(e) => set('location', e.target.value)} /></div>
            <div>
                <label style={label} htmlFor="rmc-skills">{'Interests'}</label>
                <input id="rmc-skills" style={field} value={skillsText} placeholder="e.g. Design, Mentorship, Technology" onChange={(e) => onSkills(e.target.value)} />
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: MUTED }}>{'Shown as small tags on your card. Separate with commas, up to 6.'}</p>
            </div>


            {d.role === 'speaker' && (
                <div className="rounded-xl p-4 space-y-4" style={{ border: `1px solid ${LINE}`, background: 'var(--db-surface)' }}>
                    <div>
                        <strong style={{ color: INK }}>{'Your session at IEEE RMC 2026'}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: MUTED }}>{'Shows on the front of your card, so people know what you are speaking about and when to find you.'}</p>
                    </div>
                    <div><label style={label} htmlFor="rmc-st">{'What is your session called?'}</label><input id="rmc-st" style={field} value={d.session_title} maxLength={80} placeholder="e.g. Rebuilding momentum after a career break" onChange={(e) => set('session_title', e.target.value)} /></div>
                    <div><label style={label} htmlFor="rmc-sw">{'When and where?'}</label><input id="rmc-sw" style={field} value={d.session_time} maxLength={60} placeholder="e.g. Day 1, 11:30 AM, Hall A" onChange={(e) => set('session_time', e.target.value)} /></div>
                </div>
            )}

            <button type="button" onClick={save} disabled={saving}
                className="w-full px-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: saved ? '#34D399' : 'var(--db-primary)', color: 'var(--db-on-primary)' }}>
                <Check size={18} aria-hidden="true" /> {saving ? 'Saving...' : saved ? 'Saved' : 'Save card'}
            </button>
        </div>
    );
}
