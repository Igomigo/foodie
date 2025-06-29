'use client'

import Sidebar from '@/components/navigation/Sidebar'
import Topbar from '@/components/navigation/Topbar'
import React, { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className='flex min-h-screen'>
      <div className='fixed top-0 left-0 z-50'>
        <Sidebar onToggle={setSidebarOpen} />
      </div>
      <div className={`flex flex-col flex-1 transition-all duration-500 ${sidebarOpen ? 'md:ml-64' : 'md:ml-12'}`}>
        <Topbar />
        <main className='flex-1'>
            {children}
        </main>
      </div>
    </div>
  )
}
