'use client'

import { useState } from 'react'
import { useHousehold } from '@/context/HouseholdContext'
import { getWeekDays, todayStr, cn } from '@/lib/utils'
import { MealModal } from './MealModal'
import type { MealSlot } from '@/types'

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
}

export function MealsView() {
  const { meals, deleteMeal, loading } = useHousehold()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSlot, setModalSlot] = useState<MealSlot>('dinner')

  const weekDays = getWeekDays(new Date())
  const today = todayStr()

  const getMealForSlot = (slot: MealSlot) =>
    meals.find(m => m.date === selectedDate && m.slot === slot)

  const openModal = (slot: MealSlot) => {
    setModalSlot(slot)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24 space-y-4">
      {/* 7-day strip */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex gap-1 justify-between">
          {weekDays.map(day => {
            const isSelected = day.str === selectedDate
            const isToday = day.str === today
            return (
              <button
                key={day.str}
                onClick={() => setSelectedDate(day.str)}
                className={cn(
                  'flex flex-col items-center px-2 py-2 rounded-xl flex-1 min-h-[56px] transition-colors',
                  isSelected ? 'bg-indigo-600 text-white' : 'text-slate-600'
                )}
              >
                <span className="text-[10px] font-medium uppercase">{day.name}</span>
                <span className={cn(
                  'text-base font-bold leading-tight',
                  isToday && !isSelected && 'text-indigo-600'
                )}>
                  {day.num}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Meals for selected day */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {SLOTS.map((slot, i) => {
          const meal = getMealForSlot(slot)
          return (
            <div
              key={slot}
              className={cn(
                'flex items-center gap-3 px-4 py-4 min-h-[60px]',
                i < SLOTS.length - 1 && 'border-b border-slate-100'
              )}
            >
              <button
                onClick={() => openModal(slot)}
                className="flex-1 flex items-center gap-3 text-left min-h-[44px]"
              >
                <span className="text-base font-medium text-slate-700 w-24 flex-shrink-0">
                  {SLOT_LABELS[slot]}
                </span>
                {meal ? (
                  <span className="text-sm text-slate-900 font-medium flex-1">{meal.name}</span>
                ) : (
                  <span className="text-sm text-slate-400 italic flex-1">Tap to plan...</span>
                )}
              </button>
              {meal && (
                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="flex-shrink-0 bg-red-50 text-red-500 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-semibold min-h-[44px] min-w-[44px]"
                  aria-label="Remove meal"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>

      <MealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedDate}
        slot={modalSlot}
        existingName={getMealForSlot(modalSlot)?.name}
      />
    </div>
  )
}
