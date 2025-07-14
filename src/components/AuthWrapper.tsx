'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui'
import { Container } from '@mui/material'

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
            <Container
                maxWidth="sm"
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <LoadingSpinner message="Loading..." />
            </Container>
        )
    }

    if (requireAuth && !session) {
        return null
    }

    return <>{children}</>
}
