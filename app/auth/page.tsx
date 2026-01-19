'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AvatarCapture from '@/components/AvatarCapture'
import { createUserClient } from '@/lib/db/client-mutations'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'email' | 'onboarding'>('email')
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check for error in URL params
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      setMessage('Check your email for the magic link!')
      setLoading(false)
    }
  }

  const handleOnboarding = async (avatarUrl: string) => {
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

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Welcome to Hopeful Rejections!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Let&apos;s set up your profile
          </p>

          <div className="space-y-6">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <AvatarCapture
                userId={userId!}
                onComplete={handleOnboarding}
              />
            </div>

            {message && (
              <p className={`text-sm text-center ${message.includes('error') ? 'text-red-600' : 'text-gray-600'}`}>
                {message}
              </p>
            )}

            <button
              onClick={() => handleOnboarding('')}
              disabled={loading || !username.trim()}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
            <p className="text-xs text-center text-gray-500">
              Photo is optional - you can add it later
            </p>
          </div>
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

        <form onSubmit={handleMagicLink} className="space-y-4">
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

          {message && (
            <p className={`text-sm text-center ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
