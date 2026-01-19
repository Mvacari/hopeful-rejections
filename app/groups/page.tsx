import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getActiveGroup, getUserGroups } from '@/lib/db/queries'
import GroupsContent from '@/components/GroupsContent'

export default async function GroupsPage() {
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
  const userGroups = await getUserGroups(user.id)

  return (
    <GroupsContent
      user={currentUser}
      activeGroup={activeGroup}
      userGroups={userGroups.map((gm: any) => gm.groups)}
    />
  )
}
