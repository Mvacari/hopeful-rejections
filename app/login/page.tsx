'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { login, signup, type AuthError } from './actions'

function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? 'Please wait...' : children}
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loginState, loginAction] = useFormState(login, null)
  const [signupState, signupAction] = useFormState(signup, null)

  const error = loginState || signupState

  // Handle successful authentication
  useEffect(() => {
    if (error?.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [error, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Hopeful Rejections
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Track rejections with friends and compete on leaderboards
        </p>

        {error && !error.success && error.message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <form action={loginAction} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            <SubmitButton className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Log in
            </SubmitButton>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form action={signupAction} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <SubmitButton className="w-full py-3 bg-accent-500 text-white rounded-xl font-semibold hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Sign up
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}

