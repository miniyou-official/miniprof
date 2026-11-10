'use client';

import { useState } from 'react';
import ProFeatureBox from './ProFeatureBox';
import ProCheckout from './ProCheckout';
import ProStatus from '../ProStatus';

export const PRO_CHECKOUT_ID = 'pro-checkout';

// The whole Pro journey in one tab: see what Pro is, then pay, without leaving the dashboard.
// A Pro member sees their plan instead, and can restart a cancelled plan from here.
export default function ProTab({ user, userData, setUserData }) {
    const isPro = userData?.is_pro === true;
    const [restart, setRestart] = useState(false);
    return (
        <div className="space-y-4">
            <ProFeatureBox isPro={isPro} />
            {isPro && <ProStatus userId={userData.id} onRestart={() => setRestart(true)} />}
            {(!isPro || restart) && <ProCheckout id={PRO_CHECKOUT_ID} user={user} userData={userData} setUserData={setUserData} restart={restart} />}
        </div>
    );
}
