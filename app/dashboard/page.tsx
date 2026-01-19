import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getActiveGroup, getRejections } from '@/lib/db/queries'
import DashboardContent from '@/components/DashboardContent'

export default async function DashboardPage() {
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
  const rejections = activeGroup ? await getRejections(activeGroup.id, 10) : []

  return (
    <DashboardContent
      user={currentUser}
      activeGroup={activeGroup}
      rejections={rejections}
    />
  )
}
