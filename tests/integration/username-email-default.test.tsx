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

describe('Username defaults to email - Integration', () => {
  let testUserId: string | null = null
  let testEmail: string

  beforeAll(async () => {
    // Generate a unique email for testing
    const timestamp = Date.now()
    testEmail = `integration-test-${timestamp}@example.com`
  })

  afterAll(async () => {
    // Clean up: delete the test user
    if (testUserId) {
      const supabase = getSupabase()
      await supabase.from('users').delete().eq('id', testUserId)
      await supabase.auth.admin.deleteUser(testUserId)
    }
  })

  it.skipIf(shouldSkip)('should create user profile with username set to email when user signs up', async () => {
    const supabase = getSupabase()
    
    // Sign up a new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    })

    expect(authError).toBeNull()
    expect(authData.user).not.toBeNull()

    if (authData.user) {
      testUserId = authData.user.id

      // Wait a bit for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Fetch the user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single()

      expect(userError).toBeNull()
      expect(userData).not.toBeNull()
      expect(userData?.username).toBe(testEmail)
    }
  })

  it.skipIf(shouldSkip)('should allow querying users by their email username', async () => {
    const supabase = getSupabase()
    
    if (!testUserId) {
      throw new Error('Test user not created')
    }

    // Query user by username (which should be the email)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', testEmail)
      .single()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data?.id).toBe(testUserId)
    expect(data?.username).toBe(testEmail)
  })

  it.skipIf(shouldSkip)('should display email in leaderboard entries', async () => {
    const supabase = getSupabase()
    
    if (!testUserId) {
      throw new Error('Test user not created')
    }

    // Create a test group
    const { data: groupData } = await supabase
      .from('groups')
      .insert({
        name: 'Test Group',
        invite_code: `TEST-${Date.now()}`,
        created_by: testUserId,
      })
      .select()
      .single()

    expect(groupData).not.toBeNull()

    // Add user to group
    await supabase
      .from('group_members')
      .insert({
        group_id: groupData!.id,
        user_id: testUserId,
        is_active: true,
      })

    // Create a rejection to generate leaderboard data
    await supabase
      .from('rejections')
      .insert({
        user_id: testUserId,
        group_id: groupData!.id,
        description: 'Test rejection',
        points: 10,
      })

    // Fetch leaderboard
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .rpc('get_leaderboard', {
        p_group_id: groupData!.id,
        p_timeframe: 'all',
      })

    expect(leaderboardError).toBeNull()
    expect(leaderboardData).not.toBeNull()
    
    // Find our test user in the leaderboard
    const userEntry = leaderboardData?.find((entry: any) => entry.user_id === testUserId)
    expect(userEntry).not.toBeNull()
    expect(userEntry?.username).toBe(testEmail)

    // Clean up
    await supabase.from('rejections').delete().eq('group_id', groupData!.id)
    await supabase.from('group_members').delete().eq('group_id', groupData!.id)
    await supabase.from('groups').delete().eq('id', groupData!.id)
  })
})

