// The attendee links (/rmc-attendee and /iew-attendee) work like the role links, but there is nothing to choose: scanning the QR code
// logs the person in and activates their attendee card straight away. This remembers which link a logged-out visitor came from, so
// login (and the first-time profile setup) brings them back to it.

export const ATTENDEE_KEY = 'miniyou:attendee-link';
export const ATTENDEE_PATHS = ['/rmc-attendee', '/iew-attendee'];

const read = (store) => {
    try {
        const v = store.getItem(ATTENDEE_KEY);
        return ATTENDEE_PATHS.includes(v) ? v : null;
    } catch { return null; /* storage can be blocked */ }
};

// Kept in localStorage (survives the sign-up email link opening in another tab) and in sessionStorage (this tab's login)
export const rememberAttendeeLink = (path) => {
    if (!ATTENDEE_PATHS.includes(path)) return;
    try { localStorage.setItem(ATTENDEE_KEY, path); sessionStorage.setItem(ATTENDEE_KEY, path); } catch { /* ignore */ }
};
export const forgetAttendeeLink = () => {
    try { localStorage.removeItem(ATTENDEE_KEY); sessionStorage.removeItem(ATTENDEE_KEY); } catch { /* ignore */ }
};
export const attendeeLinkInTab = () => read(typeof sessionStorage === 'undefined' ? { getItem: () => null } : sessionStorage);
export const pendingAttendeeLink = () => read(typeof localStorage === 'undefined' ? { getItem: () => null } : localStorage);
