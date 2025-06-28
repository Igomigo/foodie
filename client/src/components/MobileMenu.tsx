'use client'

import React from 'react'
import { X } from 'lucide-react'

export default function MobileMenu({isOpen, handleClose}: {isOpen: boolean, handleClose: () => void}) {
    return (
        <>
            {/** Backdrop */}
            <div onClick={handleClose} className={`fixed top-0 left-0 w-full h-full z-40 transition-all duration-500 ease-in-out ${isOpen ? 'block' : 'hidden'}`}/>

            {/** Mobile Menu */}
            <div className={`w-3/4 bg-gray-300 h-full fixed top-0 left-0 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[-100%]'}`}>
                <div className=''>
                    <div className="absolute top-0 right-0 p-4"><X size={35} onClick={handleClose} /></div>
                </div>
            </div>
        </>
    )
}
