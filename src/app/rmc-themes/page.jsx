import { redirect } from 'next/navigation';

// The role designs are revealed at the event, so this old gallery no longer lists them.
// The community page shows one open design and locked teasers for the rest.
export default function RmcThemesPage() {
  redirect('/community#designs');
}
