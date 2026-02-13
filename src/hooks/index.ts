import { useState, useEffect, useCallback, useRef } from 'react'
import { propertyApi, applianceApi, maintenanceApi, issueApi, dashboardApi } from '@/lib/api'
import { handleApiError } from '@/lib/utils'
import type {
    Property,
    Appliance,
    MaintenanceRecord,
    Issue,
    PropertyWithAppliances,
    DashboardData
} from '@/types'

export const useLoading = (initialState: boolean = false) => {
    const [isLoading, setIsLoading] = useState(initialState)

    const startLoading = useCallback(() => setIsLoading(true), [])
    const stopLoading = useCallback(() => setIsLoading(false), [])
    const withLoading = useCallback(async <T>(asyncOperation: () => Promise<T>): Promise<T> => {
        startLoading()
        try {
            const result = await asyncOperation()
            return result
        } finally {
            stopLoading()
        }
    }, [startLoading, stopLoading])

    return { isLoading, startLoading, stopLoading, withLoading }
}

interface UseApiOptions {
    immediate?: boolean
    onSuccess?: (data: unknown) => void
    onError?: (error: string) => void
}

export const useApi = <T>(
    apiFunction: () => Promise<T>,
    options: UseApiOptions = {}
) => {
    const { immediate = true, onSuccess, onError } = options
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading(immediate)

    const execute = useCallback(async () => {
        return withLoading(async () => {
            try {
                setError(null)
                const result = await apiFunction()
                setData(result)
                onSuccess?.(result)
                return result
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                onError?.(errorMessage)
                throw err
            }
        })
    }, [apiFunction, withLoading, onSuccess, onError])

    const reset = useCallback(() => {
        setData(null)
        setError(null)
    }, [])

    useEffect(() => {
        if (immediate) {
            execute()
        }
    }, [immediate, execute])

    return { data, error, isLoading, execute, reset }
}

// Specific hooks for your application entities

// Properties hook
export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([])
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading()

    const fetchProperties = useCallback(async () => {
        return withLoading(async () => {
            try {
                setError(null)
                const data = await propertyApi.getAll()
                setProperties(data)
                return data
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                throw err
            }
        })
    }, [withLoading])

    const createProperty = useCallback(async (propertyData: { address: string; property_type?: string }) => {
        try {
            const newProperty = await propertyApi.create(propertyData)
            setProperties(prev => [newProperty, ...prev])
            return newProperty
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const deleteProperty = useCallback(async (id: number) => {
        try {
            await propertyApi.delete(id)
            setProperties(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchProperties()
    }, [fetchProperties])

    return {
        properties,
        error,
        isLoading,
        fetchProperties,
        createProperty,
        deleteProperty,
        refresh: fetchProperties
    }
}

// Single property with appliances hook
export const useProperty = (id: number) => {
    const [propertyData, setPropertyData] = useState<PropertyWithAppliances | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading()

    const fetchProperty = useCallback(async () => {
        if (!id) return null

        return withLoading(async () => {
            try {
                setError(null)
                const data = await propertyApi.getById(id)
                setPropertyData(data)
                return data
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                throw err
            }
        })
    }, [id, withLoading])

    useEffect(() => {
        fetchProperty()
    }, [fetchProperty])

    return {
        propertyData,
        error,
        isLoading,
        refresh: fetchProperty
    }
}

// Appliances hook
export const useAppliances = (propertyId?: number) => {
    const [appliances, setAppliances] = useState<Appliance[]>([])
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading()

    const fetchAppliances = useCallback(async () => {
        if (!propertyId) return []

        return withLoading(async () => {
            try {
                setError(null)
                const data = await applianceApi.getByProperty(propertyId)
                setAppliances(data)
                return data
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                throw err
            }
        })
    }, [propertyId, withLoading])

    const createAppliance = useCallback(async (applianceData: {
        property_id: number;
        name: string;
        type?: string;
        installation_date?: string;
        last_maintenance?: string;
        status?: string;
    }) => {
        try {
            const newAppliance = await applianceApi.create(applianceData)
            setAppliances(prev => [newAppliance, ...prev])
            return newAppliance
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const updateAppliance = useCallback(async (id: number, updates: Partial<Appliance>) => {
        try {
            const updatedAppliance = await applianceApi.update(id, updates)
            setAppliances(prev => prev.map(a => a.id === id ? updatedAppliance : a))
            return updatedAppliance
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const deleteAppliance = useCallback(async (id: number) => {
        try {
            await applianceApi.delete(id)
            setAppliances(prev => prev.filter(a => a.id !== id))
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    useEffect(() => {
        if (propertyId) {
            fetchAppliances()
        }
    }, [propertyId, fetchAppliances])

    return {
        appliances,
        error,
        isLoading,
        fetchAppliances,
        createAppliance,
        updateAppliance,
        deleteAppliance,
        refresh: fetchAppliances
    }
}

// Maintenance records hook
export const useMaintenance = (applianceId?: number) => {
    const [records, setRecords] = useState<MaintenanceRecord[]>([])
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading()

    const fetchMaintenance = useCallback(async () => {
        return withLoading(async () => {
            try {
                setError(null)
                const params = applianceId ? { appliance_id: applianceId } : undefined
                const data = await maintenanceApi.getAll(params)
                setRecords(data)
                return data
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                throw err
            }
        })
    }, [applianceId, withLoading])

    const createMaintenanceRecord = useCallback(async (maintenanceData: {
        appliance_id: number;
        maintenance_type: string;
        description: string;
        cost?: number;
        technician_name?: string;
        technician_company?: string;
        maintenance_date: string;
        next_due_date?: string;
        notes?: string;
        parts_replaced?: string[];
        warranty_until?: string;
        status?: string;
    }) => {
        try {
            const newRecord = await maintenanceApi.create(maintenanceData)
            setRecords(prev => [newRecord, ...prev])
            return newRecord
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const updateMaintenanceRecord = useCallback(async (id: number, updates: Partial<MaintenanceRecord>) => {
        try {
            const updatedRecord = await maintenanceApi.update(id, updates)
            setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r))
            return updatedRecord
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const deleteMaintenanceRecord = useCallback(async (id: number) => {
        try {
            await maintenanceApi.delete(id)
            setRecords(prev => prev.filter(r => r.id !== id))
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchMaintenance()
    }, [fetchMaintenance])

    return {
        records,
        error,
        isLoading,
        fetchMaintenance,
        createMaintenanceRecord,
        updateMaintenanceRecord,
        deleteMaintenanceRecord,
        refresh: fetchMaintenance
    }
}

// Issues hook
export const useIssues = (applianceId?: number, status?: string) => {
    const [issues, setIssues] = useState<Issue[]>([])
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading()

    const fetchIssues = useCallback(async () => {
        return withLoading(async () => {
            try {
                setError(null)
                const params: { appliance_id?: number; status?: string } = {}
                if (applianceId) params.appliance_id = applianceId
                if (status) params.status = status

                const data = await issueApi.getAll(params)
                setIssues(data)
                return data
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                throw err
            }
        })
    }, [applianceId, status, withLoading])

    const createIssue = useCallback(async (issueData: {
        appliance_id: number;
        title: string;
        description: string;
        urgency?: string;
        reported_date?: string;
    }) => {
        try {
            const newIssue = await issueApi.create(issueData)
            setIssues(prev => [newIssue, ...prev])
            return newIssue
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const updateIssue = useCallback(async (id: number, updates: Partial<Issue>) => {
        try {
            const updatedIssue = await issueApi.update(id, updates)
            setIssues(prev => prev.map(i => i.id === id ? updatedIssue : i))
            return updatedIssue
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const resolveIssue = useCallback(async (id: number, resolutionNotes?: string) => {
        try {
            const resolvedIssue = await issueApi.resolve(id, resolutionNotes)
            setIssues(prev => prev.map(i => i.id === id ? resolvedIssue : i))
            return resolvedIssue
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    const deleteIssue = useCallback(async (id: number) => {
        try {
            await issueApi.delete(id)
            setIssues(prev => prev.filter(i => i.id !== id))
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage)
            throw err
        }
    }, [])

    useEffect(() => {
        fetchIssues()
    }, [fetchIssues])

    return {
        issues,
        error,
        isLoading,
        fetchIssues,
        createIssue,
        updateIssue,
        resolveIssue,
        deleteIssue,
        refresh: fetchIssues
    }
}

// Dashboard hook
export const useDashboard = (timeRange: '3months' | '6months' | '12months' = '6months') => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { isLoading, withLoading } = useLoading()

    const fetchDashboard = useCallback(async () => {
        return withLoading(async () => {
            try {
                setError(null)
                const data = await dashboardApi.getData(timeRange)
                setDashboardData(data)
                return data
            } catch (err) {
                const errorMessage = handleApiError(err)
                setError(errorMessage)
                throw err
            }
        })
    }, [timeRange, withLoading])

    useEffect(() => {
        fetchDashboard()
    }, [fetchDashboard])

    return {
        dashboardData,
        error,
        isLoading,
        refresh: fetchDashboard
    }
}

// Form state management hook
interface UseFormOptions<T> {
    initialValues: T
    validate?: (values: T) => Partial<Record<keyof T, string>>
    onSubmit?: (values: T) => Promise<void> | void
}

export const useForm = <T extends Record<string, unknown>>(options: UseFormOptions<T>) => {
    const { initialValues, validate, onSubmit } = options
    const [values, setValues] = useState<T>(initialValues)
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
    const { isLoading, withLoading } = useLoading(false)

    const setValue = useCallback((name: keyof T, value: unknown) => {
        setValues(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }, [errors])

    const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }))
    }, [])

    const resetForm = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
    }, [initialValues])

    const validateForm = useCallback(() => {
        if (!validate) return {}

        const validationErrors = validate(values)
        setErrors(validationErrors)
        return validationErrors
    }, [validate, values])

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault()

        const validationErrors = validateForm()
        const hasErrors = Object.keys(validationErrors).length > 0

        if (hasErrors) {
            // Mark all fields as touched to show errors
            const allTouched = Object.keys(values).reduce((acc, key) => ({
                ...acc,
                [key]: true
            }), {})
            setTouched(allTouched)
            return
        }

        if (onSubmit) {
            await withLoading(async () => {
                const result = onSubmit(values)
                if (result instanceof Promise) {
                    await result
                }
            })
        }
    }, [validateForm, onSubmit, withLoading, values])

    const getFieldProps = useCallback((name: keyof T) => ({
        name: name as string,
        value: values[name] || '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setValue(name, e.target.value as T[keyof T])
        },
        onBlur: () => setFieldTouched(name, true),
    }), [values, setValue, setFieldTouched])

    const getFieldError = useCallback((name: keyof T) => {
        return touched[name] && errors[name] ? errors[name] : undefined
    }, [touched, errors])

    return {
        values,
        errors,
        touched,
        isLoading,
        setValue,
        setFieldTouched,
        resetForm,
        validateForm,
        handleSubmit,
        getFieldProps,
        getFieldError,
        isValid: Object.keys(errors).length === 0
    }
}

// Modal state hook
export const useModal = (initialState: boolean = false) => {
    const [isOpen, setIsOpen] = useState(initialState)

    const openModal = useCallback(() => setIsOpen(true), [])
    const closeModal = useCallback(() => setIsOpen(false), [])
    const toggleModal = useCallback(() => setIsOpen(prev => !prev), [])

    return { isOpen, openModal, closeModal, toggleModal }
}

// Local storage hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    })

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch {
            // Handle localStorage errors silently
        }
    }, [key, storedValue])

    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue)
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key)
            }
        } catch {
            // Handle localStorage errors silently
        }
    }, [key, initialValue])

    return [storedValue, setValue, removeValue] as const
}

// Debounced value hook
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

// Previous value hook
export const usePrevious = <T>(value: T): T | undefined => {
    const ref = useRef<T>(value)

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}

// Click outside hook
export const useClickOutside = (handler: () => void) => {
    const ref = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [handler])

    return ref
}

// Intersection observer hook (for lazy loading, infinite scroll, etc.)
export const useIntersectionObserver = (
    options: IntersectionObserverInit = {}
) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting)
            setEntry(entry)
        }, options)

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [options])

    return { ref: elementRef, isIntersecting, entry }
}

// Window size hook
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        // Set initial size
        handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
}

