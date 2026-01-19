import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewRejectionForm from '@/components/NewRejectionForm'
import { getCurrentUser, getActiveGroup } from '@/lib/db/queries'

export default async function NewRejectionPage() {
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
  if (!activeGroup) {
    redirect('/groups')
  }

  return <NewRejectionForm user={user} group={activeGroup} />
}
