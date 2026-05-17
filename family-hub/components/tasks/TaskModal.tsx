'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useHousehold } from '@/context/HouseholdContext'
import { useToast } from '@/context/ToastContext'
import { todayStr } from '@/lib/utils'
import type { Recurrence } from '@/types'

interface TaskModalProps {
  open: boolean
  onClose: () => void
}

export function TaskModal({ open, onClose }: TaskModalProps) {
  const { addTask } = useHousehold()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayStr())
  const [recurrence, setRecurrence] = useState<Recurrence | ''>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await addTask(title.trim(), dueDate || null, recurrence as Recurrence || null)
      toast('Task added')
      setTitle('')
      setDueDate(todayStr())
      setRecurrence('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Task name</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Repeat</label>
          <select
            value={recurrence}
            onChange={e => setRecurrence(e.target.value as Recurrence | '')}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </BottomSheet>
  )
}
