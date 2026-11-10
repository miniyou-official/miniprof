import { redirect } from 'next/navigation';

// The first version of the link was /rmc-role. Anything already printed or shared keeps working.
export default function RmcRoleRedirect() {
  redirect('/rmc-roles');
}
