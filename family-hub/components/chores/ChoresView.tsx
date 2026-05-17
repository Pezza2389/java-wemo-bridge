'use client'

import { useState } from 'react'
import { useHousehold } from '@/context/HouseholdContext'
import { todayStr, cn } from '@/lib/utils'
import { ChoreItem } from './ChoreItem'

type Filter = 'due' | 'all'

export function ChoresView() {
  const { chores, completeChore, deleteChore, loading } = useHousehold()
  const [filter, setFilter] = useState<Filter>('due')

  const today = todayStr()

  const filtered = chores.filter(c => {
    if (filter === 'due') return c.next_due <= today
    return true
  })

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24 space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2">
        {[
          { label: 'Due Now', value: 'due' as Filter },
          { label: 'All', value: 'all' as Filter },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]',
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">
            {filter === 'due' ? '✨' : '🧹'}
          </div>
          <p className="text-slate-900 font-semibold text-lg">
            {filter === 'due' ? 'All caught up!' : 'No chores yet'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'due' ? 'No chores due right now' : 'Tap + to add your first chore'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(chore => (
            <ChoreItem
              key={chore.id}
              chore={chore}
              onComplete={completeChore}
              onDelete={deleteChore}
            />
          ))}
        </div>
      )}
    </div>
  )
}
