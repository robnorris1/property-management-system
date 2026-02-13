'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
    children: React.ReactNode
    requireAuth?: boolean
}

export default function AuthWrapper({ children, requireAuth = true }: AuthWrapperProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (requireAuth && status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, requireAuth, router])

    if (requireAuth && status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (requireAuth && !session) {
        return null
    }

    return <>{children}</>
}
