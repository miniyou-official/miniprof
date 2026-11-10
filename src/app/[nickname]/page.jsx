import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import ProfileView from '@/components/ProfileView'
import { IS_RMC } from '@/lib/edition'
import { publicDesign } from '@/lib/publicDesign'

export const dynamic = 'force-dynamic'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// One lookup per request, shared by the page head (title, preview image) and the page itself.
// null means there is no such public profile; undefined means the lookup failed, so the browser tries again.
const PROFILE_FIELDS = 'id, full_name, nickname, bio, avatar_url, is_public, is_pro, socialLinks, design, updated_at, theme, view_count, onboarding_complete, created_at, identity, resume_path'
const getProfile = cache(async (nickname) => {
  const { data, error } = await supabaseServer
    .from('newprofile')
    .select(PROFILE_FIELDS)
    .eq('nickname', nickname)
    .eq('is_public', true)
    .maybeSingle()
  if (error) return undefined
  // What "Save MiniMe" shares is the owner's choice: details whose switch is off never leave the server
  return data ? { ...data, design: publicDesign(data.design) } : data
})

export async function generateMetadata({ params }) {
  const { nickname } = await params
  const profile = await getProfile(nickname)

  if (!profile) return {
    title: 'Profile not found — MiniYou',
    robots: { index: false, follow: false },
  }

  const name = profile.full_name || nickname
  const bio = profile.bio || 'Check out my MiniYou card'
  const avatar = profile.avatar_url ||
    `https://api.dicebear.com/8.x/adventurer/svg?seed=${nickname}`
  const url = `https://www.miniyou.co.in/${nickname}`

  return {
    title: `${name} (@${nickname}) — MiniYou`,
    description: bio,
    alternates: { canonical: url },
    openGraph: {
      title: `${name} (@${nickname})`,
      description: bio,
      url,
      siteName: 'MiniYou',
      images: [{ url: avatar, width: 400, height: 400 }],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${name} (@${nickname})`,
      description: bio,
      images: [avatar],
    },
  }
}

export default async function Page({ params }) {
  const { nickname } = await params
  if (IS_RMC) redirect(`/rmc2026/${nickname}`)
  const profile = await getProfile(nickname)
  if (profile === null) notFound() // a real 404, not a 200 page that says "not found"
  return <ProfileView nickname={nickname} initialProfile={profile} />
}
