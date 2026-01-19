import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getActiveGroup } from '@/lib/db/queries'
import NewRejectionForm from '@/components/NewRejectionForm'

export default async function NewRejectionPage() {
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
  if (!activeGroup) {
    redirect('/groups')
  }

  return <NewRejectionForm user={currentUser} group={activeGroup} />
}
