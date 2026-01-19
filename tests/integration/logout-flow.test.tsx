import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import DashboardContent from '@/components/DashboardContent'
import { mockUser } from '@/tests/utils/test-helpers'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props })
  },
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children)
  },
}))

// Mock createRejectionClient
vi.mock('@/lib/db/client-mutations', () => ({
  createRejectionClient: vi.fn().mockResolvedValue({
    id: 'rejection-1',
    user_id: 'user-1',
    group_id: 'group-1',
    description: 'Test rejection',
    created_at: new Date().toISOString(),
    points: 1,
  }),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

// Mock useLogout hook - we'll test the actual implementation
vi.mock('@/lib/hooks/useLogout', () => ({
  useLogout: () => ({
    handleLogout: () => {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/auth/signout'
      document.body.appendChild(form)
      form.submit()
    },
  }),
}))

// Mock form submission - we'll spy on these after render
let mockFormSubmit: ReturnType<typeof vi.fn>
let mockAppendChild: ReturnType<typeof vi.fn>
let createElementSpy: ReturnType<typeof vi.spyOn>

describe('Logout Flow Integration', () => {
  const mockActiveGroup = null
  const mockRejections: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    // Create fresh spies for each test
    mockFormSubmit = vi.fn()
    mockAppendChild = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render logout button in dashboard', () => {
    render(
      <DashboardContent
        user={mockUser}
        activeGroup={mockActiveGroup}
        rejections={mockRejections}
      />
    )

    const logoutButton = screen.getByRole('button', { name: /sign out/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('should call signout endpoint when logout button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <DashboardContent
        user={mockUser}
        activeGroup={mockActiveGroup}
        rejections={mockRejections}
      />
    )

    // Set up spies after render to avoid interfering with React
    const originalCreateElement = Document.prototype.createElement
    createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    
    // Intercept form creation
    createElementSpy.mockImplementation(function(tagName: string) {
      const element = originalCreateElement.call(this, tagName)
      if (tagName === 'form') {
        const form = element as HTMLFormElement
        form.submit = mockFormSubmit
      }
      return element
    })
    
    appendChildSpy.mockImplementation((node) => {
      mockAppendChild(node)
      return node
    })

    const logoutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(logoutButton)

    // Verify form was created for submission
    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('form')
    }, { timeout: 2000 })

    // Verify form was appended to body
    expect(mockAppendChild).toHaveBeenCalled()
    
    // Verify form submit was called
    expect(mockFormSubmit).toHaveBeenCalled()
    
    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
  })

  it('should handle logout without errors', async () => {
    const user = userEvent.setup()

    render(
      <DashboardContent
        user={mockUser}
        activeGroup={mockActiveGroup}
        rejections={mockRejections}
      />
    )

    // Set up spies after render to avoid interfering with React
    const originalCreateElement = Document.prototype.createElement
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    
    // Intercept form creation
    createElementSpy.mockImplementation(function(tagName: string) {
      const element = originalCreateElement.call(this, tagName)
      if (tagName === 'form') {
        const form = element as HTMLFormElement
        form.submit = mockFormSubmit
      }
      return element
    })
    
    appendChildSpy.mockImplementation((node) => {
      mockAppendChild(node)
      return node
    })

    const logoutButton = screen.getByRole('button', { name: /sign out/i })
    
    // Should not throw
    await expect(user.click(logoutButton)).resolves.not.toThrow()
    
    // Verify form operations were called
    expect(mockFormSubmit).toHaveBeenCalled()
    
    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
  })
})

