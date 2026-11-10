import AttendeeActivate from '@/components/AttendeeActivate';

export const metadata = {
  title: 'IEEE RMC 2026: activate your attendee card | MiniYou',
  description: 'Attendees at IEEE RMC 2026 scan this link to activate their MiniYou attendee card.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/rmc-attendee' },
};

// The attendee QR code for IEEE RMC 2026. Logged-out visitors are sent to log in and brought back here.
export default function RmcAttendeePage() {
  return <AttendeeActivate event="rmc" />;
}
