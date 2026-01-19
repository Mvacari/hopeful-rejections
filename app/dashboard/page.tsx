'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserId, getCurrentUsername } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import DashboardContent from '@/components/DashboardContent'
import { User, Group, Rejection } from '@/types/database'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [rejections, setRejections] = useState<Rejection[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const userId = getCurrentUserId()
    const username = getCurrentUsername()

    if (!userId || !username) {
      router.push('/auth')
      return
    }

    // Load user and data
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
              const group = groupsData.groups
              setActiveGroup(group)

              // Get rejections
              const { data: rejectionsData } = await supabase
                .from('rejections')
                .select('*, users(*)')
                .eq('group_id', group.id)
                .order('created_at', { ascending: false })
                .limit(10)

              if (rejectionsData) {
                setRejections(rejectionsData as any)
              }
            }
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
    <DashboardContent
      user={user}
      activeGroup={activeGroup}
      rejections={rejections}
    />
  )
}
