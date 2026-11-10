'use client';

import { useRef, useState } from 'react';
import { openProTab } from '@/lib/openPro';
import toast from 'react-hot-toast';
import { Check, Lock, Trash2, Upload } from 'lucide-react';
import { updateProfile } from '@/lib/auth';
import { checkResumeFile, deleteResume, resumeUrlFor, uploadResume } from '@/lib/resume';
import { CARD_ROLES, FREE_TAGS, PRO_TAGS, INTEREST_OPTIONS, getSavedDetails } from '@/lib/cardDetails';

const field = {
    width: '100%', padding: '12px 14px', borderRadius: 12, font: 'inherit', outline: 'none',
    border: '1px solid var(--db-line)', background: 'var(--db-surface)', color: 'var(--db-ink)',
};
const label = { display: 'block', fontSize: 13, color: 'var(--db-muted)', margin: '0 0 6px' };

// Title, organisation, interests, city and role. Free gets title, organisation and 3 interests.
// Pro adds up to 6 interests, a city and a role. The card updates live as you type.
export default function CardDetailsEditor({ user, userData, setUserData, heading, note }) {
    const isPro = userData?.is_pro === true;
    const d = getSavedDetails(userData);
    const limit = isPro ? PRO_TAGS : FREE_TAGS;
    const [custom, setCustom] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);

    const set = (key, value) => setUserData((prev) => ({
        ...prev,
        design: { ...(prev.design || {}), details: { ...(prev.design?.details || {}), [key]: value } },
    }));

    // Only what fits the plan is picked; extra saved tags (from an earlier Pro plan) stay saved but unpicked here
    const picked = d.skills.slice(0, limit);
    const has = (tag) => picked.some((s) => s.toLowerCase() === tag.toLowerCase());
    const toggle = (tag) => {
        if (has(tag)) set('skills', d.skills.filter((s) => s.toLowerCase() !== tag.toLowerCase()));
        else if (picked.length >= limit) toast(isPro ? `You can pick up to ${PRO_TAGS}.` : `Free cards show ${FREE_TAGS}. Pro lets you pick ${PRO_TAGS}.`);
        else set('skills', [...picked, tag]);
    };
    const addCustom = () => {
        const tag = custom.trim().replace(/\s+/g, ' ').slice(0, 24);
        if (!tag) return;
        if (!has(tag)) toggle(tag);
        setCustom('');
    };
    const options = [...INTEREST_OPTIONS, ...picked.filter((p) => !INTEREST_OPTIONS.some((o) => o.toLowerCase() === p.toLowerCase()))];

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

    // The resume uploads straight away (it is a file, not a field); the card shows it once the upload is done
    const hasResume = !!resumeUrlFor(userData);
    const pickResume = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const problem = checkResumeFile(file);
        if (problem) { toast.error(problem); return; }
        setBusy(true);
        try {
            const updated = await uploadResume(user.id, file);
            setUserData((prev) => ({ ...prev, resume_path: updated.resume_path, updated_at: updated.updated_at }));
            toast.success('Resume added to your card.');
        } catch (err) {
            toast.error(err?.message || 'Could not upload your resume. Please try again.');
        } finally {
            setBusy(false);
        }
    };
    const removeResume = async () => {
        setBusy(true);
        try {
            const updated = await deleteResume(user.id);
            setUserData((prev) => ({ ...prev, resume_path: updated.resume_path, updated_at: updated.updated_at }));
            toast.success('Resume removed.');
        } catch (err) {
            toast.error(err?.message || 'Could not remove your resume. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const lockedNote = (
        <button type="button" onClick={openProTab} className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--db-primary)' }}>
            <Lock size={12} aria-hidden="true" /> Pro only. See MiniYou Pro
        </button>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-extrabold tracking-tight border-b pb-3" style={{ color: 'var(--db-primary)', borderColor: 'var(--db-line)' }}>{heading || 'About you'}</h3>
            {note && <p style={{ margin: '-8px 0 0', fontSize: 14, color: 'var(--db-muted)' }}>{note}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label style={label} htmlFor="cd-title">{'Title or what you do'}</label><input id="cd-title" style={field} value={d.title} maxLength={60} placeholder="e.g. Product Designer" onChange={(e) => set('title', e.target.value)} /></div>
                <div><label style={label} htmlFor="cd-org">{'Organisation'}</label><input id="cd-org" style={field} value={d.organization} maxLength={60} placeholder="e.g. Your company or college" onChange={(e) => set('organization', e.target.value)} /></div>
            </div>

            <div>
                <span style={label}>{`Interests: pick up to ${limit}`}</span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
                    {options.map((tag) => {
                        const on = has(tag);
                        return (
                            <button key={tag} type="button" onClick={() => toggle(tag)} aria-pressed={on}
                                className="px-3.5 py-2 rounded-full text-sm font-semibold border transition"
                                style={{
                                    borderColor: on ? 'var(--db-primary)' : 'var(--db-line)',
                                    background: on ? 'color-mix(in srgb, var(--db-primary) 16%, transparent)' : 'transparent',
                                    color: on ? 'var(--db-primary)' : 'var(--db-ink)',
                                }}>
                                {on ? '✓ ' : ''}{tag}
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-2 mt-3">
                    <input style={field} value={custom} maxLength={24} placeholder="Add your own"
                        onChange={(e) => setCustom(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} />
                    <button type="button" onClick={addCustom} className="px-5 rounded-xl font-bold border shrink-0" style={{ borderColor: 'var(--db-line)', color: 'var(--db-ink)' }}>Add</button>
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--db-muted)' }}>
                    {picked.length}/{limit} picked{isPro ? '' : ` · Pro lets you pick up to ${PRO_TAGS}`}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label style={label} htmlFor="cd-loc">{'City'}</label>
                    <input id="cd-loc" style={{ ...field, opacity: isPro ? 1 : 0.55 }} value={d.location} maxLength={40} placeholder="e.g. Bengaluru, India" disabled={!isPro} onChange={(e) => set('location', e.target.value)} />
                    {!isPro && lockedNote}
                </div>
                <div>
                    <label style={label} htmlFor="cd-role">{'Role'}</label>
                    <select id="cd-role" style={{ ...field, opacity: isPro ? 1 : 0.55 }} value={d.role} disabled={!isPro} onChange={(e) => set('role', e.target.value)}>
                        <option value="">No role</option>
                        {CARD_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {!isPro && lockedNote}
                </div>
            </div>

            <div>
                <span style={label}>{'Resume (PDF, up to 2 MB)'}</span>
                <div className="flex flex-wrap items-center gap-2">
                    <input ref={fileRef} id="cd-resume" type="file" accept="application/pdf,.pdf" className="hidden" onChange={pickResume} />
                    <button type="button" disabled={!isPro || busy} onClick={() => fileRef.current?.click()}
                        className="px-5 py-3 rounded-xl font-bold border inline-flex items-center gap-2 disabled:opacity-55"
                        style={{ borderColor: 'var(--db-line)', color: 'var(--db-ink)', background: 'var(--db-surface)' }}>
                        <Upload size={16} aria-hidden="true" /> {busy ? 'Working...' : hasResume ? 'Replace resume' : 'Upload resume'}
                    </button>
                    {hasResume && (
                        <>
                            <a href={resumeUrlFor(userData)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold underline" style={{ color: 'var(--db-primary)' }}>View</a>
                            <button type="button" disabled={busy} onClick={removeResume} className="px-4 py-3 rounded-xl font-bold border inline-flex items-center gap-2 disabled:opacity-55" style={{ borderColor: 'var(--db-line)', color: 'var(--db-ink)' }}>
                                <Trash2 size={16} aria-hidden="true" /> Remove
                            </button>
                        </>
                    )}
                </div>
                {!isPro && lockedNote}
                <p className="text-xs mt-1.5" style={{ color: 'var(--db-muted)' }}>
                    {hasResume ? 'Visitors see a Resume button on your card.' : 'Visitors get a Resume button on your card to download it.'}
                </p>
            </div>

            <button type="button" onClick={save} disabled={saving}
                className="w-full px-6 py-3 font-extrabold rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: saved ? '#34D399' : 'var(--db-primary)', color: 'var(--db-on-primary)', transition: 'background .3s' }}>
                <Check size={18} aria-hidden="true" /> {saving ? 'Saving...' : saved ? 'Saved' : 'Save card'}
            </button>
        </div>
    );
}
