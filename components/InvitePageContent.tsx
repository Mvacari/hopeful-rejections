'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Group, User } from '@/types/database'
import { joinGroupClient } from '@/lib/db/client-mutations'
import Link from 'next/link'

interface InvitePageContentProps {
  group: Group
  currentUser: User | null
}

export default function InvitePageContent({ group, currentUser }: InvitePageContentProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    if (!currentUser) {
      router.push(`/auth?redirect=/invite/${group.invite_code}`)
      return
    }

    setLoading(true)
    try {
      await joinGroupClient(group.id, currentUser.id)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error joining group:', error)
      alert('Failed to join group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You&apos;ve been invited!
          </h1>
          <p className="text-gray-600">
            Join <span className="font-semibold text-primary-600">{group.name}</span> and start tracking rejections together
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-200">
            <h2 className="font-bold text-lg text-gray-900 mb-2">{group.name}</h2>
            <p className="text-sm text-gray-600">
              Join this group to compete on the leaderboard and share your rejection journey with friends.
            </p>
          </div>

          {currentUser ? (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleJoin}
                className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors text-lg"
              >
                Sign In to Join
              </button>
              <p className="text-sm text-center text-gray-500">
                Don&apos;t have an account? You&apos;ll be able to create one after clicking.
              </p>
            </div>
          )}

          <Link
            href="/auth"
            className="block text-center text-sm text-gray-600 hover:text-gray-900"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
