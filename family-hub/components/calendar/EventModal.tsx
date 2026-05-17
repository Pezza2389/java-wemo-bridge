'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useHousehold } from '@/context/HouseholdContext'
import { useToast } from '@/context/ToastContext'
import { todayStr } from '@/lib/utils'

interface EventModalProps {
  open: boolean
  onClose: () => void
}

export function EventModal({ open, onClose }: EventModalProps) {
  const { addEvent } = useHousehold()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await addEvent(title.trim(), date, time || null)
      toast('Event added')
      setTitle('')
      setDate(todayStr())
      setTime('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="New Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Event name</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's happening?"
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Time (optional)</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding...' : 'Add Event'}
        </button>
      </form>
    </BottomSheet>
  )
}
