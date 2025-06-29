'use client'

import Navbar from './Navbar'
import MobileMenu from './MobileMenu'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export default function Sidebar({ onToggle }: { onToggle: (isOpen: boolean) => void }) {
    const [isOpen, setIsOpen] = useState(false) // for mobile menu

    return (
        <div className=''>
            <div className='hidden md:block'><Navbar onToggle={onToggle} /></div>
            <div className='block md:hidden p-4 fixed top-0 left-0 z-50'><Menu size={35} onClick={() => setIsOpen(true)} /></div>
            <div className='block md:hidden lg:hidden xl:hidden w-full'><MobileMenu isOpen={isOpen} handleClose={() => setIsOpen(false)} /></div>
        </div>
    )
}
