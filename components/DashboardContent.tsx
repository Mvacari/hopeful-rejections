'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Group, Rejection } from '@/types/database'
import { createRejectionClient } from '@/lib/db/client-mutations'
import RejectionCard from './RejectionCard'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface DashboardContentProps {
  user: User
  activeGroup: Group | null
  rejections: (Rejection & { users: User })[]
}

export default function DashboardContent({ user, activeGroup, rejections: initialRejections }: DashboardContentProps) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [rejections, setRejections] = useState(initialRejections)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/signout'
    document.body.appendChild(form)
    form.submit()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGroup || !description.trim()) return

    setLoading(true)
    try {
      const newRejection = await createRejectionClient(user.id, activeGroup.id, description.trim())
      const rejectionWithUser: Rejection & { users: User } = {
        id: newRejection.id,
        user_id: newRejection.user_id,
        group_id: newRejection.group_id,
        description: newRejection.description,
        created_at: newRejection.created_at,
        points: newRejection.points,
        users: user,
      }
      setRejections([rejectionWithUser, ...rejections])
      setDescription('')
    } catch (error: any) {
      console.error('Error creating rejection:', error)
      alert(`Failed to create rejection: ${error.message || 'Unknown error'}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Hopeful Rejections</h1>
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.username || 'User avatar'}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Active Group */}
        {activeGroup ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeGroup.name}</h2>
                <p className="text-sm text-gray-500">Your active group</p>
              </div>
              <Link
                href="/leaderboard"
                className="px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors text-sm"
              >
                Leaderboard
              </Link>
            </div>
            <Link
              href="/groups"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Manage Groups →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600 mb-4">You&apos;re not in any group yet.</p>
            <Link
              href="/groups"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Create or Join a Group
            </Link>
          </div>
        )}

        {/* Quick Rejection Entry */}
        {activeGroup && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add a Rejection</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your rejection in a sentence or two..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Rejection (+1 point)'}
              </button>
            </form>
          </div>
        )}

        {/* Recent Rejections */}
        {activeGroup && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Rejections</h2>
              <Link
                href="/rejections/new"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {rejections.length > 0 ? (
                rejections.map((rejection) => (
                  <RejectionCard key={rejection.id} rejection={rejection} />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">No rejections yet. Be the first to add one!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-xs font-medium">Leaderboard</span>
          </Link>
          <Link
            href="/groups"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-medium">Groups</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
