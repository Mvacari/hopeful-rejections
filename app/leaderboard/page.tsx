import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeaderboardContent from '@/components/LeaderboardContent'
import { getCurrentUser, getActiveGroup, getLeaderboard } from '@/lib/db/queries'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const activeGroup = await getActiveGroup(user.id)
  const groupLeaderboard = activeGroup
    ? await getLeaderboard(activeGroup.id, 'all')
    : []
  const allLeaderboard = await getLeaderboard(null, 'all')

  return (
    <LeaderboardContent
      user={user}
      activeGroup={activeGroup}
      groupLeaderboard={groupLeaderboard}
      allLeaderboard={allLeaderboard}
    />
  )
}
