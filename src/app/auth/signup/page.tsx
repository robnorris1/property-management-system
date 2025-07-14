'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Container,
    Paper,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material'
import { Home, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui'
import { FormField } from '@/components/forms'

interface SignUpFormData {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const { control, handleSubmit, watch } = useForm<SignUpFormData>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    const password = watch('password')

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name.trim(),
                    email: data.email.trim(),
                    password: data.password
                }),
            })

            const responseData = await response.json()

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to create account')
            }

            setSuccess(true)

            setTimeout(() => {
                router.push('/auth/signin')
            }, 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create account')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
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
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                            Account Created!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Your account has been successfully created. Redirecting to sign in...
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        )
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
                            Create your account
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Start managing your properties today
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <FormField
                                name="name"
                                control={control}
                                label="Full Name"
                                placeholder="Enter your full name"
                                rules={{ required: 'Full name is required' }}
                            />

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
                                helperText="Must be at least 6 characters long"
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters long'
                                    }
                                }}
                                endAdornment={
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                }
                            />

                            <FormField
                                name="confirmPassword"
                                control={control}
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                rules={{
                                    required: 'Please confirm your password',
                                    validate: (value: string) =>
                                        value === password || 'Passwords do not match'
                                }}
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
                                loadingText="Creating account..."
                                fullWidth
                                size="large"
                            >
                                Create Account
                            </Button>
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Link href="/auth/signin" style={{ color: 'inherit' }}>
                                <Typography component="span" color="primary.main" fontWeight={500}>
                                    Sign in here
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    )
}
