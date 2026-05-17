'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
}

interface ToastContextType {
  toast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-slide-up max-w-sm w-full text-center"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
