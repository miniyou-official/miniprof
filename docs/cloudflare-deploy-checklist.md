# Cloudflare go-live checklist (12 Nov 2026)

Nothing here has been done yet. No secret values belong in this file.

## Before you start
- [ ] Cloudflare account created, two-factor login on, Workers Paid active
- [ ] New GitHub account created, two-factor login on, private repo `miniyou` created (empty)
- [ ] Vercel site still live as the fallback

## 1. Code to GitHub (new account only)
- [ ] `gh auth login` with the NEW account (not Cybrian101), or use a token for the new account
- [ ] Set the commit identity in this folder to the new account (name and email)
- [ ] One fresh commit, push to the new repo

## 2. Cloudflare Workers Builds
- [ ] Workers & Pages, create a Worker from the GitHub repo
- [ ] Build command `npx opennextjs-cloudflare build`, deploy command `npx wrangler deploy`
- [ ] Build variable `NODE_VERSION` = `22`
- [ ] Build variables (public, baked into the build): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## 3. Runtime secrets (type them yourself on the Worker)
`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CRON_SECRET`, `QR_SIGNING_SECRET`
`TRUST_CLOUDFLARE=1` is already in `wrangler.jsonc`.

## 4. Test on the workers.dev address (Vercel still live)
- [ ] Pages: `/`, `/community`, `/iew-roles`, `/iew-attendee`, `/rmc-attendee`, a profile
- [ ] Security headers present
- [ ] `/dashboard` while logged out redirects to login
- [ ] Sign up, log in (email, Google, username), log out
- [ ] Razorpay test payment and webhook
- [ ] Cron trigger fires (check the Worker's Triggers tab) and `/api/cron/expire-pro` answers
- [ ] Avatars load; check Images usage in the dashboard

## 5. Point the services at the new address
- [ ] Supabase: add the new URL to Auth redirect URLs
- [ ] Razorpay: webhook URL to the new address

## 6. Cutover
- [ ] Add `miniyou.co.in` and `www` as custom domains on the Worker
- [ ] Move DNS to Cloudflare if not already there
- [ ] Re-test login and payment on the real domain
- [ ] Keep Vercel until the event is over, then remove

## Rollback
Point the DNS back to Vercel.
