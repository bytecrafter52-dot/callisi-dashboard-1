'use client'

import { ReactNode } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import DashboardSidebar from '@/components/DashboardSidebar'

interface DashboardLayoutClientProps {
  user: any
  children: ReactNode
}

export default function DashboardLayoutWrapper({ user, children }: DashboardLayoutClientProps) {
  return (
    <LanguageProvider>
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}
