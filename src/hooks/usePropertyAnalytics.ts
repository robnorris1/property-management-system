import { useState, useEffect } from 'react';
import type { PropertyAnalytics } from '@/types';

/**
 * Custom hook for fetching property analytics data
 * @returns Object containing properties data, loading state, error state, and refetch function
 */
export const usePropertyAnalytics = () => {
    const [properties, setProperties] = useState<PropertyAnalytics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const response = await fetch('/api/property-analytics');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch property analytics`);
            }

            const data = await response.json();
            setProperties(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
            setError(errorMessage);
            console.error('Error fetching property analytics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return {
        properties,
        isLoading,
        error,
        refetch: fetchAnalytics
    };
};