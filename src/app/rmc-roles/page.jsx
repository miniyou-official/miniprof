import RmcRolePicker from '@/components/RmcRolePicker';

export const metadata = {
  title: 'IEEE RMC 2026: choose your role | MiniYou',
  description: 'Speakers, organizers and mentors at IEEE RMC 2026 choose their role and get a special MiniYou card.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/rmc-roles' },
};

// The official IEEE RMC link, printed as a QR code. Logged-out visitors are sent to log in and brought back here.
export default function RmcRolesPage() {
  return <RmcRolePicker />;
}
