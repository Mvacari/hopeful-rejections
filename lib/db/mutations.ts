// @ts-nocheck
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function createUser(userId: string, username: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, username })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createGroup(name: string, createdBy: string) {
  const supabase = await createServerClient()
  
  // Generate invite code
  const { data: inviteCodeData, error: codeError } = await supabase.rpc('generate_invite_code')
  if (codeError) throw codeError
  
  const inviteCode = inviteCodeData || Math.random().toString(36).substring(2, 10).toUpperCase()

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      created_by: createdBy,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (error) throw error

  // Add creator as member
  await joinGroup(data.id, createdBy)

  return data
}

export async function joinGroup(groupId: string, userId: string) {
  const supabase = await createServerClient()
  
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

export async function createRejection(
  userId: string,
  groupId: string,
  description: string
) {
  const supabase = await createServerClient()
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
  return data
}

export async function deleteRejection(rejectionId: string, userId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('rejections')
    .delete()
    .eq('id', rejectionId)
    .eq('user_id', userId)

  if (error) throw error
}
