'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FAB } from '@/components/layout/FAB'
import { TasksView } from '@/components/tasks/TasksView'
import { TaskModal } from '@/components/tasks/TaskModal'

export default function TasksPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header title="Tasks" />
      <TasksView />
      <FAB onClick={() => setModalOpen(true)} />
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
