import IewRolePicker from '@/components/IewRolePicker';

export const metadata = {
  title: 'Innovation and Entrepreneurial Workshop: choose your role | MiniYou',
  description: 'Speakers, organizers and panelists at the IEEE RMC 2026 Innovation and Entrepreneurial Workshop choose their role and get a special MiniYou card.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/iew-roles' },
};

// The official workshop link, printed as a QR code. Logged-out visitors are sent to log in and brought back here.
export default function IewRolesPage() {
  return <IewRolePicker />;
}
