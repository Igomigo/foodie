import React from 'react'
import Search from '../Search'

export default function Topbar() {
  return (
    <div className='flex justify-between items-center p-4 bg-red-500'>
      <div>
        <Search />
      </div>
      <div className='flex items-center gap-4'>
        <nav className='flex items-center gap-4'>
            <div>notifications</div>
            <div>cart</div>
        </nav>
        <div>profile</div>
      </div>
    </div>
  )
}
