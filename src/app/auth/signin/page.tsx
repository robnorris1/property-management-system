'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Container,
    Paper,
    TextField,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material'
import { Home, Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui'
import { FormField } from '@/components/forms'

interface SignInFormData {
    email: string
    password: string
}

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const { control, handleSubmit } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: SignInFormData) => {
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                setError('Invalid email or password')
            } else {
                router.push('/')
                router.refresh()
            }
        } catch {
            setError('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 64,
                                height: 64,
                                bgcolor: 'primary.100',
                                borderRadius: 2,
                                mb: 2,
                            }}
                        >
                            <Home sx={{ fontSize: 32, color: 'primary.600' }} />
                        </Box>
                        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                            Welcome back
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Sign in to your property management account
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <FormField
                                name="email"
                                control={control}
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Please enter a valid email address'
                                    }
                                }}
                            />

                            <FormField
                                name="password"
                                control={control}
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                placeholder="Enter your password"
                                rules={{ required: 'Password is required' }}
                                endAdornment={
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                }
                            />

                            {error && (
                                <Alert severity="error">
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                loading={isLoading}
                                loadingText="Signing in..."
                                fullWidth
                                size="large"
                            >
                                Sign In
                            </Button>
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" style={{ color: 'inherit' }}>
                                <Typography component="span" color="primary.main" fontWeight={500}>
                                    Sign up here
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    )
}
