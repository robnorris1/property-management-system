import { useState, useEffect } from 'react';

interface MonthlyData {
    property_id: number;
    property_address: string;
    month: string;
    year: number;
    rent_collected: number;
    maintenance_cost: number;
    net_income: number;
    payments_count: number;
    maintenance_count: number;
    expected_rent: number;
}

interface UseMonthlyAnalyticsProps {
    selectedPropertyId?: number | null;
    selectedYear?: number;
}

/**
 * Custom hook for fetching monthly analytics data
 * @param selectedPropertyId - Optional property ID to filter by
 * @param selectedYear - Year to fetch data for
 * @returns Object containing monthly data, loading state, error state, and refetch function
 */
export const useMonthlyAnalytics = ({ 
    selectedPropertyId, 
    selectedYear = new Date().getFullYear() 
}: UseMonthlyAnalyticsProps = {}) => {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const fetchMonthlyData = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const params = new URLSearchParams({
                year: selectedYear.toString()
            });
            
            if (selectedPropertyId) {
                params.append('property_id', selectedPropertyId.toString());
            }

            const response = await fetch(`/api/monthly-analytics?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch monthly analytics`);
            }

            const data = await response.json();
            setMonthlyData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load monthly data';
            setError(errorMessage);
            console.error('Error fetching monthly analytics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyData();
    }, [selectedPropertyId, selectedYear]);

    return {
        monthlyData,
        isLoading,
        error,
        refetch: fetchMonthlyData
    };
};