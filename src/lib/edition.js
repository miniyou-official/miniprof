// Which edition of MiniYou this build is. The regular MiniYou app is the default.
// Set NEXT_PUBLIC_EDITION=rmc for the RMC 2026 Community Edition build.
export const EDITION = process.env.NEXT_PUBLIC_EDITION || 'standard';
export const IS_RMC = EDITION === 'rmc';

export const RMC_EVENT = {
    short: 'RMC 2026',
    full: 'Returning Mothers Conference 2026',
    dates: '13-14 November 2026',
    venue: 'NMIT, Bengaluru',
    tagline: 'The Future is Shared',
    disclaimer: '© 2026 MiniYou. All rights reserved. MiniYou and MiniYou Community Edition are the property of MiniYou. Event names, logos and marks belong to their respective organizers and appear only to identify the event.',
};

// Event edition links look like miniyou.co.in/rmc2026/username. The regular app uses miniyou.co.in/username.
export const profilePath = (nickname) => (IS_RMC ? `/rmc2026/${nickname}` : `/${nickname}`);
export const profileUrl = (nickname) => `https://www.miniyou.co.in${profilePath(nickname)}`;
export const profileLabel = (nickname) => `miniyou.co.in${profilePath(nickname)}`;

// Display-only: the event cards are shown, but nobody can sign up or log in. The blocking itself lives in next.config.js.
export const DISPLAY_ONLY = IS_RMC && (process.env.NEXT_PUBLIC_RMC_DISPLAY_ONLY ?? 'true') !== 'false';
