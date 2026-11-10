'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { updateProfile } from '@/lib/auth';
import { NOTE_MAX, getSavedDetails } from '@/lib/cardDetails';
import { isValidContactPhone } from '@/components/card/cardUtils';

const field = {
    width: '100%', padding: '12px 14px', borderRadius: 12, font: 'inherit', outline: 'none',
    border: '1px solid var(--db-line)', background: 'var(--db-surface)', color: 'var(--db-ink)',
};

// One switch: what it shares, in plain words
function Toggle({ id, checked, disabled, onChange, title, hint }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer" htmlFor={id}>
            <input id={id} type="checkbox" className="mt-1 h-4 w-4" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
            <span className="text-sm" style={{ color: 'var(--db-ink)' }}>
                <b>{title}</b>
                <span className="block text-xs mt-1" style={{ color: 'var(--db-muted)' }}>{hint}</span>
            </span>
        </label>
    );
}

// What a visitor gets when they tap "Save MiniMe" on the card: your name and MiniYou link always, and only the extras you switch on.
export default function SaveMiniMeEditor({ user, userData, setUserData }) {
    const d = getSavedDetails(userData);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = (key, value) => setUserData((prev) => ({
        ...prev,
        design: { ...(prev.design || {}), details: { ...(prev.design?.details || {}), [key]: value } },
    }));

    const save = async () => {
        if (d.sharePhone && !isValidContactPhone(d.phone)) { toast.error('Add a phone number with 7 to 15 digits, or turn the phone switch off.'); return; }
        setSaving(true);
        try {
            const updated = await updateProfile(user.id, { design: userData.design });
            setUserData((prev) => ({ ...prev, ...updated }));
            toast.success('Save MiniMe settings saved.');
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            toast.error('Could not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5">
            <h3 className="text-2xl font-bold border-b-2 border-dashed pb-3" style={{ color: 'var(--db-primary)', borderColor: 'var(--db-line)' }}>{'What Save MiniMe shares'}</h3>
            <p className="text-sm" style={{ color: 'var(--db-muted)' }}>
                {'When someone taps Save MiniMe on your card, they save you to their phone with your name and your MiniYou link. Choose what else goes with it. Everything below is off until you switch it on.'}
            </p>

            <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid var(--db-line)', background: 'var(--db-surface)' }}>
                <Toggle
                    id="sm-note" checked={d.shareNote} onChange={(v) => set('shareNote', v)}
                    title="Add a note" hint="A short message saved with you, so people remember who you are, for example where you met."
                />
                {d.shareNote && (
                    <div>
                        <textarea
                            aria-label="Note" rows={3} maxLength={NOTE_MAX} value={d.note} style={{ ...field, resize: 'none' }}
                            placeholder="e.g. Met at the IEEE RMC Innovation Workshop. Let's stay in touch."
                            onChange={(e) => set('note', e.target.value.slice(0, NOTE_MAX))}
                        />
                        <p className="text-xs text-right mt-1" style={{ color: 'var(--db-muted)' }}>{d.note.length}/{NOTE_MAX}</p>
                    </div>
                )}
            </div>

            <div className="rounded-xl p-4" style={{ border: '1px solid var(--db-line)', background: 'var(--db-surface)' }}>
                <Toggle
                    id="sm-email" checked={d.shareEmail === true && !!user?.email} disabled={!user?.email}
                    onChange={(v) => { set('shareEmail', v); set('email', v ? (user?.email || '') : ''); }}
                    title="Share my email" hint={`Saves the email you log in with (${user?.email || 'your login email'}).`}
                />
            </div>

            <div className="rounded-xl p-4 space-y-3" style={{ border: '1px solid var(--db-line)', background: 'var(--db-surface)' }}>
                <Toggle
                    id="sm-phone" checked={d.sharePhone}
                    onChange={(v) => { set('sharePhone', v); if (!v) set('phone', ''); }}
                    title="Share my phone number" hint="Your number is not on your account, so add the one you want people to save. It stays private until you turn this on."
                />
                {d.sharePhone && (
                    <input
                        type="tel" inputMode="tel" autoComplete="tel" aria-label="Phone number" style={field} value={d.phone} maxLength={20}
                        placeholder="+91 98765 43210" onChange={(e) => set('phone', e.target.value)}
                    />
                )}
            </div>

            <button type="button" onClick={save} disabled={saving}
                className="w-full px-6 py-3 font-extrabold rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: saved ? '#34D399' : 'var(--db-primary)', color: 'var(--db-on-primary)', transition: 'background .3s' }}>
                <Check size={18} aria-hidden="true" /> {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
        </div>
    );
}
