import { NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';

// Separate limiters for different auth actions
const loginLimiter = createRateLimiter({ name: 'rc-login', shared: true, windowMs: 60_000 * 15, max: 300 }); // per network address: a venue shares one
const signupLimiter = createRateLimiter({ name: 'rc-signup', shared: true, windowMs: 60_000 * 60, max: 300 }); // per network address: a venue shares one
const resetLimiter = createRateLimiter({ name: 'rc-reset', shared: true, windowMs: 60_000 * 15, max: 30 }); // per network address (Supabase also limits reset emails)

export async function POST(request) {
  const ip = getClientIp(request);

  try {
    const { action } = await request.json();

    let result;
    switch (action) {
      case 'login':
        result = await loginLimiter.check(ip);
        break;
      case 'signup':
        result = await signupLimiter.check(ip);
        break;
      case 'reset':
        result = await resetLimiter.check(ip);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.limited) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.', limited: true },
        { status: 429 }
      );
    }

    return NextResponse.json({ limited: false, remaining: result.remaining });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
