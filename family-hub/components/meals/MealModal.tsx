'use client'

import { useState, useMemo } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useHousehold } from '@/context/HouseholdContext'
import { useToast } from '@/context/ToastContext'
import { formatDateShort } from '@/lib/utils'
import type { MealSlot } from '@/types'

interface MealModalProps {
  open: boolean
  onClose: () => void
  date: string
  slot: MealSlot
  existingName?: string
}

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

export function MealModal({ open, onClose, date, slot, existingName }: MealModalProps) {
  const { setMeal, meals } = useHousehold()
  const { toast } = useToast()
  const [name, setName] = useState(existingName || '')
  const [submitting, setSubmitting] = useState(false)

  const recentMeals = useMemo(() => {
    const names = meals
      .map(m => m.name)
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .slice(-16)
      .reverse()
    return names.slice(0, 8)
  }, [meals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await setMeal(date, slot, name.trim())
      toast(`${SLOT_LABELS[slot]} planned`)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`${SLOT_LABELS[slot]} · ${formatDateShort(date)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Meal name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`What's for ${slot}?`}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        {recentMeals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Recent meals</p>
            <div className="flex flex-wrap gap-2">
              {recentMeals.map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setName(meal)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium min-h-[44px]"
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : 'Save Meal'}
        </button>
      </form>
    </BottomSheet>
  )
}
