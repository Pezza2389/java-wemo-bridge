'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FAB } from '@/components/layout/FAB'
import { TodayView } from '@/components/today/TodayView'

export default function HomePage() {
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <>
      <Header isToday />
      <TodayView fabOpen={fabOpen} onFabClose={() => setFabOpen(false)} />
      <FAB onClick={() => setFabOpen(true)} />
    </>
  )
}
