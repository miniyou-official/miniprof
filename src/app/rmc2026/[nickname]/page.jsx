import { createClient } from '@supabase/supabase-js';
import ProfileView from '@/components/ProfileView';

// miniyou.co.in/rmc2026/username: the RMC 2026 Community Edition card
export const dynamic = 'force-dynamic';

const supabaseServer = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function generateMetadata({ params }) {
  const { nickname } = await params;
  const { data: profile } = await supabaseServer
    .from('newprofile')
    .select('full_name, nickname, bio, avatar_url')
    .eq('nickname', nickname)
    .eq('is_public', true)
    .maybeSingle();

  if (!profile) return { title: 'Card not found — MiniYou' };

  const name = profile.full_name || nickname;
  const title = `${name} — RMC 2026`;
  const description = profile.bio || `${name}'s digital card for RMC 2026`;
  const url = `https://www.miniyou.co.in/rmc2026/${nickname}`;
  const image = profile.avatar_url || `https://api.dicebear.com/8.x/adventurer/svg?seed=${nickname}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: 'MiniYou Community Edition', images: [{ url: image, width: 400, height: 400 }], type: 'profile' },
    twitter: { card: 'summary', title, description, images: [image] },
  };
}

export default async function Page({ params }) {
  const { nickname } = await params;
  return <ProfileView nickname={nickname} rmc />;
}
