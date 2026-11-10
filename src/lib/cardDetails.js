import { isValidContactEmail, isValidContactPhone, cleanPhone } from '@/components/card/cardUtils';
import { resumeUrlFor } from '@/lib/resume';

// Extra details on a normal card. They live inside the profile's design object (design.details),
// so no database change is needed. What shows depends on the plan:
//   Free: title, organisation and up to 3 interest tags
//   Pro:  up to 6 interest tags, city and a simple role

export const FREE_TAGS = 3;
export const PRO_TAGS = 6;
export const NOTE_MAX = 160;

// Interests people pick from (they can also add their own)
export const INTEREST_OPTIONS = [
    'Design', 'Technology', 'Startups', 'Music', 'Photography', 'Writing', 'Travel', 'Fitness',
    'Art', 'Gaming', 'Education', 'Finance', 'Marketing', 'Food', 'Film', 'Sports',
    'Fashion', 'Wellness', 'Books', 'Community',
];

// A fixed list, so nobody can invent an official-looking role such as "Organizer" on a public card
export const CARD_ROLES = ['Student', 'Founder', 'Creator', 'Developer', 'Designer', 'Professional'];

// What was saved, whatever the plan
export function getSavedDetails(userData) {
    const d = userData?.design?.details || {};
    return {
        title: typeof d.title === 'string' ? d.title : '',
        organization: typeof d.organization === 'string' ? d.organization : '',
        location: typeof d.location === 'string' ? d.location : '',
        role: CARD_ROLES.includes(d.role) ? d.role : '',
        skills: Array.isArray(d.skills) ? d.skills.filter((s) => typeof s === 'string' && s.trim()).slice(0, PRO_TAGS) : [],
        // The login email is private. It is only ever copied here when the owner turns on "Include my email".
        shareEmail: d.shareEmail === true,
        email: typeof d.email === 'string' ? d.email.trim().slice(0, 120) : '',
        // What "Save MiniMe" carries besides the name and link. Each part is the owner's choice and off by default.
        shareNote: d.shareNote === true,
        note: typeof d.note === 'string' ? d.note.slice(0, NOTE_MAX) : '',
        sharePhone: d.sharePhone === true,
        phone: typeof d.phone === 'string' ? d.phone.slice(0, 20) : '',
    };
}

// What the card shows. Pro-only details stay saved but hide if Pro lapses, and return when it is renewed.
export function getCardDetails(userData) {
    const saved = getSavedDetails(userData);
    const isPro = userData?.is_pro === true;
    return {
        title: saved.title,
        organization: saved.organization,
        skills: saved.skills.slice(0, isPro ? PRO_TAGS : FREE_TAGS),
        location: isPro ? saved.location : '',
        role: isPro ? saved.role : '',
        email: saved.shareEmail && isValidContactEmail(saved.email) ? saved.email : '',
        note: saved.shareNote ? saved.note.trim() : '',
        phone: saved.sharePhone && isValidContactPhone(saved.phone) ? cleanPhone(saved.phone) : '',
        // The resume button only shows while the owner is Pro; the file stays and returns if Pro is renewed
        resumeUrl: isPro ? resumeUrlFor(userData) : '',
    };
}
