import { clsx, type ClassValue } from 'clsx'
import { format, addDays, isToday, isTomorrow, startOfWeek } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDateShort(s: string): string {
  const date = new Date(s + 'T00:00:00')
  return format(date, 'd MMM')
}

export function formatDateFull(s: string): string {
  const date = new Date(s + 'T00:00:00')
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEEE d MMMM')
}

export function addDaysStr(s: string, n: number): string {
  const date = new Date(s + 'T00:00:00')
  return format(addDays(date, n), 'yyyy-MM-dd')
}

export interface WeekDay {
  str: string
  name: string
  num: number
}

export function getWeekDays(date: Date): WeekDay[] {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    return {
      str: format(d, 'yyyy-MM-dd'),
      name: format(d, 'EEE'),
      num: parseInt(format(d, 'd'), 10),
    }
  })
}

export function greet(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
