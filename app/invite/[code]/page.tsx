'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserId, getCurrentUsername } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import InvitePageContent from '@/components/InvitePageContent'
import { Group, User } from '@/types/database'

export default function InvitePage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const userId = getCurrentUserId()
      const username = getCurrentUsername()

      if (!userId || !username) {
        router.push('/auth')
        return
      }

      try {
        // Get group by invite code
        const { data: groupData } = await supabase
          .from('groups')
          .select('*')
          .eq('invite_code', params.code)
          .single()

        if (!groupData) {
          router.push('/groups')
          return
        }

        setGroup(groupData)

        // Get current user
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (userData) {
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/groups')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, params.code, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!group) {
    return null
  }

  return <InvitePageContent group={group} currentUser={currentUser} />
}
