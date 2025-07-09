import { handleApiError, withRetry } from './utils'

export interface ApiResponse<T = unknown> {
    data?: T
    error?: string
    status: number
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        throw new Error(handleApiError(error))
    }
}

export const api = {
    get: <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
        const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint
        return apiFetch<T>(url, { method: 'GET' })
    },

    post: <T>(endpoint: string, data?: any): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    },

    put: <T>(endpoint: string, data?: any): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })
    },

    patch: <T>(endpoint: string, data?: any): Promise<T> => {
        return apiFetch<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        })
    },

    delete: <T>(endpoint: string): Promise<T> => {
        return apiFetch<T>(endpoint, { method: 'DELETE' })
    },
}

export const propertyApi = {
    // Get all properties for the current user
    getAll: () => api.get<Property[]>('/api/properties'),

    // Get a specific property with appliances
    getById: (id: number) => api.get<PropertyWithAppliances>(`/api/property/${id}`),

    // Create a new property
    create: (data: { address: string; property_type?: string }) =>
        api.post<Property>('/api/properties', data),

    // Update a property
    update: (id: number, data: Partial<Property>) =>
        api.put<Property>(`/api/properties/${id}`, data),

    // Delete a property
    delete: (id: number) => api.delete(`/api/properties/${id}`),
}

export const applianceApi = {
    // Get appliances for a property
    getByProperty: (propertyId: number) =>
        api.get<Appliance[]>('/api/appliances', { property_id: propertyId }),

    // Get a specific appliance
    getById: (id: number) => api.get<Appliance>(`/api/appliances/${id}`),

    // Create a new appliance
    create: (data: {
        property_id: number
        name: string
        type?: string
        installation_date?: string
        last_maintenance?: string
        status?: string
    }) => api.post<Appliance>('/api/appliances', data),

    // Update an appliance
    update: (id: number, data: Partial<Appliance>) =>
        api.put<Appliance>(`/api/appliances/${id}`, data),

    // Delete an appliance
    delete: (id: number) => api.delete(`/api/appliances/${id}`),
}

export const maintenanceApi = {
    // Get maintenance records
    getAll: (params?: { appliance_id?: number; limit?: number }) =>
        api.get<MaintenanceRecord[]>('/api/maintenance', params),

    // Get a specific maintenance record
    getById: (id: number) => api.get<MaintenanceRecord>(`/api/maintenance/${id}`),

    // Create a new maintenance record
    create: (data: {
        appliance_id: number
        maintenance_type: string
        description: string
        cost?: number
        technician_name?: string
        technician_company?: string
        maintenance_date: string
        next_due_date?: string
        notes?: string
        parts_replaced?: string[]
        warranty_until?: string
        status?: string
    }) => api.post<MaintenanceRecord>('/api/maintenance', data),

    // Update a maintenance record
    update: (id: number, data: Partial<MaintenanceRecord>) =>
        api.put<MaintenanceRecord>(`/api/maintenance/${id}`, data),

    // Delete a maintenance record
    delete: (id: number) => api.delete(`/api/maintenance/${id}`),
}

export const issueApi = {
    // Get issues
    getAll: (params?: { appliance_id?: number; status?: string }) =>
        api.get<Issue[]>('/api/issues', params),

    // Get a specific issue
    getById: (id: number) => api.get<Issue>(`/api/issues/${id}`),

    // Create a new issue
    create: (data: {
        appliance_id: number
        title: string
        description: string
        urgency?: string
        reported_date?: string
    }) => api.post<Issue>('/api/issues', data),

    // Update an issue
    update: (id: number, data: Partial<Issue>) =>
        api.put<Issue>(`/api/issues/${id}`, data),

    // Delete an issue
    delete: (id: number) => api.delete(`/api/issues/${id}`),

    // Resolve an issue
    resolve: (id: number, resolutionNotes?: string) =>
        api.put<Issue>(`/api/issues/${id}`, {
            status: 'resolved',
            resolved_date: new Date().toISOString().split('T')[0],
            resolution_notes: resolutionNotes,
        }),
}

export const dashboardApi = {
    // Get dashboard data
    getData: (timeRange: '3months' | '6months' | '12months' = '6months') =>
        api.get<DashboardData>('/api/dashboard', { timeRange }),
}

export const authApi = {
    // Register a new user
    register: (data: { name: string; email: string; password: string }) =>
        api.post<{ message: string; user: User }>('/api/auth/register', data),
}

// Higher-order function for API calls with loading states
export const withLoading = <T extends any[], R>(
    apiFunction: (...args: T) => Promise<R>
) => {
    return async (...args: T): Promise<{ data: R | null; error: string | null; isLoading: boolean }> => {
        try {
            const data = await apiFunction(...args)
            return { data, error: null, isLoading: false }
        } catch (error) {
            return { data: null, error: handleApiError(error), isLoading: false }
        }
    }
}

// API call with retry logic
export const withRetryApi = <T>(
    apiCall: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> => {
    return withRetry(apiCall, maxAttempts, delay)
}

// Batch API calls
export const batchApiCalls = async <T>(
    calls: (() => Promise<T>)[],
    options: { concurrent?: boolean; failFast?: boolean } = {}
): Promise<(T | Error)[]> => {
    const { concurrent = true, failFast = false } = options

    if (concurrent) {
        if (failFast) {
            return Promise.all(calls.map(call => call()))
        } else {
            return Promise.allSettled(calls.map(call => call())).then(results =>
                results.map(result =>
                    result.status === 'fulfilled' ? result.value : new Error(result.reason)
                )
            )
        }
    } else {
        const results: (T | Error)[] = []
        for (const call of calls) {
            try {
                const result = await call()
                results.push(result)
            } catch (error) {
                if (failFast) throw error
                results.push(error as Error)
            }
        }
        return results
    }
}

// Type definitions (these should match your existing types)
interface Property {
    id: number
    address: string
    property_type: string | null
    created_at: string
    appliance_count?: string
}

interface Appliance {
    id: number
    property_id: number
    name: string
    type: string | null
    installation_date: string | null
    last_maintenance: string | null
    status: string
    created_at: string
    total_maintenance_cost?: number
    last_maintenance_cost?: number
    maintenance_count?: number
}

interface MaintenanceRecord {
    id: number
    appliance_id: number
    maintenance_type: string
    description: string
    cost: number | null
    technician_name: string | null
    technician_company: string | null
    maintenance_date: string
    next_due_date: string | null
    notes: string | null
    parts_replaced: string[] | null
    warranty_until: string | null
    status: string
    created_at: string
    updated_at: string
    appliance_name?: string
    property_address?: string
}

interface Issue {
    id: number
    appliance_id: number
    title: string
    description: string
    urgency: string
    status: string
    reported_date: string
    scheduled_date: string | null
    resolved_date: string | null
    resolution_notes: string | null
    appliance_name: string
    property_address: string
    reported_by_name: string | null
}

interface PropertyWithAppliances {
    property: Property
    appliances: Appliance[]
}

interface DashboardData {
    overview: {
        total_properties: number
        total_appliances: number
        total_maintenance_records: number
        total_maintenance_cost: number
        average_cost_per_maintenance: number
        overdue_maintenance_count: number
        upcoming_maintenance_count: number
        items_needing_attention: number
    }
    recent_maintenance: MaintenanceRecord[]
    expensive_appliances: any[]
    properties_needing_attention: any[]
    monthly_spending: any[]
}

interface User {
    id: string
    email: string
    name: string
    role?: string
}
