'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { updateProfile } from '@/lib/auth';
import { getWsDetails, wsHasSession, wsRoleLabel, WS_EVENT_FULL_NAME } from '@/lib/workshopRole';

// Colours are the dashboard's own tokens, so this works in both dark and light mode
const INK = 'var(--db-ink)';
const MUTED = 'var(--db-muted)';
const LINE = 'var(--db-line)';
const field = { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${LINE}`, background: 'var(--db-surface)', color: INK, outline: 'none', font: 'inherit' };
const label = { display: 'block', fontSize: 13, color: MUTED, margin: '0 0 6px' };

// Title, organisation, city, interests and (for speakers and panelists) the session, for the Innovation and Entrepreneurial Workshop card.
// Saved inside the profile's design object (design.ws), next to the role, so no database change is needed. The card updates live as you type.
export default function IewDetailsEditor({ user, userData, setUserData }) {
    const d = getWsDetails(userData);
    const [skillsText, setSkillsText] = useState(d.skills.join(', '));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = (key, value) => setUserData((prev) => ({ ...prev, design: { ...(prev.design || {}), ws: { ...(prev.design?.ws || {}), [key]: value } } }));

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

    const speaks = wsHasSession(d.role);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold border-b-2 border-dashed pb-3" style={{ color: 'var(--db-primary)', borderColor: LINE }}>{'Workshop card details'}</h3>
            <p style={{ margin: '-8px 0 0', fontSize: 14, color: MUTED }}>{`This section is only for your ${WS_EVENT_FULL_NAME} card (${wsRoleLabel(d.role)}). What you write here shows on that card, not on your regular MiniYou card. Everything is optional, so fill in what you like.`}</p>

            <div><label style={label} htmlFor="iew-title">{'Title or what you do'}</label><input id="iew-title" style={field} value={d.title} maxLength={60} placeholder="e.g. Product Designer" onChange={(e) => set('title', e.target.value)} /></div>
            <div><label style={label} htmlFor="iew-org">{'Organisation'}</label><input id="iew-org" style={field} value={d.organization} maxLength={60} placeholder="e.g. Your company or college" onChange={(e) => set('organization', e.target.value)} /></div>
            <div><label style={label} htmlFor="iew-loc">{'City'}</label><input id="iew-loc" style={field} value={d.location} maxLength={40} placeholder="e.g. Bengaluru, India" onChange={(e) => set('location', e.target.value)} /></div>
            <div>
                <label style={label} htmlFor="iew-skills">{'Interests'}</label>
                <input id="iew-skills" style={field} value={skillsText} placeholder="e.g. Funding, Startups, Technology" onChange={(e) => onSkills(e.target.value)} />
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: MUTED }}>{'Shown as small tags on your card. Separate with commas, up to 6.'}</p>
            </div>

            {speaks && (
                <div className="rounded-xl p-4 space-y-4" style={{ border: `1px solid ${LINE}`, background: 'var(--db-surface)' }}>
                    <div>
                        <strong style={{ color: INK }}>{d.role === 'panelist' ? 'Your panel at the workshop' : 'Your session at the workshop'}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: MUTED }}>{'Shows on the front of your card, so people know what you are speaking about and when to find you.'}</p>
                    </div>
                    <div><label style={label} htmlFor="iew-st">{d.role === 'panelist' ? 'What is the panel called?' : 'What is your session called?'}</label><input id="iew-st" style={field} value={d.session_title} maxLength={80} placeholder="e.g. Funding the Entrepreneurial Journey" onChange={(e) => set('session_title', e.target.value)} /></div>
                    <div><label style={label} htmlFor="iew-sw">{'When?'}</label><input id="iew-sw" style={field} value={d.session_time} maxLength={60} placeholder="e.g. 2:00 PM" onChange={(e) => set('session_time', e.target.value)} /></div>
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
