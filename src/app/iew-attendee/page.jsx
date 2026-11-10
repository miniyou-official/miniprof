import AttendeeActivate from '@/components/AttendeeActivate';

export const metadata = {
  title: 'Innovation and Entrepreneurial Workshop: activate your attendee card | MiniYou',
  description: 'Attendees at the IEEE RMC 2026 Innovation and Entrepreneurial Workshop scan this link to activate their MiniYou attendee card.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/iew-attendee' },
};

// The attendee QR code for the Innovation and Entrepreneurial Workshop. Logged-out visitors are sent to log in and brought back here.
export default function IewAttendeePage() {
  return <AttendeeActivate event="iew" />;
}
