'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { HomeIcon, TasksIcon, MealsIcon, ChoresIcon, CalendarIcon } from '@/components/ui/icons'

const tabs = [
  { href: '/', label: 'Today', Icon: HomeIcon },
  { href: '/tasks', label: 'Tasks', Icon: TasksIcon },
  { href: '/meals', label: 'Meals', Icon: MealsIcon },
  { href: '/chores', label: 'Chores', Icon: ChoresIcon },
  { href: '/calendar', label: 'Calendar', Icon: CalendarIcon },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="bg-white border-t border-slate-100 flex-shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-14">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]',
                active ? 'text-indigo-600' : 'text-slate-400'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
