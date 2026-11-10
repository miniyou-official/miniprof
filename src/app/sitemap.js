// Only pages that are meant to be found in search. Sign-in, Pro and dashboard pages stay out, and so do individual
// profile pages: listing every username here would hand anyone a ready-made list of the people on MiniYou.
// Profile pages still work for anyone who has the link.
const baseUrl = 'https://www.miniyou.co.in';
const UPDATED = new Date('2026-11-07');

const PAGES = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/community', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/refund', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/delivery', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/acceptable-use', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap() {
  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: UPDATED,
    changeFrequency,
    priority,
  }));
}
