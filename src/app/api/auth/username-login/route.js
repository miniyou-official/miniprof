import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';

// Log in with a username and password.
// The email that belongs to a username is never sent to the browser: this route looks it up with the service key,
// signs in on the server, and hands back only the session tokens. Every failure gives the same answer.
// Two limits: a generous one per network address (a venue shares one), and a strict one per address and account,
// so someone guessing one person's password is stopped after 10 tries without blocking everyone else on the same Wi-Fi
const limiter = createRateLimiter({ name: 'username-login', shared: true, windowMs: 15 * 60_000, max: 300 });
const accountLimiter = createRateLimiter({ name: 'username-login-acct', shared: true, windowMs: 15 * 60_000, max: 10 });
const NICKNAME = /^[a-z0-9._-]{2,40}$/;

const fail = (status = 401) => NextResponse.json({ error: 'Invalid username or password.' }, { status });

export async function POST(request) {
    if ((await limiter.check(getClientIp(request))).limited) {
        return NextResponse.json({ error: 'Too many attempts. Please wait and try again later.' }, { status: 429 });
    }

    let body;
    try { body = await request.json(); } catch { return fail(400); }
    const nickname = typeof body?.nickname === 'string' ? body.nickname.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!NICKNAME.test(nickname) || !password || password.length > 200) return fail();
    if ((await accountLimiter.check(`${getClientIp(request)}:${nickname}`)).limited) {
        return NextResponse.json({ error: 'Too many attempts. Please wait and try again later.' }, { status: 429 });
    }

    try {
        const { data: row, error: lookupError } = await getSupabaseAdmin().from('newprofile').select('email').eq('nickname', nickname).maybeSingle();
        if (lookupError) {
            // Not a wrong password: the server cannot read profiles (usually a missing or wrong SUPABASE_SERVICE_ROLE_KEY).
            console.error('username-login lookup failed:', lookupError.message);
            return NextResponse.json({ error: 'Username login is not available right now. Please log in with your email instead.' }, { status: 503 });
        }
        const email = typeof row?.email === 'string' ? row.email.trim() : '';
        if (!email) return fail();

        const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await anon.auth.signInWithPassword({ email, password });
        if (error || !data?.session) return fail();

        return NextResponse.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
    } catch {
        return fail(500);
    }
}
