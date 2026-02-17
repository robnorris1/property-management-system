'use client';

import { useEffect, useState } from 'react';
import { Building2, BarChart3, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

import type { Property, DashboardData } from '@/types';
import PropertyManagementWrapper from '@/components/layout/PropertyManagementWrapper';
import AddPropertyButton from '@/components/features/properties/AddPropertyButton';
import AuthWrapper from '@/components/features/auth/AuthWrapper';
import UserMenu from '@/components/features/auth/UserMenu';

import DashboardOverview from '@/components/features/dashboard/DashboardOverview';
import RecentMaintenance from '@/components/features/dashboard/RecentMaintenance';
import PropertiesNeedingAttention from '@/components/features/dashboard/PropertiesNeedingAttention';
import ExpensiveAppliances from '@/components/features/dashboard/ExpensiveAppliances';
import DashboardLoading from '@/components/features/dashboard/DashboardLoading';

import PropertiesGrid from '@/components/features/properties/PropertiesGrid';
import PropertiesSummary from '@/components/features/properties/PropertiesSummary';
import PropertiesEmptyState from '@/components/features/properties/PropertiesEmptyState';

import PropertyPerformanceDashboard from '@/components/features/analytics/PropertyPerformanceDashboard';
import MonthlyPerformanceSummary from '@/components/features/analytics/MonthlyPerformanceSummary';

export default function Home() {
    const { data: session } = useSession();
    const [properties, setProperties] = useState<Property[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'properties' | 'dashboard' | 'analytics'>('dashboard');

    useEffect(() => {
        if (session) {
            fetchProperties();
            fetchDashboardData();
        }
    }, [session]);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/properties', {
                cache: 'no-store'
            });

            if (!res.ok) {
                throw new Error('Failed to fetch properties');
            }

            const data = await res.json();
            setProperties(data);
        } catch {
            setError('Failed to load properties');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setIsDashboardLoading(true);
            const response = await fetch('/api/dashboard?timeRange=6months');

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsDashboardLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AuthWrapper>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your properties...</p>
                    </div>
                </div>
            </AuthWrapper>
        );
    }

    if (error) {
        return (
            <AuthWrapper>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => fetchProperties()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </AuthWrapper>
        );
    }

    return (
        <AuthWrapper>
            <PropertyManagementWrapper>
                <main className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Property Management System
                                    </h1>
                                    <p className="text-gray-600">
                                        Manage your properties and track appliance maintenance
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AddPropertyButton />
                                    <UserMenu />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white border-b">
                        <div className="max-w-7xl mx-auto px-6">
                            <nav className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'dashboard'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" />
                                        Dashboard
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('properties')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'properties'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Properties ({properties.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === 'analytics'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Analytics
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-6">
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">
                                {dashboardData && !isDashboardLoading ? (
                                    <>
                                        <DashboardOverview data={dashboardData.overview} />
                                        
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <RecentMaintenance data={dashboardData.recent_maintenance} />
                                            <PropertiesNeedingAttention data={dashboardData.properties_needing_attention} />
                                        </div>
                                        
                                        <ExpensiveAppliances data={dashboardData.expensive_appliances} />
                                    </>
                                ) : (
                                    <DashboardLoading />
                                )}
                            </div>
                        )}

                        {/* Properties Tab */}
                        {activeTab === 'properties' && (
                            <div className="space-y-6">
                                {properties.length === 0 ? (
                                    <PropertiesEmptyState />
                                ) : (
                                    <>
                                        <PropertiesGrid properties={properties} />
                                        <PropertiesSummary properties={properties} />
                                    </>
                                )}
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <PropertyPerformanceDashboard />
                                <MonthlyPerformanceSummary />
                            </div>
                        )}
                    </div>
                </main>
            </PropertyManagementWrapper>
        </AuthWrapper>
    );
}