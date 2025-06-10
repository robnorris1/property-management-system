// ===== UPDATE: src/app/page.tsx =====
// Replace your existing page.tsx with this enhanced version:

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Wrench,
    ArrowRight,
    PoundSterling,
    AlertTriangle,
    Clock,
    Activity,
    BarChart3,
    CheckCircle,
    Calendar
} from 'lucide-react';
import { Property } from '@/types';
import PropertyManagementWrapper from '@/components/PropertyManagementWrapper';
import AddPropertyButton from '@/components/AddPropertyButton';
import AuthWrapper from '@/components/AuthWrapper';
import UserMenu from '@/components/UserMenu';
import { useSession } from 'next-auth/react';

// Dashboard data interface
interface DashboardData {
    overview: {
        total_properties: number;
        total_appliances: number;
        total_maintenance_records: number;
        total_maintenance_cost: number;
        average_cost_per_maintenance: number;
        overdue_maintenance_count: number;
        upcoming_maintenance_count: number;
        items_needing_attention: number;
    };
    recent_maintenance: Array<{
        id: number;
        appliance_name: string;
        property_address: string;
        maintenance_type: string;
        cost: number;
        maintenance_date: string;
        status: string;
    }>;
    expensive_appliances: Array<{
        appliance_name: string;
        property_address: string;
        total_maintenance_cost: number;
        maintenance_count: number;
    }>;
    properties_needing_attention: Array<{
        property_address: string;
        open_issues_count: number;
        critical_issues_count: number;
        overdue_maintenance_count: number;
        total_issues: number;
    }>;
    monthly_spending: Array<{
        month: string;
        total_cost: number;
        maintenance_count: number;
    }>;
}

export default function Home() {
    const { data: session } = useSession();
    const [properties, setProperties] = useState<Property[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'properties' | 'dashboard'>('dashboard');

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
        } catch (err) {
            setError('Failed to load properties');
            console.error('Error fetching properties:', err);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMaintenanceTypeColor = (type: string) => {
        const colors = {
            routine: 'bg-blue-100 text-blue-800',
            repair: 'bg-red-100 text-red-800',
            inspection: 'bg-yellow-100 text-yellow-800',
            replacement: 'bg-purple-100 text-purple-800',
            cleaning: 'bg-green-100 text-green-800',
            upgrade: 'bg-indigo-100 text-indigo-800'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
                            </nav>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-6">
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">
                                {dashboardData && !isDashboardLoading ? (
                                    <>
                                        {/* Overview Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Total Properties</p>
                                                        <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.total_properties}</p>
                                                    </div>
                                                    <div className="bg-blue-100 p-3 rounded-full">
                                                        <Building2 className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Total Appliances</p>
                                                        <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.total_appliances}</p>
                                                    </div>
                                                    <div className="bg-green-100 p-3 rounded-full">
                                                        <Wrench className="w-6 h-6 text-green-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Total Maintenance Cost</p>
                                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.overview.total_maintenance_cost)}</p>
                                                    </div>
                                                    <div className="bg-purple-100 p-3 rounded-full">
                                                        <PoundSterling className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Items Needing Attention</p>
                                                        <p className="text-2xl font-bold text-orange-600">{dashboardData.overview.items_needing_attention}</p>
                                                    </div>
                                                    <div className="bg-orange-100 p-3 rounded-full">
                                                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Total Services</p>
                                                        <p className="text-xl font-bold text-gray-900">{dashboardData.overview.total_maintenance_records}</p>
                                                    </div>
                                                    <Activity className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Average Service Cost</p>
                                                        <p className="text-xl font-bold text-gray-900">{formatCurrency(dashboardData.overview.average_cost_per_maintenance)}</p>
                                                    </div>
                                                    <BarChart3 className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-lg border p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Upcoming Maintenance</p>
                                                        <p className="text-xl font-bold text-blue-600">{dashboardData.overview.upcoming_maintenance_count}</p>
                                                    </div>
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Content Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Recent Maintenance */}
                                            <div className="bg-white rounded-lg border">
                                                <div className="p-6 border-b">
                                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                        <Clock className="w-5 h-5" />
                                                        Recent Maintenance
                                                    </h3>
                                                </div>
                                                <div className="p-6">
                                                    {dashboardData.recent_maintenance.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-gray-500">No recent maintenance records</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {dashboardData.recent_maintenance.slice(0, 5).map((record) => (
                                                                <div key={record.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-medium text-gray-900">{record.appliance_name}</span>
                                                                            <span className={`px-2 py-1 rounded-full text-xs ${getMaintenanceTypeColor(record.maintenance_type)}`}>
                                                                                {record.maintenance_type}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-600">{record.property_address}</p>
                                                                        <p className="text-xs text-gray-500">{formatDate(record.maintenance_date)}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-semibold text-gray-900">{formatCurrency(record.cost)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Properties Needing Attention */}
                                            <div className="bg-white rounded-lg border">
                                                <div className="p-6 border-b">
                                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5" />
                                                        Properties Needing Attention
                                                    </h3>
                                                </div>
                                                <div className="p-6">
                                                    {dashboardData.properties_needing_attention.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                                            <p className="text-green-600 font-medium">All properties up to date!</p>
                                                            <p className="text-gray-500 text-sm">No overdue maintenance items</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {dashboardData.properties_needing_attention.map((property, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg border border-red-200">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">{property.property_address}</p>
                                                                        <div className="flex gap-3 text-sm mt-1">
                                                                            {property.critical_issues_count > 0 && (
                                                                                <span className="text-red-600">
                                                                                    {property.critical_issues_count} critical issue{property.critical_issues_count !== 1 ? 's' : ''}
                                                                                </span>
                                                                            )}
                                                                            {property.open_issues_count > 0 && (
                                                                                <span className="text-orange-600">
                                                                                    {property.open_issues_count} open issue{property.open_issues_count !== 1 ? 's' : ''}
                                                                                </span>
                                                                            )}
                                                                            {property.overdue_maintenance_count > 0 && (
                                                                                <span className="text-yellow-600">
                                                                                    {property.overdue_maintenance_count} overdue
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-red-600">{property.total_issues}</p>
                                                                        <p className="text-xs text-gray-500">total issues</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Highest Maintenance Costs */}
                                        {dashboardData.expensive_appliances.length > 0 && (
                                            <div className="bg-white rounded-lg border">
                                                <div className="p-6 border-b">
                                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                        <PoundSterling className="w-5 h-5" />
                                                        Highest Maintenance Costs
                                                    </h3>
                                                </div>
                                                <div className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {dashboardData.expensive_appliances.slice(0, 6).map((appliance, index) => (
                                                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-medium text-gray-900 truncate">{appliance.appliance_name}</h4>
                                                                    <span className="font-bold text-red-600">{formatCurrency(appliance.total_maintenance_cost)}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 truncate">{appliance.property_address}</p>
                                                                <p className="text-xs text-gray-500">{appliance.maintenance_count} services</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                                                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                                                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Properties Tab */}
                        {activeTab === 'properties' && (
                            <div className="space-y-6">
                                {properties.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            No properties yet
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Add your first property to start managing appliances and maintenance.
                                        </p>
                                        <AddPropertyButton variant="primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {properties.map((property: Property) => (
                                                <Link
                                                    key={property.id}
                                                    href={`/property/${property.id}`}
                                                    className="block"
                                                >
                                                    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-blue-200 transition-all group">
                                                        {/* Property Header */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                    {property.address}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 capitalize mt-1">
                                                                    {property.property_type || 'Type not specified'}
                                                                </p>
                                                            </div>
                                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                        </div>

                                                        {/* Property Stats */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <Wrench className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">
                                                                    {property.appliance_count || '0'} appliance{property.appliance_count !== '1' ? 's' : ''}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">
                                                                    Added {new Date(property.created_at).toLocaleDateString('en-GB', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Quick Actions */}
                                                        <div className="mt-4 pt-4 border-t">
                                                            <div className="flex gap-2">
                                                                <span className="flex-1 text-xs text-gray-500">
                                                                    Click to view details
                                                                </span>
                                                                {property.appliance_count && parseInt(property.appliance_count) > 0 && (
                                                                    <span className="text-xs text-blue-600 font-medium">
                                                                        View appliances →
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Properties Summary */}
                                        <div className="bg-white rounded-lg shadow-sm border p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties Summary</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {properties.length}
                                                    </div>
                                                    <div className="text-sm text-gray-600">Properties</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {properties.reduce((sum, p) => sum + parseInt(p.appliance_count || '0'), 0)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">Total Appliances</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-yellow-600">
                                                        {properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + parseInt(p.appliance_count || '0'), 0) / properties.length) : 0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">Avg per Property</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {properties.filter(p => parseInt(p.appliance_count || '0') > 0).length}
                                                    </div>
                                                    <div className="text-sm text-gray-600">Active Properties</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </PropertyManagementWrapper>
        </AuthWrapper>
    );
}
