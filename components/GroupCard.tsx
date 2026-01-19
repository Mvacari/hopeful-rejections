import { Group } from '@/types/database'
import Link from 'next/link'

interface GroupCardProps {
  group: Group
  isActive?: boolean
}

export default function GroupCard({ group, isActive }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
        isActive ? 'border-primary-400 bg-primary-50' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{group.name}</h3>
            <p className="text-sm text-gray-500">Code: {group.invite_code}</p>
          </div>
          {isActive && (
            <div className="px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
              Active
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
