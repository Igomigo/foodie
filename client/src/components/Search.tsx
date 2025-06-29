'use client'

import React from 'react'
import { Search } from 'lucide-react';

export default function SearchComponent() {
  return (
    <div className='flex lg:w-sm sm:ml-10 items-center gap-2 bg-gray-200 rounded-md p-2 border border-transparent group focus-within:border-orange-500'>
      <Search />
      <input
        type="search"
        placeholder='Search'
        className='hidden w-full lg:block flex-1 border-none outline-none bg-transparent'
        onChange={(e) => {
          console.log(e.target.value)
        }}
      />
      <button className='bg-orange-500 text-white px-4 py-1 group-hover:bg-orange-600 rounded-md'>Search</button>
    </div>
  )
}
