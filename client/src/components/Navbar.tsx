'use client'

import React, { useState } from 'react'

export default function Navbar() {

    const [isOpen, setIsOpen] = useState(true)
    const [close, setClose] = useState(true);

    const handleClick = () => {
        setIsOpen(!isOpen)
        setClose(!close)
    }

    return (
        <nav className={`flex h-screen relative top-0 left-0 z-50 flex-col justify-between p-4 pt-10 shadow-lg transition-all duration-500 bg-gray-300 ${isOpen ? 'w-64' : 'w-12'}`}>
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
            <button onClick={handleClick} className='absolute top-2 -right-3 border-3 border-gray-600 rounded-lg text-semibold bg-gray-600 text-white p-1'>{close ? '<' : '>'}</button>
            <div className='mb-15'><p className="text-red-400">{isOpen ? 'Logout' : 'L'}</p></div>
        </nav>
    )
}
