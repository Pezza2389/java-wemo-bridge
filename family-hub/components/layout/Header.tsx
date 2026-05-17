'use client'

import { greet, formatDateFull, todayStr } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  isToday?: boolean
}

export function Header({ title, subtitle, isToday }: HeaderProps) {
  return (
    <header
      className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <div>
        {isToday ? (
          <>
            <p className="text-sm text-slate-400 font-medium" suppressHydrationWarning>
              {greet()}
            </p>
            <h1 className="text-xl font-bold text-slate-900" suppressHydrationWarning>
              {formatDateFull(todayStr())}
            </h1>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </>
        )}
      </div>
      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
        🏠
      </div>
    </header>
  )
}
