import CommunityHome from '@/components/community/CommunityHome';

export const metadata = {
  title: 'MiniYou Community Edition: digital cards for events and communities',
  description: 'Turn your event, workshop or community into a better way to network. Every member gets a digital card with a QR code. Featured event: RMC 2026.',
  keywords: ['event networking app', 'conference networking', 'QR code attendee badge', 'digital cards for events', 'networking at conferences', 'community digital identity', 'MiniYou Community Edition', 'miniyou', 'mini you', 'mini', 'you', 'miniyou community', 'miniyou events'],
  alternates: { canonical: '/community' },
  openGraph: {
    title: 'MiniYou Community Edition',
    description: 'Digital cards that make events and communities easier to connect with.',
    siteName: 'MiniYou Community Edition',
    type: 'website',
  },
};

// The community edition lives here, on its own page. The regular MiniYou landing page does not include it.
export default function CommunityPage() {
  return <CommunityHome />;
}
