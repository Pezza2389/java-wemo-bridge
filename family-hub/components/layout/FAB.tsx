'use client'

import { PlusIcon } from '@/components/ui/icons'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      data-action="fab"
      className="fixed right-5 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 active:scale-95 transition-transform z-40"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}
      aria-label="Add new item"
    >
      <PlusIcon className="w-7 h-7" />
    </button>
  )
}
