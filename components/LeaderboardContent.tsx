'use client'

import { useState } from 'react'
import { User, Group, LeaderboardEntry } from '@/types/database'
import { getLeaderboardClient } from '@/lib/db/client-mutations'
import LeaderboardCard from './LeaderboardCard'
import Link from 'next/link'

interface LeaderboardContentProps {
  user: User
  activeGroup: Group | null
  groupLeaderboard: LeaderboardEntry[]
  allLeaderboard: LeaderboardEntry[]
}

export default function LeaderboardContent({
  user,
  activeGroup,
  groupLeaderboard: initialGroupLeaderboard,
  allLeaderboard: initialAllLeaderboard,
}: LeaderboardContentProps) {
  const [scope, setScope] = useState<'group' | 'all'>('group')
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all')
  const [leaderboard, setLeaderboard] = useState(
    activeGroup ? initialGroupLeaderboard : initialAllLeaderboard
  )
  const [loading, setLoading] = useState(false)

  const handleTimeframeChange = async (newTimeframe: 'daily' | 'weekly' | 'monthly' | 'all') => {
    setTimeframe(newTimeframe)
    setLoading(true)
    try {
      const groupId = scope === 'group' && activeGroup ? activeGroup.id : null
      const data = await getLeaderboardClient(groupId, newTimeframe)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScopeChange = async (newScope: 'group' | 'all') => {
    setScope(newScope)
    setLoading(true)
    try {
      const groupId = newScope === 'group' && activeGroup ? activeGroup.id : null
      const data = await getLeaderboardClient(groupId, timeframe)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Scope Toggle */}
        {activeGroup && (
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex gap-2">
            <button
              onClick={() => handleScopeChange('group')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-colors ${
                scope === 'group'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {activeGroup.name}
            </button>
            <button
              onClick={() => handleScopeChange('all')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-colors ${
                scope === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Groups
            </button>
          </div>
        )}

        {/* Timeframe Filters */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex gap-2 overflow-x-auto">
          {(['daily', 'weekly', 'monthly', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors disabled:opacity-50 ${
                timeframe === tf
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <LeaderboardCard
                key={entry.user_id}
                entry={entry}
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">No entries yet. Start adding rejections!</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-1 text-primary-600"
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
