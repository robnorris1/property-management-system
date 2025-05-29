// src/components/UserMenu.tsx
'use client'
import { useSession, signOut } from 'next-auth/react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function UserMenu() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    if (!session) return null

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {session.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}
                <div className="text-left">
                    <div className="font-medium text-gray-900 text-sm">
                        {session.user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                        {session.user?.email}
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-1">
                        <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
                            <div className="font-medium text-gray-900">{session.user?.name}</div>
                            <div className="text-xs text-gray-500">{session.user?.email}</div>
                            {session.user?.role && (
                                <div className="text-xs text-blue-600 capitalize mt-1">
                                    {session.user.role}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                // Add settings functionality later
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 text-gray-700"
                        >
                            <Settings className="w-4 h-4" />
                            Account Settings
                        </button>

                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
