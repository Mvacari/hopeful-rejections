'use client'

/**
 * Custom hook for handling user logout
 * Submits a POST request to the signout endpoint
 */
export function useLogout() {
  const handleLogout = async () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/signout'
    document.body.appendChild(form)
    form.submit()
  }

  return { handleLogout }
}

