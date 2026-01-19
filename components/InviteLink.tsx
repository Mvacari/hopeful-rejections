'use client'

import { useState, useEffect } from 'react'

interface InviteLinkProps {
  inviteCode: string
  groupName: string
}

export default function InviteLink({ inviteCode, groupName }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteUrl(`${window.location.origin}/invite/${inviteCode}`)
    }
  }, [inviteCode])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border-2 border-primary-200">
      <h3 className="font-bold text-lg text-gray-900 mb-2">Invite Friends to {groupName}</h3>
      <p className="text-sm text-gray-600 mb-4">Share this link with your friends:</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={inviteUrl}
          readOnly
          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
