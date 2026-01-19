import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/auth/signout/route'

// Mock Supabase
const mockSignOut = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Logout Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sign out authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockSignOut.mockResolvedValue({ error: null })

    const request = new NextRequest('http://localhost:3000/auth/signout', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(mockGetUser).toHaveBeenCalled()
    expect(mockSignOut).toHaveBeenCalled()
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('should redirect to login even if no user is logged in', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    })

    const request = new NextRequest('http://localhost:3000/auth/signout', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(mockGetUser).toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('should handle signout errors gracefully', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
    mockSignOut.mockResolvedValue({ error: { message: 'Signout failed' } })

    const request = new NextRequest('http://localhost:3000/auth/signout', {
      method: 'POST',
    })

    const response = await POST(request)

    // Should still redirect to login even on error
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('/login')
  })
})

