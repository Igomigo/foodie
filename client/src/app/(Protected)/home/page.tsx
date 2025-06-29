import React from 'react'

export default function HomePage() {
  return (
    <div className='flex flex-col flex-1 bg-gray-100'>
      <main className='flex-1 px-6 py-12 bg-white md:p-6 lg:p-8 xl:p-12'>
        <h1 className='text-2xl font-bold'>Home</h1>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
      </main>
      <div className='h-48 bg-red-200'>A high priority task</div>
      <div className='h-48 bg-blue-200'>A high priority task</div>
      <div className='h-48 bg-green-200'>A high priority task</div>
    </div>
  )
}
