'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserId, getCurrentUsername } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import GroupsContent from '@/components/GroupsContent'
import { User, Group } from '@/types/database'

export default function GroupsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [userGroups, setUserGroups] = useState<Group[]>([])
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

        if (userData) {
          setUser(userData)

          // Get active group
          const { data: groupData } = await supabase
            .from('group_members')
            .select('groups(*)')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single()

          if (groupData) {
            const groupsData = groupData as { groups: Group | null }
            if (groupsData.groups) {
              setActiveGroup(groupsData.groups)
            }
          }

          // Get all user groups
          const { data: allGroupsData } = await supabase
            .from('group_members')
            .select('groups(*)')
            .eq('user_id', userId)

          if (allGroupsData) {
            const groups = allGroupsData
              .map((gm: any) => (gm as { groups: Group | null }).groups)
              .filter(Boolean) as Group[]
            setUserGroups(groups)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
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

  if (!user) {
    return null
  }

  return (
    <GroupsContent
      user={user}
      activeGroup={activeGroup}
      userGroups={userGroups}
    />
  )
}
