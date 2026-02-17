import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Wrench, AlertCircle } from 'lucide-react';

import { useMonthlyAnalytics } from '@/hooks/useMonthlyAnalytics';
import { formatCurrency, getMonthName } from '@/utils/formatters';

interface MonthlySummaryProps {
    selectedPropertyId?: number | null;
}

interface TrendInfo {
    trend: 'up' | 'down' | 'neutral';
    percentage: number;
}

export default function MonthlyPerformanceSummary({ selectedPropertyId }: MonthlySummaryProps) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const { monthlyData, isLoading, error, refetch } = useMonthlyAnalytics({
        selectedPropertyId,
        selectedYear
    });

    const calculateTrend = (currentMonth: number, previousMonth: number): TrendInfo => {
        if (previousMonth === 0) return { trend: 'neutral', percentage: 0 };
        
        const change = ((currentMonth - previousMonth) / Math.abs(previousMonth)) * 100;
        
        if (Math.abs(change) < 5) return { trend: 'neutral', percentage: change };
        return change > 0 ? { trend: 'up', percentage: change } : { trend: 'down', percentage: change };
    };

    const calculateCollectionRate = (collected: number, expected: number): number => {
        return expected > 0 ? (collected / expected) * 100 : 0;
    };

    const getCollectionRateColor = (rate: number): string => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getTrendIcon = (trend: TrendInfo) => {
        if (trend.trend === 'neutral') return null;
        
        const iconClass = 'w-3 h-3';
        const colorClass = trend.trend === 'up' ? 'text-green-600' : 'text-red-600';
        
        return trend.trend === 'up' ? 
            <TrendingUp className={`${iconClass} ${colorClass}`} /> : 
            <TrendingDown className={`${iconClass} ${colorClass}`} />;
    };

    // Group data by month for easier processing
    const monthlyTotals = monthlyData.reduce((acc, item) => {
        const key = `${item.year}-${item.month.padStart(2, '0')}`;
        if (!acc[key]) {
            acc[key] = {
                month: item.month,
                year: item.year,
                rent_collected: 0,
                maintenance_cost: 0,
                net_income: 0,
                expected_rent: 0,
                properties_count: 0
            };
        }
        
        acc[key].rent_collected += item.rent_collected;
        acc[key].maintenance_cost += item.maintenance_cost;
        acc[key].net_income += item.net_income;
        acc[key].expected_rent += item.expected_rent;
        acc[key].properties_count += 1;
        
        return acc;
    }, {} as Record<string, any>);

    const sortedMonths = Object.entries(monthlyTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => ({ key, ...data }));

    // Calculate year totals
    const currentYearTotal = sortedMonths.reduce((sum, month) => sum + month.net_income, 0);
    const currentYearRent = sortedMonths.reduce((sum, month) => sum + month.rent_collected, 0);
    const currentYearMaintenance = sortedMonths.reduce((sum, month) => sum + month.maintenance_cost, 0);

    // Get available years from the data
    const availableYears = [...new Set(monthlyData.map(item => item.year))].sort((a, b) => b - a);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
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
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Monthly Performance Summary
                        </h2>
                    </div>
                    
                    {availableYears.length > 1 && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                            aria-label="Select year"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Year Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Rent Collected</p>
                                <p className="text-lg font-bold text-green-900">
                                    {formatCurrency(currentYearRent)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                            <Wrench className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="text-sm text-red-600 font-medium">Total Maintenance</p>
                                <p className="text-lg font-bold text-red-900">
                                    {formatCurrency(currentYearMaintenance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Net Income ({selectedYear})</p>
                                <p className={`text-lg font-bold ${
                                    currentYearTotal >= 0 ? 'text-blue-900' : 'text-red-600'
                                }`}>
                                    {formatCurrency(currentYearTotal)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Breakdown */}
                {sortedMonths.length > 0 ? (
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Breakdown</h3>
                        
                        {sortedMonths.map((monthData, index) => {
                            const prevMonth = sortedMonths[index - 1];
                            const netTrend = prevMonth ? calculateTrend(monthData.net_income, prevMonth.net_income) : { trend: 'neutral' as const, percentage: 0 };
                            const collectionRate = calculateCollectionRate(monthData.rent_collected, monthData.expected_rent);
                            const trendIcon = getTrendIcon(netTrend);
                            
                            return (
                                <div key={monthData.key} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                                                {getMonthName(monthData.month)} {monthData.year}
                                            </div>
                                            
                                            {netTrend.trend !== 'neutral' && (
                                                <div className={`flex items-center gap-1 text-xs ${
                                                    netTrend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {trendIcon}
                                                    {Math.abs(netTrend.percentage).toFixed(1)}%
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${
                                                monthData.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatCurrency(monthData.net_income)}
                                            </div>
                                            <div className="text-xs text-gray-500">Net Income</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <div className="text-gray-500">Rent Collected</div>
                                            <div className="font-medium text-green-600">
                                                {formatCurrency(monthData.rent_collected)}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-gray-500">Maintenance</div>
                                            <div className="font-medium text-red-600">
                                                {formatCurrency(monthData.maintenance_cost)}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-gray-500">Collection Rate</div>
                                            <div className={`font-medium ${getCollectionRateColor(collectionRate)}`}>
                                                {collectionRate.toFixed(1)}%
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-gray-500">Properties</div>
                                            <div className="font-medium text-gray-900">
                                                {selectedPropertyId ? '1 Property' : `${monthData.properties_count} Properties`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">No monthly data available</p>
                        <p className="text-sm text-gray-500">
                            {selectedPropertyId ? 
                                'Record rent payments for this property to see monthly performance' :
                                'Record rent payments and maintenance to see monthly performance trends'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}