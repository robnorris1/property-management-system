import { useState } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Wrench, 
    Home, 
    AlertTriangle, 
    CheckCircle, 
    Clock,
    BarChart3,
    ArrowUpDown
} from 'lucide-react';

import type { PropertyAnalytics } from '@/types';
import { usePropertyAnalytics } from '@/hooks/usePropertyAnalytics';
import { formatCurrency, formatPercentage, safeMultiply } from '@/utils/formatters';
import { 
    PERFORMANCE_BADGES, 
    MAINTENANCE_CATEGORIES, 
    PAYMENT_STATUS_STYLES,
    SORT_FIELDS,
    SORT_ORDER
} from '@/constants/analytics';

type SortField = 'net_income' | 'occupancy_rate' | 'maintenance_ratio';
type SortOrder = 'desc' | 'asc';

export default function PropertyPerformanceDashboard() {
    const { properties, isLoading, error, refetch } = usePropertyAnalytics();
    const [sortBy, setSortBy] = useState<SortField>('net_income');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const sortedProperties = [...properties].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortBy) {
            case 'net_income':
                aValue = a.net_income;
                bValue = b.net_income;
                break;
            case 'occupancy_rate':
                aValue = a.occupancy_rate || 0;
                bValue = b.occupancy_rate || 0;
                break;
            case 'maintenance_ratio':
                aValue = a.maintenance_to_rent_ratio || 0;
                bValue = b.maintenance_to_rent_ratio || 0;
                break;
            default:
                aValue = a.net_income;
                bValue = b.net_income;
        }

        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    const getPerformanceBadge = (rating: keyof typeof PERFORMANCE_BADGES) => {
        const badge = PERFORMANCE_BADGES[rating];
        const Icon = rating === 'excellent' ? CheckCircle :
                   rating === 'good' ? TrendingUp :
                   rating === 'fair' ? Clock :
                   rating === 'poor' ? TrendingDown : AlertTriangle;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const getMaintenanceCategory = (category: keyof typeof MAINTENANCE_CATEGORIES) => {
        const cat = MAINTENANCE_CATEGORIES[category];
        
        return (
            <span className={`font-medium ${cat.color}`}>
                {cat.label}
            </span>
        );
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        return sortOrder === 'desc' ? 
            <TrendingDown className="w-4 h-4 text-blue-600" /> : 
            <TrendingUp className="w-4 h-4 text-blue-600" />;
    };

    const getPaymentStatusStyle = (status: keyof typeof PAYMENT_STATUS_STYLES) => {
        return `text-xs px-2 py-1 rounded-full ${PAYMENT_STATUS_STYLES[status]}`;
    };

    // Calculate summary metrics
    const totalPortfolioIncome = properties.reduce((sum, prop) => sum + prop.net_income, 0);
    const avgOccupancyRate = properties.length > 0 
        ? properties.reduce((sum, prop) => sum + (prop.occupancy_rate || 0), 0) / properties.length 
        : 0;
    const highMaintenanceCount = properties.filter(p => p.maintenance_category === 'high_maintenance').length;

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Net Income</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(totalPortfolioIncome)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Avg Occupancy Rate</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatPercentage(avgOccupancyRate)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-3 rounded-lg">
                            <Wrench className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">High Maintenance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {highMaintenanceCount} {highMaintenanceCount === 1 ? 'Property' : 'Properties'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Performance Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Property Performance Comparison</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Property
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('net_income')}
                                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                                        aria-label="Sort by net income"
                                    >
                                        Net Income
                                        {getSortIcon('net_income')}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('occupancy_rate')}
                                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                                        aria-label="Sort by occupancy rate"
                                    >
                                        Occupancy
                                        {getSortIcon('occupancy_rate')}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('maintenance_ratio')}
                                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                                        aria-label="Sort by maintenance ratio"
                                    >
                                        Maintenance Ratio
                                        {getSortIcon('maintenance_ratio')}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedProperties.map((property) => (
                                <tr key={property.property_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {property.property_address}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {property.monthly_rent ? formatCurrency(property.monthly_rent) : 'No rent set'}/month
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-medium ${
                                            property.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formatCurrency(property.net_income)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Rent: {formatCurrency(property.total_rent_collected)} | 
                                            Maint: {formatCurrency(property.total_maintenance_cost)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatPercentage(property.occupancy_rate)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {property.months_with_payments}/12 months
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            {getMaintenanceCategory(property.maintenance_category)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatPercentage(safeMultiply(property.maintenance_to_rent_ratio, 100))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getPerformanceBadge(property.performance_rating)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={getPaymentStatusStyle(property.payment_status)}>
                                            {property.payment_status.replace('_', ' ')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {properties.length === 0 && (
                    <div className="text-center py-8">
                        <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">No property data available</p>
                        <p className="text-sm text-gray-500">Add properties and record rent payments to see performance analytics</p>
                    </div>
                )}
            </div>
        </div>
    );
}