import { redirect } from 'next/navigation';

// miniyou.co.in/rmc2026 has no card of its own; send people to the event home page
export default function Rmc2026Index() {
  redirect('/');
}
