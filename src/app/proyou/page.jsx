import { redirect } from 'next/navigation';

// Pricing and payment now live in the dashboard's MiniYou Pro tab; the details are on the home page.
// Old links and bookmarks to /proyou land there.
export default function ProYouRedirect() {
  redirect('/dashboard?tab=pro');
}
