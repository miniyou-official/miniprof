/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

// Display-only mode for the IEEE RMC 2026 Community Edition: nobody can sign up or log in for now.
// Turn it off with NEXT_PUBLIC_RMC_DISPLAY_ONLY=false. These are routing-level redirects, so they do not
// depend on middleware.
const displayOnly = process.env.NEXT_PUBLIC_EDITION === 'rmc'
  && (process.env.NEXT_PUBLIC_RMC_DISPLAY_ONLY ?? 'true') !== 'false';
const BLOCKED = [
  '/login', '/signup', '/forgot-password', '/reset-password', '/proyou',
  '/dashboard', '/dashboard/:path*', '/auth/:path*',
  '/api/auth/:path*', '/api/username/:path*', '/api/qr/:path*', '/q/:path*',
];

const nextConfig = {
  poweredByHeader: false,
  // Wait for the page title and tags before sending the page, so a missing profile answers with a real 404 and the
  // canonical address and robots rules are in the page head for everyone, not streamed in afterwards.
  htmlLimitedBots: /.*/,
  productionBrowserSourceMaps: false, // never ship source maps: the original code is not readable from the browser
  compiler: { removeConsole: true }, // no console output from the production build
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'ipfyxxdsgaaqxggjnxlx.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'quickchart.io' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    // If Supabase ever sends the sign-in code to the home page (its redirect list does not include the exact
    // callback address, so it falls back to the Site URL), forward it to the callback page so the sign-in finishes.
    const rescue = [{ source: '/', has: [{ type: 'query', key: 'code' }], destination: '/auth/callback', permanent: false }];
    return displayOnly ? BLOCKED.map((source) => ({ source, destination: '/', permanent: false })) : rescue;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ''}`, // unsafe-eval only in dev (React needs it for debugging)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://ipfyxxdsgaaqxggjnxlx.supabase.co https://placehold.co https://api.dicebear.com https://quickchart.io https://lh3.googleusercontent.com https://*.razorpay.com",
              "connect-src 'self' https://ipfyxxdsgaaqxggjnxlx.supabase.co wss://ipfyxxdsgaaqxggjnxlx.supabase.co https://accounts.google.com https://api.razorpay.com https://lumberjack.razorpay.com",
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com", // Razorpay payment window
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self' https://ipfyxxdsgaaqxggjnxlx.supabase.co",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
