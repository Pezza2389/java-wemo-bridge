'use client'

import { cn, formatDateShort, todayStr } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { TrashIcon } from '@/components/ui/icons'
import type { Chore } from '@/types'

interface ChoreItemProps {
  chore: Chore
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

function getChoreEmoji(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('bin') || t.includes('trash') || t.includes('rubbish')) return '🗑️'
  if (t.includes('vacuum') || t.includes('hoover')) return '🔌'
  if (t.includes('laundry') || t.includes('wash') || t.includes('clothes')) return '👕'
  if (t.includes('dish') || t.includes('kitchen')) return '🍽️'
  if (t.includes('mow') || t.includes('garden') || t.includes('lawn')) return '🌿'
  if (t.includes('window') || t.includes('glass')) return '🪟'
  if (t.includes('bathroom') || t.includes('toilet')) return '🚿'
  if (t.includes('floor') || t.includes('mop') || t.includes('sweep')) return '🧹'
  if (t.includes('car') || t.includes('wash')) return '🚗'
  if (t.includes('shop') || t.includes('grocery') || t.includes('food')) return '🛒'
  return '🧹'
}

function getChoreBadge(chore: Chore) {
  const today = todayStr()
  if (chore.next_due < today) return { variant: 'overdue' as const, label: `Overdue since ${formatDateShort(chore.next_due)}` }
  if (chore.next_due === today) return { variant: 'today' as const, label: 'Due today' }
  return { variant: 'upcoming' as const, label: `Due ${formatDateShort(chore.next_due)}` }
}

function getIntervalLabel(days: number): string {
  if (days === 1) return 'Daily'
  if (days === 7) return 'Weekly'
  if (days === 14) return 'Fortnightly'
  if (days === 30) return 'Monthly'
  return `Every ${days} days`
}

export function ChoreItem({ chore, onComplete, onDelete }: ChoreItemProps) {
  const badge = getChoreBadge(chore)
  const emoji = getChoreEmoji(chore.title)

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white shadow-sm">
      <div className="text-2xl flex-shrink-0 w-10 text-center">{emoji}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{chore.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="text-xs text-slate-400">{getIntervalLabel(chore.interval_days)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onComplete(chore.id)}
          className="bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm font-semibold min-h-[44px] flex items-center gap-1"
        >
          Done ✓
        </button>
        <button
          onClick={() => onDelete(chore.id)}
          className="bg-red-50 text-red-500 rounded-lg px-2 py-1 text-xs min-h-[44px] flex items-center"
          aria-label="Delete chore"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
