'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserId, getCurrentUsername } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const userId = getCurrentUserId()
    const username = getCurrentUsername()

    if (userId && username) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  )
}
