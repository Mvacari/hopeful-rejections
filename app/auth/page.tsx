'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user already has a username stored
    const storedUserId = localStorage.getItem('userId')
    const storedUsername = localStorage.getItem('username')
    
    if (storedUserId && storedUsername) {
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setMessage('Please enter a username')
      return
    }

    if (username.trim().length < 3) {
      setMessage('Username must be at least 3 characters')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Create user by username only
      // @ts-ignore - RPC function not in types
      const { data, error } = await supabase.rpc('create_user_by_username', {
        p_username: username.trim()
      })

      if (error) {
        setMessage(error.message || 'Failed to create account')
        setLoading(false)
        return
      }

      if (!data) {
        setMessage('Failed to create account')
        setLoading(false)
        return
      }

      // Store user info in localStorage
      const userData = data as { id: string; username: string }
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('username', userData.username)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error:', err)
      setMessage(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Hopeful Rejections
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Track rejections with friends and compete on leaderboards
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={30}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Username must be at least 3 characters
            </p>
          </div>

          {message && (
            <p className={`text-sm text-center ${message.includes('error') || message.includes('Error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
