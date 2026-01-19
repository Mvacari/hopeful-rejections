'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserId, getCurrentUsername } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import NewRejectionForm from '@/components/NewRejectionForm'
import { User, Group } from '@/types/database'

export default function NewRejectionPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const userId = getCurrentUserId()
    const username = getCurrentUsername()

    if (!userId || !username) {
      router.push('/auth')
      return
    }

    const loadData = async () => {
      try {
        // Get user
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (!userData) {
          router.push('/auth')
          return
        }

        setUser(userData)

        // Get active group
        const { data: groupData } = await supabase
          .from('group_members')
          .select('groups(*)')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single()

        if (!groupData) {
          router.push('/groups')
          return
        }

        const groupsData = groupData as { groups: Group | null }
        if (groupsData.groups) {
          setActiveGroup(groupsData.groups)
        } else {
          router.push('/groups')
        }
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/groups')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user || !activeGroup) {
    return null
  }

  return <NewRejectionForm user={user} group={activeGroup} />
}
