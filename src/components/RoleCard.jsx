'use client';

import HolographicCard from './HolographicCard';
import { isRmcCard, roleOf, ROLE_CARD_THEME } from '@/lib/rmcRole';
import { isWsCard, wsRoleOf, wsStyleOf, wsThemeFor } from '@/lib/workshopRole';

// The card a person sees for their own design. Someone who picked a role on /rmc-roles and kept the "RMC 2026" look
// gets the regular MiniYou card frame in their role's RMC theme; anyone else gets the card they chose.
export default function RoleCard({ userData, currentDesign, isOwner = false, ...rest }) {
    const design = currentDesign || userData?.design;
    // The Innovation Workshop look works the same way, with its own role (design.ws.role) and themes
    if (isWsCard(design)) {
        const role = wsRoleOf(design);
        return <HolographicCard userData={userData} currentDesign={{ ...design, theme: wsThemeFor(role, wsStyleOf(design)) }} rmcRole={role} isOwner={isOwner} {...rest} />;
    }
    if (isRmcCard(design)) {
        const role = roleOf(design);
        return <HolographicCard userData={userData} currentDesign={{ ...design, theme: ROLE_CARD_THEME[role] }} rmcRole={role} isOwner={isOwner} {...rest} />;
    }
    return <HolographicCard userData={userData} currentDesign={currentDesign} isOwner={isOwner} {...rest} />;
}
