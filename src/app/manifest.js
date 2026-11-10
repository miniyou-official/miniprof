// The web app manifest. When MiniYou is added to a phone's home screen, the launch screen uses these colours
// (dark) instead of a plain white one, and the app opens on the dashboard.
export default function manifest() {
  return {
    id: '/',
    name: 'MiniYou',
    short_name: 'MiniYou',
    description: 'Your digital profile card, one link away.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09101A',
    theme_color: '#09101A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // A full-bleed dark icon: without one, Android puts the logo on a white plate
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
