import { cn } from '@/lib/utils'

interface BadgeProps {
  variant: 'overdue' | 'today' | 'upcoming' | 'done'
  children: React.ReactNode
  className?: string
}

const variantClasses = {
  overdue: 'bg-red-100 text-red-700',
  today: 'bg-amber-100 text-amber-700',
  upcoming: 'bg-indigo-100 text-indigo-700',
  done: 'bg-green-100 text-green-700',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
