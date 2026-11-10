// IEEE Returning Mothers Conference 2026: Innovation and Entrepreneurial Workshop (13 Nov 2026).
// A second event look that sits beside the IEEE RMC 2026 role cards and works the same way. Someone with a workshop role
// gets the "Workshop" look in their designs; it is stored in the card design (design.theme = 'ws2026', design.ws.role),
// so it needs no database column. The card keeps the regular MiniYou frame; only the theme changes with the role.

// The look name saved in design.theme for the workshop card. It is not one of the regular MiniYou themes.
export const WS_THEME_KEY = 'ws2026';

// The short event name shown in the card's corner tag
export const WS_EVENT_NAME = 'Innovation Workshop 2026';

// The full event name, shown above the role choices on /iew-roles
export const WS_EVENT_FULL_NAME = 'Innovation and Entrepreneurial Workshop 2026';

import { WS_STYLES } from '@/components/workshop/workshopThemes';

export const WS_CARD_ROLES = ['speaker', 'organizer', 'panelist', 'attendee'];

// The /iew-roles link (Innovation and Entrepreneurial Workshop), the same idea as /rmc-roles. Speakers, organizers and panelists pick a role there;
// the card uses the Foundry style (charcoal and ivory with cog wheels). The role is stored in the card design (design.ws.role, design.ws.style), so it needs no database column.
export const IEW_STYLE = 'foundry';

// Remembers a logged-out visitor came from the /iew-roles link, so login brings them back to it.
export const IEW_INTENT_KEY = 'miniyou:wants-iew-role';

// A role picked before the visitor has an account. Kept in localStorage so it survives the sign-up email link opening in another tab.
export const IEW_PENDING_KEY = 'miniyou:iew-pending-role';

export const IEW_ROLES = {
    speaker: { label: 'Speaker', blurb: 'You are on the programme and take the stage.', g1: '#EF7F52', g2: '#2DBE8A' },
    organizer: { label: 'Organizer', blurb: 'You help run the workshop behind the scenes.', g1: '#3FD1A0', g2: '#E0693C' },
    panelist: { label: 'Panelist', blurb: 'You share your view on the panel.', g1: '#F7F1E5', g2: '#2DBE8A' },
};

// Attendees are not on the /iew-roles page. They get their card from a separate link or QR code later, so the attendee look is built but not claimable here.
const ATTENDEE_LABEL = 'Attendee';

export const isIewRole = (value) => typeof value === 'string' && Object.hasOwn(IEW_ROLES, value);

// Speakers and panelists show their session on the card
export const wsHasSession = (role) => role === 'speaker' || role === 'panelist';

// The workshop card's own details (design.ws), the way RMC keeps its details in design.rmc. When one is empty the regular card's
// details are used, so someone who already filled in their MiniYou card does not have to type them again.
export function getWsDetails(userData) {
    const d = userData?.design?.ws || {};
    const c = userData?.design?.details || {};
    const skills = Array.isArray(d.skills) && d.skills.length ? d.skills : (Array.isArray(c.skills) ? c.skills : []);
    return {
        role: WS_CARD_ROLES.includes(d.role) ? d.role : null,
        title: d.title || c.title || '',
        organization: d.organization || c.organization || '',
        location: d.location || c.location || '',
        skills: skills.filter(Boolean).slice(0, 6),
        session_title: d.session_title || '',
        session_time: d.session_time || '',
    };
}

export const wsRoleLabel = (role) => IEW_ROLES[role]?.label || (role === 'attendee' ? ATTENDEE_LABEL : '');

// Theme keys (see CARD_THEMES in HolographicCard.jsx). All four are workshop-only and never shown in the look picker.
export const WS_ROLE_THEME = { speaker: 'ws_speaker', organizer: 'ws_organizer', panelist: 'ws_panelist', attendee: 'ws_attendee' };

// The style a person picked (design.ws.style: sprout, boardroom, blueprint or foundry; sprout when none) decides which theme their role uses
export const wsStyleOf = (design) => (WS_STYLES.some((s) => s.key === design?.ws?.style) ? design.ws.style : IEW_STYLE);
export const wsThemeFor = (role, style) => (WS_STYLES.find((s) => s.key === style) || WS_STYLES.find((s) => s.key === IEW_STYLE)).themes[role];

export const isWsTheme = (key) => typeof key === 'string' && key.startsWith('ws_');

// The workshop role saved on a card design, or null
export const wsRoleOf = (design) => (WS_CARD_ROLES.includes(design?.ws?.role) ? design.ws.role : null);

// True when this design is the workshop look and the person has a workshop role
export const isWsCard = (design) => design?.theme === WS_THEME_KEY && !!wsRoleOf(design);
