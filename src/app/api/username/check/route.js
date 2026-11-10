import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';

const limiter = createRateLimiter({ name: 'username-check', windowMs: 60_000, max: 120 });

export async function GET(request) {
  const ip = getClientIp(request);
  const { limited } = await limiter.check(ip);

  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.toLowerCase().trim();

  if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false });
  }

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data } = await supabase
      .from('newprofile')
      .select('nickname')
      .eq('nickname', username)
      .maybeSingle();

    return NextResponse.json({ available: !data });
  } catch {
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
