'use client'

import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import React, { useEffect, useState } from 'react'

export default function Navbar({ onToggle }: { onToggle: (isOpen: boolean) => void }) {

    const [isOpen, setIsOpen] = useState(true)
    const [close, setClose] = useState(true);

    const handleClick = () => {
        setIsOpen(!isOpen)
        setClose(!close)
    }

    useEffect(() => {
        onToggle(isOpen)
    }, [isOpen])

    return (
        <nav className={`flex h-screen relative top-0 left-0 z-50 flex-col justify-between p-4 pt-10 border-r-1 border-r-gray-200 transition-all duration-500 bg-gray-100 ${isOpen ? 'w-64' : 'w-12'}`}>
            <div className="flex flex-col space-y-4 py-5">
                {
                    isOpen ? (
                        <>
                            <p>Navbar</p>
                            <p>Lavbar</p>
                            <p>Davbar</p>
                            <p>Kavbar</p>
                            <p>Ravbar</p>
                            <p>Javbar</p>
                            <p>Zavbar</p>
                        </>
                    ) : (
                        <>
                            <p>N</p>
                            <p>L</p>
                            <p>D</p>
                            <p>K</p>
                            <p>R</p>
                            <p>J</p>
                            <p>Z</p>
                        </>
                    )
                }
            </div>
            <button onClick={handleClick} className='absolute bottom-3 -right-0 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full text-semibold p-2'>{close ? (<ArrowLeftToLine />) : (<ArrowRightToLine />)}</button>
            <div className='mb-15'><p className="text-red-400">{isOpen ? 'Logout' : 'L'}</p></div>
        </nav>
    )
}
