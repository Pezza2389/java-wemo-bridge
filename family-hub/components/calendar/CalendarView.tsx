'use client'

import { useState } from 'react'
import { useHousehold } from '@/context/HouseholdContext'
import { todayStr, formatDateShort, cn } from '@/lib/utils'
import { TrashIcon } from '@/components/ui/icons'
import { format } from 'date-fns'

type Filter = 'upcoming' | 'all'

function formatMonthAbbr(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'MMM')
}

function formatDayNum(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'd')
}

export function CalendarView() {
  const { events, deleteEvent, loading } = useHousehold()
  const [filter, setFilter] = useState<Filter>('upcoming')

  const today = todayStr()

  const filtered = events
    .filter(e => {
      if (filter === 'upcoming') return e.date >= today
      return true
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24 space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2">
        {[
          { label: 'Upcoming', value: 'upcoming' as Filter },
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
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-900 font-semibold text-lg">No events</p>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'upcoming' ? 'Nothing coming up' : 'Tap + to add an event'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(event => (
            <div
              key={event.id}
              className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white shadow-sm"
            >
              {/* Date box */}
              <div className="flex-shrink-0 w-12 h-14 bg-indigo-600 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold text-indigo-200 uppercase leading-none">
                  {formatMonthAbbr(event.date)}
                </span>
                <span className="text-xl font-bold text-white leading-none mt-0.5">
                  {formatDayNum(event.date)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                {event.time && (
                  <p className="text-xs text-slate-400 mt-0.5">⏰ {event.time}</p>
                )}
                {!event.time && (
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateShort(event.date)}</p>
                )}
              </div>

              <button
                onClick={() => deleteEvent(event.id)}
                className="flex-shrink-0 bg-red-50 text-red-500 rounded-lg px-2 py-1 text-xs min-h-[44px] flex items-center"
                aria-label="Delete event"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
