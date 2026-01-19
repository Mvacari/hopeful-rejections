import { Rejection, User } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

interface RejectionCardProps {
  rejection: Rejection & { users: User }
}

export default function RejectionCard({ rejection }: RejectionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {rejection.users.avatar_url ? (
            <Image
              src={rejection.users.avatar_url}
              alt={rejection.users.username}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold">
              {rejection.users.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{rejection.users.username}</span>
            <span className="text-xs text-gray-500">{formatDate(rejection.created_at)}</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{rejection.description}</p>
        </div>
      </div>
    </div>
  )
}
