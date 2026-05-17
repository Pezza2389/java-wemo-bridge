'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useHousehold } from '@/context/HouseholdContext'
import { useToast } from '@/context/ToastContext'
import { todayStr } from '@/lib/utils'

interface ChoreModalProps {
  open: boolean
  onClose: () => void
}

const INTERVAL_OPTIONS = [
  { label: 'Day', value: 1 },
  { label: 'Week', value: 7 },
  { label: '2 Weeks', value: 14 },
  { label: 'Month', value: 30 },
]

export function ChoreModal({ open, onClose }: ChoreModalProps) {
  const { addChore } = useHousehold()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const [startDate, setStartDate] = useState(todayStr())
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await addChore(title.trim(), intervalDays, startDate)
      toast('Chore added')
      setTitle('')
      setIntervalDays(7)
      setStartDate(todayStr())
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="New Chore">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Chore name</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Vacuum living room"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Repeat every</label>
          <div className="flex gap-2">
            {INTERVAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntervalDays(opt.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 min-h-[44px] transition-colors ${
                  intervalDays === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">First due</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : 'Add Chore'}
        </button>
      </form>
    </BottomSheet>
  )
}
