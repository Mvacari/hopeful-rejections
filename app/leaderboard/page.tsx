import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getActiveGroup, getLeaderboard } from '@/lib/db/queries'
import LeaderboardContent from '@/components/LeaderboardContent'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/auth')
  }

  const activeGroup = await getActiveGroup(user.id)
  const groupLeaderboard = activeGroup ? await getLeaderboard(activeGroup.id, 'all') : []
  const allLeaderboard = await getLeaderboard(null, 'all')

  return (
    <LeaderboardContent
      user={currentUser}
      activeGroup={activeGroup}
      groupLeaderboard={groupLeaderboard}
      allLeaderboard={allLeaderboard}
    />
  )
}
