/**
 * Constants and configuration for analytics features
 */

export const PERFORMANCE_BADGES = {
    excellent: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Excellent' 
    },
    good: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Good' 
    },
    fair: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'Fair' 
    },
    poor: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Poor' 
    },
    no_data: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        label: 'No Data' 
    }
} as const;

export const MAINTENANCE_CATEGORIES = {
    low_maintenance: { 
        color: 'text-green-600', 
        label: 'Low' 
    },
    medium_maintenance: { 
        color: 'text-yellow-600', 
        label: 'Medium' 
    },
    high_maintenance: { 
        color: 'text-red-600', 
        label: 'High' 
    },
    no_data: { 
        color: 'text-gray-600', 
        label: 'No Data' 
    }
} as const;

export const PAYMENT_STATUS_STYLES = {
    current: 'bg-green-100 text-green-800',
    late: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    no_payments: 'bg-gray-100 text-gray-800'
} as const;

export const SORT_FIELDS = {
    NET_INCOME: 'net_income',
    OCCUPANCY_RATE: 'occupancy_rate',
    MAINTENANCE_RATIO: 'maintenance_ratio'
} as const;

export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc'
} as const;

export const MAINTENANCE_RATIO_THRESHOLDS = {
    HIGH: 0.3,
    MEDIUM: 0.15
} as const;

export const OCCUPANCY_RATE_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60
} as const;