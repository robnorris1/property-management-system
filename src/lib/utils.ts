import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind CSS class merging utility
export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs))
}

// Date formatting utilities
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not recorded'
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
}

export const calculateDaysSince = (dateString: string | null | undefined): number | null => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

export const calculateDaysAgo = (dateString: string): number => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

// Currency formatting
export const formatCurrency = (amount: number | string | null | undefined): string => {
    if (!amount && amount !== 0) return '£0'
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount)) return '£0'

    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(numericAmount)
}

// Number parsing utilities
export const parseNumber = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value
    if (!value) return 0
    const parsed = parseFloat(value.toString())
    return isNaN(parsed) ? 0 : parsed
}

export const parseInteger = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return Math.floor(value)
    if (!value) return 0
    const parsed = parseInt(value.toString())
    return isNaN(parsed) ? 0 : parsed
}

// Status styling utilities
export const getStatusColor = (status: string): string => {
    const statusColors = {
        working: 'text-green-600 bg-green-50',
        needs_repair: 'text-orange-600 bg-orange-50',
        under_repair: 'text-yellow-600 bg-yellow-50',
        out_of_service: 'text-red-600 bg-red-50',
        maintenance: 'text-yellow-600 bg-yellow-50',
        broken: 'text-red-600 bg-red-50',
        completed: 'bg-green-100 text-green-800',
        scheduled: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        open: 'text-red-600 bg-red-100',
        resolved: 'text-green-600 bg-green-100'
    } as const

    return statusColors[status.toLowerCase() as keyof typeof statusColors] || 'text-gray-600 bg-gray-50'
}

export const getStatusLabel = (status: string): string => {
    const statusLabels = {
        working: 'Working',
        needs_repair: 'Needs Repair',
        under_repair: 'Under Repair',
        out_of_service: 'Out of Service',
        maintenance: 'Needs Maintenance',
        broken: 'Broken',
        completed: 'Completed',
        scheduled: 'Scheduled',
        in_progress: 'In Progress',
        cancelled: 'Cancelled',
        open: 'Open',
        resolved: 'Resolved'
    } as const

    return statusLabels[status.toLowerCase() as keyof typeof statusLabels] ||
        status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

// Maintenance type styling
export const getMaintenanceTypeColor = (type: string): string => {
    const typeColors = {
        routine: 'bg-blue-100 text-blue-800',
        repair: 'bg-red-100 text-red-800',
        inspection: 'bg-yellow-100 text-yellow-800',
        replacement: 'bg-purple-100 text-purple-800',
        cleaning: 'bg-green-100 text-green-800',
        upgrade: 'bg-indigo-100 text-indigo-800'
    } as const

    return typeColors[type.toLowerCase() as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'
}

// Urgency styling
export const getUrgencyColor = (urgency: string): string => {
    const urgencyColors = {
        critical: 'text-red-600 bg-red-100',
        high: 'text-orange-600 bg-orange-100',
        medium: 'text-yellow-600 bg-yellow-100',
        low: 'text-blue-600 bg-blue-100'
    } as const

    return urgencyColors[urgency.toLowerCase() as keyof typeof urgencyColors] || 'text-gray-600 bg-gray-100'
}

// Form validation utilities
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' }
    }
    return { isValid: true }
}

export const validateCost = (cost: string): { isValid: boolean; message?: string } => {
    if (!cost) return { isValid: true } // Cost is optional

    const numericCost = parseFloat(cost)
    if (isNaN(numericCost) || numericCost < 0) {
        return { isValid: false, message: 'Please enter a valid cost amount' }
    }

    return { isValid: true }
}

export const validateDateRange = (startDate: string, endDate: string): { isValid: boolean; message?: string } => {
    if (!startDate || !endDate) return { isValid: true }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
        return { isValid: false, message: 'End date must be after start date' }
    }

    return { isValid: true }
}

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export const capitalizeFirst = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')

    // Format as UK mobile number if appropriate
    if (digits.length === 11 && digits.startsWith('07')) {
        return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    }

    return phone
}

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key])
        groups[groupKey] = groups[groupKey] || []
        groups[groupKey].push(item)
        return groups
    }, {} as Record<string, T[]>)
}

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
        const aValue = a[key]
        const bValue = b[key]

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
    })
}

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
    const seen = new Set()
    return array.filter(item => {
        const value = item[key]
        if (seen.has(value)) return false
        seen.add(value)
        return true
    })
}

// Local storage utilities (with error handling)
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key)
        } catch {
            return null
        }
    },

    setItem: (key: string, value: string): boolean => {
        try {
            localStorage.setItem(key, value)
            return true
        } catch {
            return false
        }
    },

    removeItem: (key: string): boolean => {
        try {
            localStorage.removeItem(key)
            return true
        } catch {
            return false
        }
    }
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout

    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// Async utilities
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const withRetry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> => {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error
            if (attempt === maxAttempts) break
            await sleep(delay * attempt)
        }
    }

    throw lastError!
}

// URL utilities
export const buildUrl = (base: string, params: Record<string, string | number | boolean | undefined>): string => {
    const url = new URL(base, window.location.origin)

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value))
        }
    })

    return url.toString()
}

export const getSearchParam = (param: string): string | null => {
    if (typeof window === 'undefined') return null
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
}

// Error handling utilities
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'string') {
        return error
    }

    return 'An unexpected error occurred'
}

export const isApiError = (error: any): error is { error: string } => {
    return error && typeof error === 'object' && 'error' in error
}
