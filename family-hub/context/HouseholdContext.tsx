'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, HOUSEHOLD_ID } from '@/lib/supabase'
import { todayStr, addDaysStr } from '@/lib/utils'
import type { Task, Meal, Chore, CalendarEvent, MealSlot, Recurrence } from '@/types'

interface HouseholdContextType {
  tasks: Task[]
  meals: Meal[]
  chores: Chore[]
  events: CalendarEvent[]
  loading: boolean
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

async function fetchTasks(): Promise<Task[]> {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('created_at', { ascending: true })
  return (data as Task[]) || []
}

async function fetchMeals(): Promise<Meal[]> {
  const { data } = await supabase
    .from('meals')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('date', { ascending: true })
  return (data as Meal[]) || []
}

async function fetchChores(): Promise<Chore[]> {
  const { data } = await supabase
    .from('chores')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('next_due', { ascending: true })
  return (data as Chore[]) || []
}

async function fetchEvents(): Promise<CalendarEvent[]> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('date', { ascending: true })
  return (data as CalendarEvent[]) || []
}

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    const [t, m, c, e] = await Promise.all([
      fetchTasks(),
      fetchMeals(),
      fetchChores(),
      fetchEvents(),
    ])
    setTasks(t)
    setMeals(m)
    setChores(c)
    setEvents(e)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()

    const channel = supabase
      .channel('household-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `household_id=eq.${HOUSEHOLD_ID}` },
        () => fetchTasks().then(setTasks)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meals', filter: `household_id=eq.${HOUSEHOLD_ID}` },
        () => fetchMeals().then(setMeals)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chores', filter: `household_id=eq.${HOUSEHOLD_ID}` },
        () => fetchChores().then(setChores)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `household_id=eq.${HOUSEHOLD_ID}` },
        () => fetchEvents().then(setEvents)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAll])

  // Tasks
  const addTask = useCallback(async (title: string, dueDate: string | null, recurrence: Recurrence | null) => {
    const optimistic: Task = {
      id: crypto.randomUUID(),
      household_id: HOUSEHOLD_ID,
      title,
      due_date: dueDate,
      completed: false,
      completed_at: null,
      recurrence,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks(prev => [...prev, optimistic])
    const { data } = await supabase
      .from('tasks')
      .insert({ household_id: HOUSEHOLD_ID, title, due_date: dueDate, recurrence })
      .select()
      .single()
    if (data) {
      setTasks(prev => prev.map(t => t.id === optimistic.id ? data as Task : t))
    }
  }, [])

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const nowCompleted = !task.completed
    const completedAt = nowCompleted ? new Date().toISOString() : null

    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: nowCompleted, completed_at: completedAt } : t
    ))

    await supabase
      .from('tasks')
      .update({ completed: nowCompleted, completed_at: completedAt, updated_at: new Date().toISOString() })
      .eq('id', id)

    // Handle recurrence: if completing a recurring task, create the next one
    if (nowCompleted && task.recurrence) {
      const baseDate = task.due_date || todayStr()
      let daysToAdd = 1
      if (task.recurrence === 'weekly') daysToAdd = 7
      else if (task.recurrence === 'monthly') daysToAdd = 30
      const nextDue = addDaysStr(baseDate, daysToAdd)
      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed' | 'completed_at'> = {
        household_id: HOUSEHOLD_ID,
        title: task.title,
        due_date: nextDue,
        recurrence: task.recurrence,
      }
      const { data } = await supabase.from('tasks').insert(newTask).select().single()
      if (data) setTasks(prev => [...prev, data as Task])
    }
  }, [tasks])

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }, [])

  // Meals
  const setMeal = useCallback(async (date: string, slot: MealSlot, name: string) => {
    const existing = meals.find(m => m.date === date && m.slot === slot)
    if (existing) {
      setMeals(prev => prev.map(m => m.id === existing.id ? { ...m, name } : m))
      await supabase.from('meals').update({ name }).eq('id', existing.id)
    } else {
      const optimistic: Meal = {
        id: crypto.randomUUID(),
        household_id: HOUSEHOLD_ID,
        date,
        slot,
        name,
        created_at: new Date().toISOString(),
      }
      setMeals(prev => [...prev, optimistic])
      const { data } = await supabase
        .from('meals')
        .upsert({ household_id: HOUSEHOLD_ID, date, slot, name }, { onConflict: 'household_id,date,slot' })
        .select()
        .single()
      if (data) setMeals(prev => prev.map(m => m.id === optimistic.id ? data as Meal : m))
    }
  }, [meals])

  const deleteMeal = useCallback(async (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id))
    await supabase.from('meals').delete().eq('id', id)
  }, [])

  // Chores
  const addChore = useCallback(async (title: string, intervalDays: number, startDate: string) => {
    const optimistic: Chore = {
      id: crypto.randomUUID(),
      household_id: HOUSEHOLD_ID,
      title,
      interval_days: intervalDays,
      next_due: startDate,
      last_completed: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setChores(prev => [...prev, optimistic].sort((a, b) => a.next_due.localeCompare(b.next_due)))
    const { data } = await supabase
      .from('chores')
      .insert({ household_id: HOUSEHOLD_ID, title, interval_days: intervalDays, next_due: startDate })
      .select()
      .single()
    if (data) setChores(prev => prev.map(c => c.id === optimistic.id ? data as Chore : c))
  }, [])

  const completeChore = useCallback(async (id: string) => {
    const chore = chores.find(c => c.id === id)
    if (!chore) return
    const today = todayStr()
    const nextDue = addDaysStr(today, chore.interval_days)
    setChores(prev => prev.map(c =>
      c.id === id ? { ...c, last_completed: today, next_due: nextDue } : c
    ))
    await supabase
      .from('chores')
      .update({ last_completed: today, next_due: nextDue, updated_at: new Date().toISOString() })
      .eq('id', id)
  }, [chores])

  const deleteChore = useCallback(async (id: string) => {
    setChores(prev => prev.filter(c => c.id !== id))
    await supabase.from('chores').delete().eq('id', id)
  }, [])

  // Events
  const addEvent = useCallback(async (title: string, date: string, time: string | null) => {
    const optimistic: CalendarEvent = {
      id: crypto.randomUUID(),
      household_id: HOUSEHOLD_ID,
      title,
      date,
      time,
      notes: null,
      created_at: new Date().toISOString(),
    }
    setEvents(prev => [...prev, optimistic].sort((a, b) => a.date.localeCompare(b.date)))
    const { data } = await supabase
      .from('events')
      .insert({ household_id: HOUSEHOLD_ID, title, date, time })
      .select()
      .single()
    if (data) setEvents(prev => prev.map(e => e.id === optimistic.id ? data as CalendarEvent : e))
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    await supabase.from('events').delete().eq('id', id)
  }, [])

  return (
    <HouseholdContext.Provider value={{
      tasks, meals, chores, events, loading,
      addTask, toggleTask, deleteTask,
      setMeal, deleteMeal,
      addChore, completeChore, deleteChore,
      addEvent, deleteEvent,
    }}>
      {children}
    </HouseholdContext.Provider>
  )
}
