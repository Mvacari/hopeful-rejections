import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GroupsContent from '@/components/GroupsContent'
import { getCurrentUser, getActiveGroup, getUserGroups } from '@/lib/db/queries'
import { Group } from '@/types/database'

export default async function GroupsPage() {
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
  const userGroupsData = await getUserGroups(user.id)
  const userGroups = userGroupsData
    .map((gm: any) => (gm as { groups: Group | null }).groups)
    .filter(Boolean) as Group[]

  return (
    <GroupsContent
      user={user}
      activeGroup={activeGroup}
      userGroups={userGroups}
    />
  )
}
