import Sidebar from '@/components/Sidebar'
import React from 'react'

export default function HomePage() {
  return (
    <div className='flex bg-gray-100'>
      <Sidebar />
      <main className='flex-1 min-h-screen px-6 py-12 bg-white md:p-6 lg:p-8 xl:p-12'>
        <h1 className='text-2xl font-bold'>Home</h1>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
      </main>
    </div>
  )
}
