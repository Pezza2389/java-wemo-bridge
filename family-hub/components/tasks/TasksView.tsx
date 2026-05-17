'use client'

import { useState } from 'react'
import { useHousehold } from '@/context/HouseholdContext'
import { todayStr } from '@/lib/utils'
import { TaskItem } from './TaskItem'
import { cn } from '@/lib/utils'

type Filter = 'today' | 'upcoming' | 'all' | 'completed'

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'All', value: 'all' },
  { label: 'Done', value: 'completed' },
]

export function TasksView() {
  const { tasks, toggleTask, deleteTask, loading } = useHousehold()
  const [filter, setFilter] = useState<Filter>('today')

  const today = todayStr()

  const filtered = tasks
    .filter(t => {
      if (filter === 'today') return !t.completed && t.due_date === today
      if (filter === 'upcoming') return !t.completed && t.due_date != null && t.due_date > today
      if (filter === 'completed') return t.completed
      return true // all
    })
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })

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
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]',
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
            {filter === 'completed' ? '🎉' : filter === 'today' ? '✅' : '📋'}
          </div>
          <p className="text-slate-900 font-semibold text-lg">
            {filter === 'completed' ? 'Nothing done yet' : 'No tasks here'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'today' ? 'No tasks due today' :
             filter === 'upcoming' ? 'No upcoming tasks' :
             filter === 'completed' ? 'Complete tasks to see them here' :
             'Tap + to add a task'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              showDate={filter !== 'today'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
