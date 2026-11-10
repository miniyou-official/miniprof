import { sanitizeLinkList } from './linkSafety';
import { supabase } from './supabaseClient';
import { isRmcRole, roleOf, RMC_THEME_KEY } from './rmcRole';
import { isIewRole, wsRoleOf, WS_THEME_KEY, IEW_STYLE } from './workshopRole';

// Only log errors in development — never expose raw error objects in production
const devError = (label, err) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(label, err?.message || err);
    }
};

/**
 * Checks rate limit for an auth action before proceeding.
 * @param {'login'|'signup'|'reset'} action
 * @throws {Error} if rate limited
 */
export async function checkRateLimit(action) {
    try {
        const res = await fetch('/api/auth/rate-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        });
        const data = await res.json();
        if (data.limited) {
            throw new Error('Too many attempts. Please wait and try again later.');
        }
    } catch (err) {
        if (err.message.includes('Too many attempts')) throw err;
        // If rate check API fails, allow the request (fail open)
    }
}

/** True when a username is already in use. Anyone can read nicknames (profiles are public), so no login is needed. */
export const isUsernameTaken = async (nickname) => {
    const { data, error } = await supabase.from('newprofile').select('nickname').eq('nickname', String(nickname).trim().toLowerCase()).maybeSingle();
    if (error) throw new Error('Could not check that username.');
    return !!data;
};

/**
 * Signs up a new user with email, password, and profile data (fullName, nickname).
 */
export const signUpWithEmail = async (email, password, fullName, nickname) => {
    await checkRateLimit('signup');

    // Password validation (client-side convenience check — enforce server-side too via Supabase Auth policy)
    const uppercaseRegex = /[A-Z]/;
    const specialCharRegex = /[^A-Za-z0-9]/;

    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
    }
    if (!uppercaseRegex.test(password)) {
        throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!specialCharRegex.test(password)) {
        throw new Error('Password must contain at least one special character (e.g., @, #, $, %).');
    }
    // Block characters that cause issues in downstream systems
    if (/[$*]/.test(password)) {
        throw new Error('Password cannot contain the specific characters "$" or "*".');
    }

    // The database rejects a username under 3 characters. Check here so the account is not created and then left without a profile.
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nickname.trim())) {
        throw new Error('Username must be 3 to 20 characters: letters, numbers or underscore.');
    }
    nickname = nickname.trim();

    // Check if nickname exists
    const { data: existingProfile } = await supabase
        .from('newprofile')
        .select('nickname')
        .eq('nickname', nickname.toLowerCase())
        .maybeSingle();

    if (existingProfile) {
        throw new Error('Nickname already exists');
    }

    // Sign up in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                nickname: nickname.toLowerCase(),
            }
        }
    });

    if (authError) throw authError;

    const user = authData.user;
    if (!user) throw new Error('Sign up failed: User object not returned.');

    const { error: profileError } = await supabase
        .from('newprofile')
        .insert([
            {
                id: user.id,
                email: email.trim(),
                full_name: fullName,
                nickname: nickname.toLowerCase().trim(),
                is_public: true,
            }
        ]);

    if (profileError) {
        devError('Failed to create profile entry:', profileError);
        throw new Error('Account created, but profile initialization failed. Please try logging in or contact support.');
    }

    return authData;
};

/**
 * Signs in a user with their email and password.
 */
export const signInWithEmail = async (email, password) => {
    await checkRateLimit('login');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Invalid email or password.');
    return data;
};

/**
 * Signs in a user with their username and password. The server finds the account and signs in, so the email that
 * belongs to a username is never sent to the browser. Only the session comes back.
 */
export async function signInWithUsername(nickname, password) {
    let res;
    try {
        res = await fetch('/api/auth/username-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, password }),
        });
    } catch {
        throw new Error('Could not reach MiniYou. Check your connection and try again.');
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.access_token || !body.refresh_token) {
        throw new Error(body.error || 'Invalid username or password.');
    }
    const { data, error } = await supabase.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
    if (error) throw new Error('Invalid username or password.');
    return data;
}

/**
 * Signs out the current user.
 */
export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Gets the currently authenticated user from Supabase.
 */
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Every readable profile column. The email column is not readable through the API; use the auth session's email instead.
const PROFILE_COLUMNS = 'id, full_name, nickname, bio, avatar_url, is_public, is_pro, socialLinks, design, updated_at, theme, view_count, onboarding_complete, created_at, identity';

// The resume path is read on its own. If the resume column is not in the database yet, the profile still loads
// and the card simply has no resume.
async function withResume(profile, known) {
    if (!profile) return profile;
    if (known !== undefined) return { ...profile, resume_path: known };
    const { data, error } = await supabase.from('newprofile').select('resume_path').eq('id', profile.id).maybeSingle();
    return { ...profile, resume_path: error ? null : (data?.resume_path ?? null) };
}

/**
 * Fetches the logged-in user's complete profile from the 'newprofile' table.
 */
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('newprofile')
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .single();

    if (error) {
        devError('Error fetching profile:', error);
        throw new Error('Could not load profile.');
    }
    return withResume(data);
};

// Pro-only themes — free users cannot select these
const PRO_THEMES = ['artist', 'bookreader', 'marvel', 'pathways'];

/**
 * Updates a user's profile in the 'newprofile' table.
 * Validates Pro theme gating server-side.
 */
export const updateProfile = async (userId, updates) => {
    // Links are checked again here, so nothing unsafe is sent even if a page is changed in the browser
    if (updates && Object.hasOwn(updates, 'socialLinks')) {
        const checked = sanitizeLinkList(updates.socialLinks);
        if (!checked.ok) throw new Error(checked.reason);
        updates = { ...updates, socialLinks: checked.links };
    }
    // If the update includes a design with a Pro theme, verify the user is Pro
    const requestedTheme = updates?.design?.theme;
    if (requestedTheme && PRO_THEMES.includes(requestedTheme)) {
        const { data: profile } = await supabase
            .from('newprofile')
            .select('is_pro')
            .eq('id', userId)
            .single();

        if (!profile?.is_pro) {
            throw new Error('Pro subscription required for this theme.');
        }
    }

    const { data, error } = await supabase
        .from('newprofile')
        .update({ ...updates })
        .eq('id', userId)
        .select(PROFILE_COLUMNS)
        .single();

    if (error) {
        devError('Error updating profile:', error);
        throw new Error('Could not update profile.');
    }
    return withResume(data, Object.hasOwn(updates || {}, 'resume_path') ? updates.resume_path : undefined);
};

/**
 * Saves an IEEE RMC role (speaker, organizer or mentor) on the user's card. The RMC 2026 look is made their card; they can choose another look later.
 */
export const claimRmcRole = async (profile, role) => {
    if (!isRmcRole(role)) throw new Error('Pick Speaker, Organizer or Mentor.');
    const design = { ...(profile.design || {}), theme: RMC_THEME_KEY, rmc: { ...(profile.design?.rmc || {}), role } };
    return updateProfile(profile.id, { design });
};

/**
 * Saves an Innovation and Entrepreneurial Workshop role (speaker, organizer or panelist) on the user's card. The workshop look is made their card; they can choose another look later.
 */
export const claimIewRole = async (profile, role) => {
    if (!isIewRole(role)) throw new Error('Pick Speaker, Organizer or Panelist.');
    const design = { ...(profile.design || {}), theme: WS_THEME_KEY, ws: { ...(profile.design?.ws || {}), role, style: IEW_STYLE } };
    return updateProfile(profile.id, { design });
};

/**
 * Activates the attendee card for an event ('rmc' or 'iew'), the way the QR code on an attendee badge does. A person who already has
 * a role at that event (speaker, organizer...) keeps it; attendee never replaces it. Returns { updated, already }.
 */
export const claimAttendee = async (profile, event) => {
    if (event === 'rmc') {
        if (roleOf(profile.design)) return { updated: profile, already: true };
        const design = { ...(profile.design || {}), theme: RMC_THEME_KEY, rmc: { ...(profile.design?.rmc || {}), role: 'attendee' } };
        return { updated: await updateProfile(profile.id, { design }), already: false };
    }
    if (event === 'iew') {
        if (wsRoleOf(profile.design)) return { updated: profile, already: true };
        const design = { ...(profile.design || {}), theme: WS_THEME_KEY, ws: { ...(profile.design?.ws || {}), role: 'attendee', style: IEW_STYLE } };
        return { updated: await updateProfile(profile.id, { design }), already: false };
    }
    throw new Error('Unknown event.');
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB, the same limit the storage bucket enforces
const MAX_AVATAR_PICK_BYTES = 15 * 1024 * 1024; // a photo you pick can be bigger; it is shrunk before it is sent

// A phone photo is several megabytes, but an avatar is shown small. Shrink it to at most 640 px and save it as WebP
// (a few tens of KB), so it uploads quickly and the card loads fast. Animated GIFs are left as they are.
async function shrinkAvatar(file) {
    if (file.type === 'image/gif') return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        if (bitmap.close) bitmap.close();
        const toBlob = (type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
        const webp = await toBlob('image/webp', 0.86);
        if (webp && webp.type === 'image/webp') return new File([webp], 'avatar.webp', { type: 'image/webp' });
        const jpeg = await toBlob('image/jpeg', 0.86);
        if (jpeg) return new File([jpeg], 'avatar.jpg', { type: 'image/jpeg' });
    } catch { /* fall through: upload the original if it is small enough */ }
    return file;
}

const AVATAR_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

/**
 * Uploads a new avatar image to Supabase Storage and returns the public URL.
 */
export const uploadAvatar = async (userId, file) => {
    const ALLOWED_MIME_TYPES = Object.keys(AVATAR_EXT);
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    }
    if (file.size > MAX_AVATAR_PICK_BYTES) {
        throw new Error('That photo is too large. Please choose one under 15 MB.');
    }

    const upload = await shrinkAvatar(file);
    if (upload.size > MAX_AVATAR_BYTES) {
        throw new Error('The photo is still over 2 MB. Please choose a smaller one.');
    }

    const fileName = `${userId}-${Date.now()}.${AVATAR_EXT[upload.type] || 'jpg'}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, upload, { contentType: upload.type, cacheControl: '31536000' });

    if (uploadError) {
        throw new Error('Avatar upload failed. Please try again.');
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
};

/**
 * Records a profile view (fire and forget). The server counts each phone or laptop once,
 * so reloading or reopening the link never adds views.
 */
export async function incrementViewCount(nickname) {
    let device = null;
    try {
        device = localStorage.getItem('mu_device');
        if (!device) {
            device = crypto.randomUUID();
            localStorage.setItem('mu_device', device);
        }
    } catch {
        return; // Without a stored device id we cannot tell visits apart, so nothing is counted
    }
    // This browser already counted for this profile, so there is nothing to send
    const seenKey = `mu_seen_${nickname}`;
    try { if (localStorage.getItem(seenKey)) return; } catch { return; }
    try {
        const res = await fetch('/api/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, device }),
            keepalive: true,
        });
        if (res.ok) {
            const body = await res.json().catch(() => ({}));
            // counted: true or false (false = already counted before, a bot, or a bad id); either way, do not ask again
            if (typeof body.counted === 'boolean') { try { localStorage.setItem(seenKey, '1'); } catch { /* storage can be blocked */ } }
        }
    } catch { /* counting is best effort */ }
}

/**
 * Tracks a social link click (fire and forget — never count owner clicks).
 */
export async function trackLinkClick(profileId, nickname, platform) {
    if (!nickname || !platform) return; // Guard against null data
    try {
        await fetch('/api/track/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, platform }),
            keepalive: true,
        });
    } catch { /* counting is best effort */ }
}

/**
 * Reports a profile. The server checks that you are signed in and limits how often you can report.
 */
export async function reportProfile(nickname) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) throw new Error('Please log in to report a profile.');
    const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nickname }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not submit the report.');
    }
}

/**
 * Fetches a public profile by nickname.
 */
export const getPublicProfileByNickname = async (nickname) => {
    const { data, error } = await supabase
        .from('newprofile')
        .select(PROFILE_COLUMNS)
        .eq('nickname', nickname)
        .eq('is_public', true)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        devError('Error fetching public profile:', error);
        throw new Error('Could not load profile.');
    }
    return withResume(data);
};
