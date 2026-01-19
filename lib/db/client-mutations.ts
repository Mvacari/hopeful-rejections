// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('users')
    .update({ avatar_url: avatarUrl } as never)
    .eq('id', userId)
    .select()
    .single() as any)

  if (error) throw error
  return data
}

export async function createUserClient(userId: string, username: string) {
  const supabase = createClient()
  
  // Verify user is authenticated and matches the userId
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || user.id !== userId) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, username })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    throw new Error(error.message || 'Failed to create user profile')
  }
  
  if (!data) {
    throw new Error('User profile created but no data returned')
  }
  
  return data
}

export async function createGroupClient(name: string, createdBy: string) {
  const supabase = createClient()
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== createdBy) {
    throw new Error('User not authenticated')
  }
  
  // Generate invite code using a simple random string
  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      created_by: createdBy,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (error) {
    console.error('Group creation error:', error)
    // If invite code collision, try again
    if (error.code === '23505') {
      return createGroupClient(name, createdBy)
    }
    throw new Error(error.message || `Failed to create group: ${error.code || 'Unknown error'}`)
  }

  if (!data) {
    throw new Error('Group created but no data returned')
  }

  // Add creator as member
  try {
    await joinGroupClient(data.id, createdBy)
  } catch (joinError: any) {
    console.error('Error joining group after creation:', joinError)
    // Don't fail the whole operation if join fails - group is still created
  }

  return data
}

export async function joinGroupClient(groupId: string, userId: string) {
  const supabase = createClient()
  
  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Update to active
    const { data, error } = await supabase
      .from('group_members')
      .update({ is_active: true })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Create new membership
  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createRejectionClient(
  userId: string,
  groupId: string,
  description: string
): Promise<{ id: string; user_id: string; group_id: string; description: string; created_at: string; points: number }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('rejections')
    .insert({
      user_id: userId,
      group_id: groupId,
      description,
      points: 1,
    })
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create rejection')
  return data
}

export async function getLeaderboardClient(
  groupId: string | null,
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all' = 'all'
) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_group_id: groupId,
    p_timeframe: timeframe,
  })

  if (error) throw error
  return data || []
}