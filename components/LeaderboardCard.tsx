import { LeaderboardEntry } from '@/types/database'
import Image from 'next/image'

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  rank: number
}

export default function LeaderboardCard({ entry, rank }: LeaderboardCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-white text-gray-800 border-gray-200'
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${getRankColor(rank)} transition-all hover:scale-[1.02]`}>
      <div className="flex-shrink-0 w-10 text-center font-bold text-lg">
        #{rank}
      </div>
      <div className="flex-shrink-0">
        {entry.avatar_url ? (
          <Image
            src={entry.avatar_url}
            alt={entry.username || 'User avatar'}
            width={48}
            height={48}
            className="rounded-full object-cover border-2 border-white"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold text-lg">
            {entry.username?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{entry.username || 'Anonymous'}</div>
      </div>
      <div className="flex-shrink-0">
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{entry.total_points}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>
    </div>
  )
}
