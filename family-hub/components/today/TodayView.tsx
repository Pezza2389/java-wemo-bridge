'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useHousehold } from '@/context/HouseholdContext'
import { todayStr, formatDateShort } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { TrashIcon, CheckIcon } from '@/components/ui/icons'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { TaskModal } from '@/components/tasks/TaskModal'
import { MealModal } from '@/components/meals/MealModal'
import { ChoreModal } from '@/components/chores/ChoreModal'
import { EventModal } from '@/components/calendar/EventModal'
import type { MealSlot } from '@/types'

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
}

interface QuickAddProps {
  open: boolean
  onClose: () => void
  onSelect: (type: 'task' | 'meal' | 'chore' | 'event') => void
}

function QuickAddSheet({ open, onClose, onSelect }: QuickAddProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Quick Add">
      <div className="grid grid-cols-2 gap-3 pb-2">
        {[
          { type: 'task' as const, emoji: '✅', label: 'Task' },
          { type: 'meal' as const, emoji: '🍽️', label: 'Meal' },
          { type: 'chore' as const, emoji: '🧹', label: 'Chore' },
          { type: 'event' as const, emoji: '📅', label: 'Event' },
        ].map(item => (
          <button
            key={item.type}
            onClick={() => { onSelect(item.type); onClose() }}
            className="flex flex-col items-center justify-center gap-2 py-6 bg-slate-50 rounded-2xl text-slate-700 min-h-[100px] active:bg-slate-100 transition-colors"
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

interface TodayViewProps {
  fabOpen: boolean
  onFabClose: () => void
}

export function TodayView({ fabOpen, onFabClose }: TodayViewProps) {
  const { tasks, meals, chores, events, toggleTask, deleteTask, deleteMeal, completeChore, deleteEvent, loading } = useHousehold()
  const [activeModal, setActiveModal] = useState<'task' | 'meal' | 'chore' | 'event' | null>(null)
  const [mealSlot, setMealSlot] = useState<MealSlot>('dinner')

  const today = todayStr()

  const todayTasks = tasks.filter(t => t.due_date === today && !t.completed)
  const doneTasks = tasks.filter(t => t.due_date === today && t.completed)
  const allTodayTasks = [...todayTasks, ...doneTasks]
  const totalTasks = allTodayTasks.length
  const completedCount = doneTasks.length

  const todayMeals = meals.filter(m => m.date === today)
  const getMeal = (slot: MealSlot) => todayMeals.find(m => m.slot === slot)

  const dueChores = chores.filter(c => c.next_due <= today)
  const todayEvents = events.filter(e => e.date === today)

  const handleQuickSelect = (type: 'task' | 'meal' | 'chore' | 'event') => {
    setActiveModal(type)
  }

  const openMealModal = (slot: MealSlot) => {
    setMealSlot(slot)
    setActiveModal('meal')
  }

  const isEmpty = allTodayTasks.length === 0 && todayEvents.length === 0 && dueChores.length === 0

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-4 pb-24 space-y-4">
        {isEmpty && todayMeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-xl font-bold text-slate-900">Looking good!</p>
            <p className="text-slate-400 mt-2">Nothing on for today. Tap + to add something.</p>
          </div>
        ) : (
          <>
            {/* Tasks section */}
            {allTodayTasks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Tasks</h2>
                    <span className="text-xs text-slate-400 font-medium">
                      {completedCount}/{totalTasks} done
                    </span>
                  </div>
                  <Link href="/tasks" className="text-xs text-indigo-600 font-semibold">
                    View all
                  </Link>
                </div>

                {/* Progress bar */}
                {totalTasks > 0 && (
                  <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / totalTasks) * 100}%` }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {allTodayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 py-3 px-4 rounded-2xl bg-white shadow-sm ${task.completed ? 'opacity-60' : ''}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] ${
                          task.completed
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {task.completed && <CheckIcon className="w-4 h-4" />}
                      </button>
                      <span className={`flex-1 text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="bg-red-50 text-red-500 rounded-lg px-2 py-1 min-h-[44px] flex items-center"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Meals section */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Meals</h2>
                <Link href="/meals" className="text-xs text-indigo-600 font-semibold">
                  Plan meals
                </Link>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {MEAL_SLOTS.map((slot, i) => {
                  const meal = getMeal(slot)
                  return (
                    <div
                      key={slot}
                      className={`flex items-center gap-3 px-4 py-3 min-h-[52px] ${i < 2 ? 'border-b border-slate-100' : ''}`}
                    >
                      <button
                        onClick={() => openMealModal(slot)}
                        className="flex-1 flex items-center gap-3 text-left min-h-[44px]"
                      >
                        <span className="text-sm font-medium text-slate-500 w-20 flex-shrink-0">
                          {SLOT_LABELS[slot]}
                        </span>
                        {meal ? (
                          <span className="text-sm text-slate-900 font-medium">{meal.name}</span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Not planned</span>
                        )}
                      </button>
                      {meal && (
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="bg-red-50 text-red-500 rounded-lg w-8 h-8 flex items-center justify-center min-h-[44px] min-w-[44px]"
                        >
                          <span className="text-sm font-semibold">×</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Chores section */}
            {dueChores.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Chores Due</h2>
                  <Link href="/chores" className="text-xs text-indigo-600 font-semibold">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {dueChores.map(chore => (
                    <div key={chore.id} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{chore.title}</p>
                        {chore.next_due < today && (
                          <Badge variant="overdue" className="mt-0.5">Overdue</Badge>
                        )}
                        {chore.next_due === today && (
                          <Badge variant="today" className="mt-0.5">Due today</Badge>
                        )}
                      </div>
                      <button
                        onClick={() => completeChore(chore.id)}
                        className="bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm font-semibold min-h-[44px]"
                      >
                        Done ✓
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Events section */}
            {todayEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Today&apos;s Events</h2>
                </div>
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-white shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        {event.time && <p className="text-xs text-slate-400">⏰ {event.time}</p>}
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="bg-red-50 text-red-500 rounded-lg px-2 py-1 min-h-[44px] flex items-center"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Quick-add FAB sheet */}
      <QuickAddSheet
        open={fabOpen}
        onClose={onFabClose}
        onSelect={handleQuickSelect}
      />

      {/* Modals */}
      <TaskModal open={activeModal === 'task'} onClose={() => setActiveModal(null)} />
      <MealModal
        open={activeModal === 'meal'}
        onClose={() => setActiveModal(null)}
        date={today}
        slot={mealSlot}
        existingName={getMeal(mealSlot)?.name}
      />
      <ChoreModal open={activeModal === 'chore'} onClose={() => setActiveModal(null)} />
      <EventModal open={activeModal === 'event'} onClose={() => setActiveModal(null)} />
    </>
  )
}
