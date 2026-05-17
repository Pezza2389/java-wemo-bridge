'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, HOUSEHOLD_ID, IS_DEMO } from '@/lib/supabase'
import { todayStr, addDaysStr } from '@/lib/utils'
import type { Task, Meal, Chore, CalendarEvent, MealSlot, Recurrence } from '@/types'

// ── localStorage helpers ──────────────────────────────────────────────────────

function newId() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36) }

function lsGet<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function lsSet(key: string, val: unknown) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(val))
}

function seedDemoData(t: string) {
  const tasks: Task[] = [
    { id: newId(), household_id: 'home', title: 'Buy groceries', due_date: t, completed: false, completed_at: null, recurrence: null, created_at: t, updated_at: t },
    { id: newId(), household_id: 'home', title: 'Call the dentist', due_date: t, completed: false, completed_at: null, recurrence: null, created_at: t, updated_at: t },
    { id: newId(), household_id: 'home', title: 'Pick up kids from school', due_date: t, completed: true, completed_at: new Date().toISOString(), recurrence: null, created_at: t, updated_at: t },
    { id: newId(), household_id: 'home', title: 'Pay electricity bill', due_date: addDaysStr(t, 3), completed: false, completed_at: null, recurrence: null, created_at: t, updated_at: t },
  ]
  const meals: Meal[] = [
    { id: newId(), household_id: 'home', date: t, slot: 'breakfast', name: 'Porridge & banana', created_at: t },
    { id: newId(), household_id: 'home', date: t, slot: 'lunch', name: 'Toasted sandwich', created_at: t },
    { id: newId(), household_id: 'home', date: t, slot: 'dinner', name: 'Spaghetti Bolognese', created_at: t },
    { id: newId(), household_id: 'home', date: addDaysStr(t, 1), slot: 'dinner', name: 'Chicken stir-fry', created_at: t },
  ]
  const chores: Chore[] = [
    { id: newId(), household_id: 'home', title: 'Bins', interval_days: 7, next_due: t, last_completed: null, created_at: t, updated_at: t },
    { id: newId(), household_id: 'home', title: 'Vacuum', interval_days: 7, next_due: addDaysStr(t, 2), last_completed: null, created_at: t, updated_at: t },
    { id: newId(), household_id: 'home', title: 'Laundry', interval_days: 3, next_due: t, last_completed: null, created_at: t, updated_at: t },
  ]
  const events: CalendarEvent[] = [
    { id: newId(), household_id: 'home', title: 'Parents evening', date: addDaysStr(t, 5), time: '18:30', notes: null, created_at: t },
    { id: newId(), household_id: 'home', title: 'Family dinner out', date: addDaysStr(t, 9), time: '19:00', notes: null, created_at: t },
  ]
  return { tasks, meals, chores, events }
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchTasks(): Promise<Task[]> {
  if (!supabase) return []
  const { data } = await supabase.from('tasks').select('*').eq('household_id', HOUSEHOLD_ID).order('created_at', { ascending: true })
  return (data as Task[]) || []
}
async function fetchMeals(): Promise<Meal[]> {
  if (!supabase) return []
  const { data } = await supabase.from('meals').select('*').eq('household_id', HOUSEHOLD_ID).order('date')
  return (data as Meal[]) || []
}
async function fetchChores(): Promise<Chore[]> {
  if (!supabase) return []
  const { data } = await supabase.from('chores').select('*').eq('household_id', HOUSEHOLD_ID).order('next_due')
  return (data as Chore[]) || []
}
async function fetchEvents(): Promise<CalendarEvent[]> {
  if (!supabase) return []
  const { data } = await supabase.from('events').select('*').eq('household_id', HOUSEHOLD_ID).order('date')
  return (data as CalendarEvent[]) || []
}

// ── Context ───────────────────────────────────────────────────────────────────

interface HouseholdContextType {
  tasks: Task[]; meals: Meal[]; chores: Chore[]; events: CalendarEvent[]
  loading: boolean; isDemo: boolean
  addTask: (title: string, dueDate: string | null, recurrence: Recurrence | null) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setMeal: (date: string, slot: MealSlot, name: string) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  addChore: (title: string, intervalDays: number, startDate: string) => Promise<void>
  completeChore: (id: string) => Promise<void>
  deleteChore: (id: string) => Promise<void>
  addEvent: (title: string, date: string, time: string | null) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

const HouseholdContext = createContext<HouseholdContextType | null>(null)

export function useHousehold() {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider')
  return ctx
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasksRaw] = useState<Task[]>([])
  const [meals, setMealsRaw] = useState<Meal[]>([])
  const [chores, setChoresRaw] = useState<Chore[]>([])
  const [events, setEventsRaw] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Setters that auto-persist to localStorage in demo mode
  const setTasks = useCallback((fn: Task[] | ((p: Task[]) => Task[])) => {
    setTasksRaw(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (IS_DEMO) lsSet('fos_tasks', next); return next })
  }, [])
  const setMeals = useCallback((fn: Meal[] | ((p: Meal[]) => Meal[])) => {
    setMealsRaw(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (IS_DEMO) lsSet('fos_meals', next); return next })
  }, [])
  const setChores = useCallback((fn: Chore[] | ((p: Chore[]) => Chore[])) => {
    setChoresRaw(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (IS_DEMO) lsSet('fos_chores', next); return next })
  }, [])
  const setEvents = useCallback((fn: CalendarEvent[] | ((p: CalendarEvent[]) => CalendarEvent[])) => {
    setEventsRaw(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (IS_DEMO) lsSet('fos_events', next); return next })
  }, [])

  useEffect(() => {
    if (IS_DEMO) {
      let t = lsGet<Task>('fos_tasks'), m = lsGet<Meal>('fos_meals')
      let c = lsGet<Chore>('fos_chores'), e = lsGet<CalendarEvent>('fos_events')
      if (!localStorage.getItem('fos_seeded')) {
        const seed = seedDemoData(todayStr())
        t = seed.tasks; m = seed.meals; c = seed.chores; e = seed.events
        lsSet('fos_tasks', t); lsSet('fos_meals', m); lsSet('fos_chores', c); lsSet('fos_events', e)
        localStorage.setItem('fos_seeded', '1')
      }
      setTasksRaw(t); setMealsRaw(m); setChoresRaw(c); setEventsRaw(e)
      setLoading(false)
      return
    }

    Promise.all([fetchTasks(), fetchMeals(), fetchChores(), fetchEvents()]).then(([t, m, c, e]) => {
      setTasksRaw(t); setMealsRaw(m); setChoresRaw(c); setEventsRaw(e); setLoading(false)
    })

    const channel = supabase!
      .channel('household-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `household_id=eq.${HOUSEHOLD_ID}` }, () => fetchTasks().then(setTasksRaw))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals', filter: `household_id=eq.${HOUSEHOLD_ID}` }, () => fetchMeals().then(setMealsRaw))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores', filter: `household_id=eq.${HOUSEHOLD_ID}` }, () => fetchChores().then(setChoresRaw))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `household_id=eq.${HOUSEHOLD_ID}` }, () => fetchEvents().then(setEventsRaw))
      .subscribe()
    return () => { supabase!.removeChannel(channel) }
  }, [])

  // ── Tasks ────────────────────────────────────────────────────────────────────

  const addTask = useCallback(async (title: string, dueDate: string | null, recurrence: Recurrence | null) => {
    const optimistic: Task = { id: newId(), household_id: HOUSEHOLD_ID, title, due_date: dueDate, completed: false, completed_at: null, recurrence, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    setTasks(prev => [...prev, optimistic])
    if (!IS_DEMO && supabase) {
      const { data } = await supabase.from('tasks').insert({ household_id: HOUSEHOLD_ID, title, due_date: dueDate, recurrence }).select().single()
      if (data) setTasks(prev => prev.map(t => t.id === optimistic.id ? data as Task : t))
    }
  }, [setTasks])

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const nowCompleted = !task.completed
    const completedAt = nowCompleted ? new Date().toISOString() : null
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: nowCompleted, completed_at: completedAt } : t))
    if (!IS_DEMO && supabase) {
      await supabase.from('tasks').update({ completed: nowCompleted, completed_at: completedAt, updated_at: new Date().toISOString() }).eq('id', id)
    }
    if (nowCompleted && task.recurrence) {
      const days = task.recurrence === 'daily' ? 1 : task.recurrence === 'weekly' ? 7 : 30
      const newTask: Task = { id: newId(), household_id: HOUSEHOLD_ID, title: task.title, due_date: addDaysStr(task.due_date || todayStr(), days), recurrence: task.recurrence, completed: false, completed_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      setTasks(prev => [...prev, newTask])
      if (!IS_DEMO && supabase) {
        const { data } = await supabase.from('tasks').insert({ household_id: HOUSEHOLD_ID, title: task.title, due_date: newTask.due_date, recurrence: task.recurrence }).select().single()
        if (data) setTasks(prev => prev.map(t => t.id === newTask.id ? data as Task : t))
      }
    }
  }, [tasks, setTasks])

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (!IS_DEMO && supabase) await supabase.from('tasks').delete().eq('id', id)
  }, [setTasks])

  // ── Meals ────────────────────────────────────────────────────────────────────

  const setMeal = useCallback(async (date: string, slot: MealSlot, name: string) => {
    const existing = meals.find(m => m.date === date && m.slot === slot)
    if (existing) {
      setMeals(prev => prev.map(m => m.id === existing.id ? { ...m, name } : m))
      if (!IS_DEMO && supabase) await supabase.from('meals').update({ name }).eq('id', existing.id)
    } else {
      const optimistic: Meal = { id: newId(), household_id: HOUSEHOLD_ID, date, slot, name, created_at: new Date().toISOString() }
      setMeals(prev => [...prev, optimistic])
      if (!IS_DEMO && supabase) {
        const { data } = await supabase.from('meals').upsert({ household_id: HOUSEHOLD_ID, date, slot, name }, { onConflict: 'household_id,date,slot' }).select().single()
        if (data) setMeals(prev => prev.map(m => m.id === optimistic.id ? data as Meal : m))
      }
    }
  }, [meals, setMeals])

  const deleteMeal = useCallback(async (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id))
    if (!IS_DEMO && supabase) await supabase.from('meals').delete().eq('id', id)
  }, [setMeals])

  // ── Chores ───────────────────────────────────────────────────────────────────

  const addChore = useCallback(async (title: string, intervalDays: number, startDate: string) => {
    const optimistic: Chore = { id: newId(), household_id: HOUSEHOLD_ID, title, interval_days: intervalDays, next_due: startDate, last_completed: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    setChores(prev => [...prev, optimistic].sort((a, b) => a.next_due.localeCompare(b.next_due)))
    if (!IS_DEMO && supabase) {
      const { data } = await supabase.from('chores').insert({ household_id: HOUSEHOLD_ID, title, interval_days: intervalDays, next_due: startDate }).select().single()
      if (data) setChores(prev => prev.map(c => c.id === optimistic.id ? data as Chore : c))
    }
  }, [setChores])

  const completeChore = useCallback(async (id: string) => {
    const chore = chores.find(c => c.id === id)
    if (!chore) return
    const today = todayStr()
    const nextDue = addDaysStr(today, chore.interval_days)
    setChores(prev => prev.map(c => c.id === id ? { ...c, last_completed: today, next_due: nextDue } : c))
    if (!IS_DEMO && supabase) await supabase.from('chores').update({ last_completed: today, next_due: nextDue, updated_at: new Date().toISOString() }).eq('id', id)
  }, [chores, setChores])

  const deleteChore = useCallback(async (id: string) => {
    setChores(prev => prev.filter(c => c.id !== id))
    if (!IS_DEMO && supabase) await supabase.from('chores').delete().eq('id', id)
  }, [setChores])

  // ── Events ───────────────────────────────────────────────────────────────────

  const addEvent = useCallback(async (title: string, date: string, time: string | null) => {
    const optimistic: CalendarEvent = { id: newId(), household_id: HOUSEHOLD_ID, title, date, time, notes: null, created_at: new Date().toISOString() }
    setEvents(prev => [...prev, optimistic].sort((a, b) => a.date.localeCompare(b.date)))
    if (!IS_DEMO && supabase) {
      const { data } = await supabase.from('events').insert({ household_id: HOUSEHOLD_ID, title, date, time }).select().single()
      if (data) setEvents(prev => prev.map(e => e.id === optimistic.id ? data as CalendarEvent : e))
    }
  }, [setEvents])

  const deleteEvent = useCallback(async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    if (!IS_DEMO && supabase) await supabase.from('events').delete().eq('id', id)
  }, [setEvents])

  return (
    <HouseholdContext.Provider value={{ tasks, meals, chores, events, loading, isDemo: IS_DEMO, addTask, toggleTask, deleteTask, setMeal, deleteMeal, addChore, completeChore, deleteChore, addEvent, deleteEvent }}>
      {children}
    </HouseholdContext.Provider>
  )
}
