'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FAB } from '@/components/layout/FAB'
import { ChoresView } from '@/components/chores/ChoresView'
import { ChoreModal } from '@/components/chores/ChoreModal'

export default function ChoresPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header title="Chores" />
      <ChoresView />
      <FAB onClick={() => setModalOpen(true)} />
      <ChoreModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
