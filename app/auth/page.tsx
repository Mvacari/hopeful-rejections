'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createUserClient } from '@/lib/db/client-mutations'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Ensure user profile exists, then redirect
        try {
          await ensureUserProfile(session.user.id)
          router.push('/dashboard')
        } catch (error) {
          console.error('Error ensuring user profile:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const ensureUserProfile = async (userId: string) => {
    // Check if profile exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    // If no profile exists, create one automatically
    if (!existing) {
      await createUserClient(userId, '') // Empty string will auto-generate username
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setMessage('Please enter both email and password')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up - create new account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setMessage(error.message)
          setLoading(false)
          return
        }

        if (!data.user) {
          setMessage('Failed to create account. Please try again.')
          setLoading(false)
          return
        }

        // Wait a moment for user to be created in auth.users
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Auto-create user profile
        try {
          await createUserClient(data.user.id, '')
          router.push('/dashboard')
        } catch (profileError: any) {
          // If profile creation fails, wait and retry once
          await new Promise(resolve => setTimeout(resolve, 1000))
          try {
            await createUserClient(data.user.id, '')
            router.push('/dashboard')
          } catch (retryError: any) {
            setMessage('Account created! Redirecting...')
            setTimeout(() => router.push('/dashboard'), 2000)
          }
        }
      } else {
        // Sign in - existing users
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setMessage(error.message)
          setLoading(false)
          return
        }

        if (!data.user) {
          setMessage('Sign in failed. Please try again.')
          setLoading(false)
          return
        }

        // Ensure profile exists, then redirect
        await ensureUserProfile(data.user.id)
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
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

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {message && (
            <p className={`text-sm text-center ${message.includes('error') || message.includes('Error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <div className="text-center space-y-2">
            {!isSignUp && (
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    setMessage('Please enter your email address first')
                    return
                  }
                  setLoading(true)
                  setMessage('')
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth?reset=true`,
                  })
                  if (error) {
                    setMessage(error.message)
                    setLoading(false)
                  } else {
                    setMessage('Password reset email sent! Check your inbox.')
                    setLoading(false)
                  }
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium block w-full"
              >
                Forgot password?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setPassword('')
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
