import LandingPage from '@/components/LandingPage';
import Splash from '@/components/Splash';

// The home page is a client component, so the canonical address lives in this small wrapper.
// Without it Google chose the old address without "www" as the official one and left www out of search.
export const metadata = {
  alternates: { canonical: '/' },
};

// Colours the phone's address bar and the page behind it dark, so there is no white flash on open
export const viewport = {
  themeColor: '#05060A',
  colorScheme: 'dark',
};

export default function Page() {
  return (
    <>
      <Splash />
      <LandingPage />
    </>
  );
}
