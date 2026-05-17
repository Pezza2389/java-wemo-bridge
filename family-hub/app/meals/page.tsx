'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { FAB } from '@/components/layout/FAB'
import { MealsView } from '@/components/meals/MealsView'
import { MealModal } from '@/components/meals/MealModal'
import { todayStr } from '@/lib/utils'

export default function MealsPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header title="Meals" />
      <MealsView />
      <FAB onClick={() => setModalOpen(true)} />
      <MealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        date={todayStr()}
        slot="dinner"
      />
    </>
  )
}
