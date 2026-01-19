import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGroupByInviteCode, getCurrentUser } from '@/lib/db/queries'
import InvitePageContent from '@/components/InvitePageContent'

export default async function InvitePage({ params }: { params: { code: string } }) {
  const group = await getGroupByInviteCode(params.code)
  
  if (!group) {
    redirect('/groups')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const currentUser = user ? await getCurrentUser() : null

  return <InvitePageContent group={group} currentUser={currentUser} />
}
