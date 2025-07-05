'use client'

import React from 'react'
import { Search } from 'lucide-react';

export default function SearchComponent() {
  return (
    <div className='flex w-full md:w-sm items-center gap-2 md:bg-gray-100 rounded-md p-2 md:border border-gray-300 group focus-within:ring-2 focus-within:ring-orange-500'>
      <Search size={20} className='text-gray-600 md:text-gray-400' />
      <input
        type="search"
        placeholder='Search for dishes, restaurants, or cuisines...'
        className='hidden w-full lg:block flex-1 border-none outline-none bg-transparent font-semibold text-gray-700'
        onChange={(e) => {
          console.log(e.target.value)
        }}
      />
    </div>
  )
}
