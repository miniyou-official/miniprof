import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { IS_RMC } from '@/lib/edition';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const RMC = IS_RMC;

const SITE_URL = 'https://www.miniyou.co.in';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: RMC ? 'MiniYou Community Edition: RMC 2026' : 'MiniYou: The Little You, in a Digital View',
  description: RMC
    ? 'Create your digital card for the Returning Mothers Conference 2026. Share it with one link or QR code. MiniYou Community Edition is built for events and communities.'
    : 'Create a free digital business card with your details, your links and a QR code. Share it with one scan, no app needed. Made for professionals, students and events.',
  keywords: ['digital business card', 'digital visiting card', 'QR code business card', 'digital profile card', 'free digital business card India', 'link in bio', 'event networking', 'conference networking card', 'MiniYou', 'miniyou', 'mini you', 'mini', 'you', 'miniyou.co.in', 'miniyou card', 'miniyou digital card', 'miniyou app'],
  applicationName: 'MiniYou',
  appleWebApp: { capable: true, title: 'MiniYou', statusBarStyle: 'black' },
  openGraph: {
    siteName: 'MiniYou',
    type: 'website',
    url: SITE_URL,
    title: 'MiniYou: The Little You, in a Digital View',
    description: 'Create a digital profile card with your details, your links and a QR code to share. Free to start.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiniYou: The Little You, in a Digital View',
    description: 'Create a digital profile card with your details, your links and a QR code to share. Free to start.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#09101A',
  colorScheme: 'dark',
};

// Tells search engines what MiniYou is. Only facts that are true today: no ratings, no invented details.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: 'MiniYou', url: SITE_URL, logo: `${SITE_URL}/miniyou-logo.png` },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, name: 'MiniYou', url: SITE_URL, publisher: { '@id': `${SITE_URL}/#org` }, inLanguage: 'en' },
    {
      '@type': 'WebApplication',
      name: 'MiniYou',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any (web browser)',
      description: 'Create a digital profile card with your details, your links and a QR code to share.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free to start, with an optional Pro subscription' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Chrome fires "install" once, early. Keep it here so the Add to screen button can use it whenever it appears. */}
        <script dangerouslySetInnerHTML={{ __html: "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__muInstall=e;});window.addEventListener('appinstalled',function(){window.__muInstall=null;});" }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
