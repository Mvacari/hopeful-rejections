'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserId, getCurrentUsername } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import LeaderboardContent from '@/components/LeaderboardContent'
import { User, Group, LeaderboardEntry } from '@/types/database'

export default function LeaderboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [groupLeaderboard, setGroupLeaderboard] = useState<LeaderboardEntry[]>([])
  const [allLeaderboard, setAllLeaderboard] = useState<LeaderboardEntry[]>([])
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
              const group = groupsData.groups
              setActiveGroup(group)

              // Get group leaderboard
              // @ts-ignore
              const { data: groupLb } = await supabase.rpc('get_leaderboard', {
                p_group_id: group.id,
                p_timeframe: 'all',
              })
              if (groupLb) setGroupLeaderboard(groupLb)
            }
          }

          // Get all leaderboard
          // @ts-ignore
          const { data: allLb } = await supabase.rpc('get_leaderboard', {
            p_group_id: null,
            p_timeframe: 'all',
          })
          if (allLb) setAllLeaderboard(allLb)
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
    <LeaderboardContent
      user={user}
      activeGroup={activeGroup}
      groupLeaderboard={groupLeaderboard}
      allLeaderboard={allLeaderboard}
    />
  )
}
