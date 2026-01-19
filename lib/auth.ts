'use client'

// Simple auth utility using localStorage
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('userId')
}

export function getCurrentUsername(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('username')
}

export function setCurrentUser(userId: string, username: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('userId', userId)
  localStorage.setItem('username', username)
}

export function clearCurrentUser() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
}

export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null
}

