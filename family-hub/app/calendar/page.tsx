'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FAB } from '@/components/layout/FAB'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EventModal } from '@/components/calendar/EventModal'

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header title="Calendar" />
      <CalendarView />
      <FAB onClick={() => setModalOpen(true)} />
      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
