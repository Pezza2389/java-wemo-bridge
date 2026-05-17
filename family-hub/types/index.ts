export type MealSlot = 'breakfast' | 'lunch' | 'dinner'
export type Recurrence = 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  household_id: string
  title: string
  due_date: string | null
  completed: boolean
  completed_at: string | null
  recurrence: Recurrence | null
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  household_id: string
  date: string
  slot: MealSlot
  name: string
  created_at: string
}

export interface Chore {
  id: string
  household_id: string
  title: string
  interval_days: number
  next_due: string
  last_completed: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  household_id: string
  title: string
  date: string
  time: string | null
  notes: string | null
  created_at: string
}
