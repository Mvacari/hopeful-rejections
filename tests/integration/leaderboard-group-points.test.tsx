import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create a Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Skip tests if environment variables are not set
const shouldSkip = !supabaseUrl || !supabaseAnonKey

const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. ` +
      `Found URL: ${supabaseUrl ? 'set' : 'missing'}, Key: ${supabaseAnonKey ? 'set' : 'missing'}`
    )
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

describe('Leaderboard Group Points Integration', () => {
  let testUserId1: string | null = null
  let testUserId2: string | null = null
  let testGroupId: string | null = null
  let testEmail1: string
  let testEmail2: string

  beforeAll(async () => {
    const timestamp = Date.now()
    testEmail1 = `leaderboard-test-1-${timestamp}@example.com`
    testEmail2 = `leaderboard-test-2-${timestamp}@example.com`
  })

  afterAll(async () => {
    // Clean up test data
    const supabase = getSupabase()
    
    if (testGroupId) {
      await supabase.from('rejections').delete().eq('group_id', testGroupId)
      await supabase.from('group_members').delete().eq('group_id', testGroupId)
      await supabase.from('groups').delete().eq('id', testGroupId)
    }
    
    if (testUserId1) {
      await supabase.from('users').delete().eq('id', testUserId1)
      await supabase.auth.admin.deleteUser(testUserId1)
    }
    
    if (testUserId2) {
      await supabase.from('users').delete().eq('id', testUserId2)
      await supabase.auth.admin.deleteUser(testUserId2)
    }
  })

  it.skipIf(shouldSkip)('should aggregate points correctly for group leaderboard', async () => {
    const supabase = getSupabase()

    // Create two test users
    const { data: user1Data } = await supabase.auth.signUp({
      email: testEmail1,
      password: 'TestPassword123!',
    })
    
    const { data: user2Data } = await supabase.auth.signUp({
      email: testEmail2,
      password: 'TestPassword123!',
    })

    expect(user1Data.user).not.toBeNull()
    expect(user2Data.user).not.toBeNull()

    testUserId1 = user1Data.user!.id
    testUserId2 = user2Data.user!.id

    // Wait for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create a test group
    const { data: groupData } = await supabase
      .from('groups')
      .insert({
        name: 'Leaderboard Test Group',
        invite_code: `LEAD-${Date.now()}`,
        created_by: testUserId1,
      })
      .select()
      .single()

    expect(groupData).not.toBeNull()
    testGroupId = groupData!.id

    // Add both users to the group
    await supabase.from('group_members').insert([
      { group_id: testGroupId, user_id: testUserId1, is_active: true },
      { group_id: testGroupId, user_id: testUserId2, is_active: true },
    ])

    // Create rejections with different point values
    await supabase.from('rejections').insert([
      { user_id: testUserId1, group_id: testGroupId, description: 'Rejection 1', points: 5 },
      { user_id: testUserId1, group_id: testGroupId, description: 'Rejection 2', points: 3 },
      { user_id: testUserId2, group_id: testGroupId, description: 'Rejection 3', points: 10 },
    ])

    // Fetch leaderboard for the group
    const { data: leaderboard, error } = await supabase.rpc('get_leaderboard', {
      p_group_id: testGroupId,
      p_timeframe: 'all',
    })

    expect(error).toBeNull()
    expect(leaderboard).not.toBeNull()
    expect(leaderboard).toHaveLength(2)

    // User 2 should be first with 10 points
    expect(leaderboard![0].user_id).toBe(testUserId2)
    expect(leaderboard![0].total_points).toBe(10)
    expect(leaderboard![0].rank).toBe(1)

    // User 1 should be second with 8 points (5 + 3)
    expect(leaderboard![1].user_id).toBe(testUserId1)
    expect(leaderboard![1].total_points).toBe(8)
    expect(leaderboard![1].rank).toBe(2)
  })

  it.skipIf(shouldSkip)('should filter leaderboard by timeframe', async () => {
    const supabase = getSupabase()

    if (!testGroupId || !testUserId1) {
      throw new Error('Test setup incomplete')
    }

    // Create a rejection from yesterday (should not appear in daily leaderboard)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await supabase.from('rejections').insert({
      user_id: testUserId1,
      group_id: testGroupId,
      description: 'Old Rejection',
      points: 100,
      created_at: yesterday.toISOString(),
    })

    // Fetch daily leaderboard
    const { data: dailyLeaderboard } = await supabase.rpc('get_leaderboard', {
      p_group_id: testGroupId,
      p_timeframe: 'daily',
    })

    // The old rejection should not be counted in daily timeframe
    const user1Daily = dailyLeaderboard?.find((entry: any) => entry.user_id === testUserId1)
    expect(user1Daily?.total_points).toBeLessThan(100)
  })

  it.skipIf(shouldSkip)('should only include active group members in group leaderboard', async () => {
    const supabase = getSupabase()

    if (!testGroupId || !testUserId1) {
      throw new Error('Test setup incomplete')
    }

    // Deactivate user1 from the group
    await supabase
      .from('group_members')
      .update({ is_active: false })
      .eq('group_id', testGroupId)
      .eq('user_id', testUserId1)

    // Fetch leaderboard
    const { data: leaderboard } = await supabase.rpc('get_leaderboard', {
      p_group_id: testGroupId,
      p_timeframe: 'all',
    })

    // User1 should not appear since they're inactive
    const user1Entry = leaderboard?.find((entry: any) => entry.user_id === testUserId1)
    expect(user1Entry).toBeUndefined()

    // Only user2 should appear
    expect(leaderboard).toHaveLength(1)
    expect(leaderboard![0].user_id).toBe(testUserId2)
  })
})

