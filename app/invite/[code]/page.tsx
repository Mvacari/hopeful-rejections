import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvitePageContent from '@/components/InvitePageContent'
import { getCurrentUser, getGroupByInviteCode } from '@/lib/db/queries'

export default async function InvitePage({ params }: { params: { code: string } }) {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  const group = await getGroupByInviteCode(params.code)
  if (!group) {
    redirect('/groups')
  }

  return <InvitePageContent group={group} currentUser={currentUser} />
}
