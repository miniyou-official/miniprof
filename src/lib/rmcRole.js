// IEEE RMC special roles. Someone who opens the official /rmc-roles link picks one; it adds the "RMC 2026" look to the top of their
// designs and makes it their card (Pathways for speakers, Community for organizers, Balance for mentors). They can pick any other look later. The role is stored inside the card design (design.rmc.role), where the RMC card designs already read it, so it needs no extra database column.

import { IEW_INTENT_KEY } from './workshopRole';
import { attendeeLinkInTab } from './attendeeLink';

// The look name saved in design.theme for the RMC 2026 card. It is not one of the regular MiniYou themes.
export const RMC_THEME_KEY = 'rmc2026';

// Remembers a logged-out visitor came from the /rmc-roles link, so login brings them back to it.
export const RMC_INTENT_KEY = 'miniyou:wants-rmc-role';

// Same theme design for all three; only the accent colours change
export const RMC_ROLES = {
    speaker: { label: 'Speaker', blurb: 'You are on the programme and take the stage.', g1: '#FFB020', g2: '#FF6A3D' },
    organizer: { label: 'Organizer', blurb: 'You help run the event behind the scenes.', g1: '#22D3A6', g2: '#1D9BF0' },
    mentor: { label: 'Mentor', blurb: 'You guide and support the people who attend.', g1: '#B07CFF', g2: '#FF5CA8' },
};

// A role picked before the visitor has an account. Kept in localStorage so it survives the sign-up email link opening in another tab.
export const RMC_PENDING_KEY = 'miniyou:rmc-pending-role';

export const isRmcRole = (value) => typeof value === 'string' && Object.hasOwn(RMC_ROLES, value);

// After login or Google sign-in the app normally opens the dashboard; a visitor who came from /rmc-roles goes back there instead
export function rmcReturnPath(path) {
    if (path !== '/dashboard') return path;
    const attendee = attendeeLinkInTab();
    if (attendee) return attendee;
    try {
        if (sessionStorage.getItem(RMC_INTENT_KEY)) return '/rmc-roles';
        if (sessionStorage.getItem(IEW_INTENT_KEY)) return '/iew-roles';
    } catch { /* storage can be blocked */ }
    return path;
}

// The role saved on a card design, or null
// The four RMC card roles. Speaker, organizer and mentor are chosen on /rmc-roles; attendee is unlocked on the event day.
export const RMC_CARD_ROLES = ['speaker', 'organizer', 'mentor', 'attendee'];
const ROLE_LABELS = { speaker: 'Speaker', organizer: 'Organizer', mentor: 'Mentor', attendee: 'Attendee' };
export const roleLabel = (role) => ROLE_LABELS[role] || '';
export const roleOf = (design) => (RMC_CARD_ROLES.includes(design?.rmc?.role) ? design.rmc.role : null);

// Each role uses the regular MiniYou card frame, size and layout. Only the theme (background art and colours) differs.
export const ROLE_CARD_THEME = { speaker: 'pathways', organizer: 'unity', mentor: 'balance', attendee: 'empowerment' };

// True when this design is the RMC 2026 look and the person has a role
export const isRmcCard = (design) => design?.theme === RMC_THEME_KEY && !!roleOf(design);
