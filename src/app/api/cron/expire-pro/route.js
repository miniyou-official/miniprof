import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Runs once a day (see vercel.json). Turns Pro off for anyone whose paid time has run out.
// People with no end date are left alone, so an older hand-set Pro is not removed by surprise.
export async function GET(request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Not allowed.' }, { status: 401 });
    }
    const db = getSupabaseAdmin();
    await db.rpc('prune_profile_views'); // housekeeping; ignored if the views migration is not applied yet
    await db.rpc('prune_rate_limits'); // housekeeping; ignored if the rate limit migration is not applied yet
    const { data, error } = await db
        .from('newprofile')
        .update({ is_pro: false })
        .eq('is_pro', true)
        .not('pro_until', 'is', null)
        .lt('pro_until', new Date().toISOString())
        .select('id');
    if (error) return NextResponse.json({ error: 'Could not update.' }, { status: 500 });
    return NextResponse.json({ expired: data?.length || 0 });
}
