import Sidebar from '@/components/navigation/Sidebar'
import Topbar from '@/components/navigation/Topbar'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <div className='flex flex-col flex-1'>
        <Topbar />
        <main className='flex-1'>
            {children}
        </main>
      </div>
    </div>
  )
}
