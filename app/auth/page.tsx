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
  const [step, setStep] = useState<'auth' | 'onboarding'>('auth')
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check for error in URL params (for backwards compatibility)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) {
      setMessage(`Authentication error: ${error}`)
    }
  }, [])

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkOnboarding(session.user.id)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await checkOnboarding(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkOnboarding = async (id: string) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user:', error)
        setMessage(`Error: ${error.message}`)
        return
      }

      if (user) {
        router.push('/dashboard')
      } else {
        setUserId(id)
        setStep('onboarding')
      }
    } catch (err: any) {
      console.error('Unexpected error in checkOnboarding:', err)
      setMessage(`Error: ${err.message || 'Failed to check user status'}`)
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
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setMessage(error.message)
          setLoading(false)
        } else if (data.user) {
          // User created, go to onboarding
          setUserId(data.user.id)
          setStep('onboarding')
          setLoading(false)
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setMessage(error.message)
          setLoading(false)
        } else if (data.user) {
          // Check if user needs onboarding
          await checkOnboarding(data.user.id)
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setMessage(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const handleOnboarding = async () => {
    if (!userId || !username.trim()) {
      setMessage('Please enter a username')
      return
    }

    setLoading(true)
    try {
      await createUserClient(userId, username.trim())
      router.push('/dashboard')
    } catch (error: any) {
      setMessage(error.message || 'Failed to complete onboarding')
      setLoading(false)
    }
  }

  if (step === 'onboarding' && userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Welcome to Hopeful Rejections!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Let&apos;s set up your profile
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleOnboarding(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={30}
                autoFocus
              />
            </div>

            {message && (
              <p className={`text-sm text-center ${message.includes('error') || message.includes('Error') ? 'text-red-600' : 'text-gray-600'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    )
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
            <p className={`text-sm text-center ${message.includes('error') || message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
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

          <div className="text-center">
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
