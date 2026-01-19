'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Group } from '@/types/database'
import { createGroupClient, joinGroupClient } from '@/lib/db/client-mutations'
import GroupCard from './GroupCard'
import InviteLink from './InviteLink'
import Link from 'next/link'
import { useLogout } from '@/lib/hooks/useLogout'

interface GroupsContentProps {
  user: User
  activeGroup: Group | null
  userGroups: Group[]
}

export default function GroupsContent({ user, activeGroup, userGroups: initialGroups }: GroupsContentProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [userGroups, setUserGroups] = useState(initialGroups)
  const router = useRouter()
  const { handleLogout } = useLogout()

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    setLoading(true)
    try {
      const newGroup = await createGroupClient(groupName.trim(), user.id)
      setUserGroups([...userGroups, newGroup])
      setGroupName('')
      setShowCreateForm(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error creating group:', error)
      const errorMessage = error?.message || error?.code || 'Unknown error'
      alert(`Failed to create group: ${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Active Group Invite Link */}
        {activeGroup && (
          <InviteLink inviteCode={activeGroup.invite_code} groupName={activeGroup.name} />
        )}

        {/* Create Group Form */}
        {showCreateForm ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={50}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !groupName.trim()}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setGroupName('')
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full py-4 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            + Create New Group
          </button>
        )}

        {/* User Groups */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Groups</h2>
          {userGroups.length > 0 ? (
            <div className="space-y-3">
              {userGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isActive={activeGroup?.id === group.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-gray-500 mb-4">You&apos;re not in any groups yet.</p>
              <p className="text-sm text-gray-400">
                Create a group or ask a friend for an invite link!
              </p>
            </div>
          )}
        </div>
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
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-xs font-medium">Leaderboard</span>
          </Link>
          <Link
            href="/groups"
            className="flex flex-col items-center gap-1 text-primary-600"
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
