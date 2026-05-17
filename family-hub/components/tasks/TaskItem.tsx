'use client'

import { cn, formatDateShort, todayStr } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { TrashIcon } from '@/components/ui/icons'
import type { Task } from '@/types'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  showDate?: boolean
}

function getDueBadge(task: Task) {
  if (task.completed) return { variant: 'done' as const, label: 'Done' }
  if (!task.due_date) return null
  const today = todayStr()
  if (task.due_date < today) return { variant: 'overdue' as const, label: `Overdue ${formatDateShort(task.due_date)}` }
  if (task.due_date === today) return { variant: 'today' as const, label: 'Today' }
  return { variant: 'upcoming' as const, label: formatDateShort(task.due_date) }
}

export function TaskItem({ task, onToggle, onDelete, showDate = true }: TaskItemProps) {
  const badge = getDueBadge(task)

  return (
    <div className={cn(
      'flex items-center gap-3 py-3 px-4 rounded-2xl bg-white shadow-sm',
      task.completed && 'opacity-60'
    )}>
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]',
          task.completed
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'border-slate-300 hover:border-indigo-400'
        )}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-slate-900 truncate',
          task.completed && 'line-through text-slate-400'
        )}>
          {task.title}
        </p>
        {showDate && badge && (
          <div className="mt-0.5">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        )}
        {task.recurrence && (
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{task.recurrence}</p>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 bg-red-50 text-red-500 rounded-lg px-2 py-1 text-xs font-medium min-h-[44px] flex items-center"
        aria-label="Delete task"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
