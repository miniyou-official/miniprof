import { createClient } from '@supabase/supabase-js';

// Acts as the server (service key), so it can write what browsers are blocked from writing. Server code only.
let admin;
export function getSupabaseAdmin() {
    if (!admin) {
        admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return admin;
}
