'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={cn(
          'relative bg-white rounded-t-3xl shadow-2xl animate-slide-up',
          'max-h-[90dvh] overflow-y-auto'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        {title && (
          <div className="px-5 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
        )}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
