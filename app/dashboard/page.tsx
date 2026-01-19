import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from '@/components/DashboardContent'
import { getCurrentUser, getActiveGroup, getRejections } from '@/lib/db/queries'
import { User, Group, Rejection } from '@/types/database'

type RejectionWithUser = Rejection & { users: User }

export default async function DashboardPage() {
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
  const rejections = activeGroup 
    ? (await getRejections(activeGroup.id, 10)) as RejectionWithUser[]
    : []

  return (
    <DashboardContent
      user={user}
      activeGroup={activeGroup}
      rejections={rejections}
    />
  )
}
