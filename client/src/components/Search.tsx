'use client'

import React from 'react'

export default function Search() {
  return (
    <div className='flex items-center gap-2 bg-gray-200 rounded-md p-2'>
      <Search />
      <input
        type="text"
        placeholder='Search'
        className='flex-1'
        onChange={(e) => {
          console.log(e.target.value)
        }}
      />
    </div>
  )
}
