'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Group } from '@/types/database'
import { createRejectionClient } from '@/lib/db/client-mutations'
import Link from 'next/link'

interface NewRejectionFormProps {
  user: User
  group: Group
}

export default function NewRejectionForm({ user, group }: NewRejectionFormProps) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    try {
      await createRejectionClient(user.id, group.id, description.trim())
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating rejection:', error)
      alert('Failed to create rejection. Please try again.')
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
          <h1 className="text-2xl font-bold text-gray-900">New Rejection</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Group</p>
            <p className="font-semibold text-gray-900">{group.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your rejection
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a sentence or two about your rejection..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                maxLength={500}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-right">
                {description.length}/500
              </p>
            </div>

            <div className="bg-primary-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">+1 point</span> will be added to your score when you submit this rejection.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Rejection'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
