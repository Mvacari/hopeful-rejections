// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { User, Group, Rejection, LeaderboardEntry } from '@/types/database'

export async function getUser(userId: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getUser(user.id)
}

export async function getActiveGroup(userId: string): Promise<Group | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('groups(*)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data.groups as Group
}

export async function getGroupByInviteCode(inviteCode: string): Promise<Group | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()

  if (error || !data) return null
  return data
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('*, users(*)')
    .eq('group_id', groupId)
    .eq('is_active', true)

  if (error) return []
  return data || []
}

export async function getRejections(groupId: string, limit = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rejections')
    .select('*, users(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

export async function getLeaderboard(
  groupId: string | null,
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all' = 'all'
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_group_id: groupId,
    p_timeframe: timeframe,
  })

  if (error) return []
  return data || []
}

export async function getUserGroups(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', userId)

  if (error) return []
  return data || []
}
