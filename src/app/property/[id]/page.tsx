'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, Calendar, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import AddApplianceModal from '@/components/AddApplianceModal';
import EditApplianceModal from '@/components/EditApplianceModal';
import AddMaintenanceModal from '@/components/AddMaintenanceModal';
import MaintenanceHistory from '@/components/MaintenanceHistory';

interface Property {
    id: number;
    address: string;
    property_type: string | null;
    created_at: string;
}

interface Appliance {
    id: number;
    property_id: number;
    name: string;
    type: string | null;
    installation_date: string | null;
    last_maintenance: string | null;
    status: string;
    created_at: string;
    total_maintenance_cost?: number;
    last_maintenance_cost?: number;
    maintenance_count?: number;
}

interface PropertyWithAppliances {
    property: Property;
    appliances: Appliance[];
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'working': return 'text-green-600 bg-green-50';
        case 'maintenance': return 'text-yellow-600 bg-yellow-50';
        case 'broken': return 'text-red-600 bg-red-50';
        default: return 'text-gray-600 bg-gray-50';
    }
}

function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
        case 'working': return <CheckCircle className="w-4 h-4" />;
        case 'maintenance': return <Wrench className="w-4 h-4" />;
        case 'broken': return <AlertTriangle className="w-4 h-4" />;
        default: return <CheckCircle className="w-4 h-4" />;
    }
}

function formatDate(dateString: string | null) {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount: number | null | undefined) {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

function calculateDaysSince(dateString: string | null) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export default function EnhancedPropertyDetails({
                                                    params
                                                }: {
    params: Promise<{ id: string }>
}) {
    const [propertyData, setPropertyData] = useState<PropertyWithAppliances | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [propertyId, setPropertyId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'overview' | 'maintenance'>('overview');

    // Modal states
    const [showAddApplianceModal, setShowAddApplianceModal] = useState(false);
    const [showEditApplianceModal, setShowEditApplianceModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);

    useEffect(() => {
        async function fetchPropertyData() {
            try {
                const resolvedParams = await params;
                const id = resolvedParams.id;
                setPropertyId(id);

                const response = await fetch(`/api/property/${id}`, {
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch property details');
                }

                const data = await response.json();
                setPropertyData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load property');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPropertyData();
    }, [params]);

    const handleRefresh = async () => {
        try {
            const response = await fetch(`/api/property/${propertyId}`, {
                cache: 'no-store'
            });

            if (response.ok) {
                const data = await response.json();
                setPropertyData(data);
            }
        } catch (err) {
            console.error('Failed to refresh data:', err);
        }
    };

    const handleEditAppliance = (appliance: Appliance) => {
        setSelectedAppliance(appliance);
        setShowEditApplianceModal(true);
    };

    const handleAddMaintenance = (appliance: Appliance) => {
        setSelectedAppliance(appliance);
        setShowAddMaintenanceModal(true);
    };

    const handleQuickMaintenance = async (appliance: Appliance) => {
        // Quick maintenance - just update last_maintenance to today
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`/api/appliances/${appliance.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...appliance,
                    last_maintenance: today,
                    status: 'working'
                }),
            });

            if (response.ok) {
                handleRefresh();
            }
        } catch (err) {
            console.error('Failed to update maintenance:', err);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !propertyData) {
        return (
            <main className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
                        <p className="text-gray-600">{error || 'Property not found'}</p>
                        <Link
                            href="/"
                            className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Properties
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const { property, appliances } = propertyData;

    // Calculate property-level statistics
    const totalMaintenanceCost = appliances.reduce((sum, a) => sum + (a.total_maintenance_cost || 0), 0);
    const totalMaintenanceCount = appliances.reduce((sum, a) => sum + (a.maintenance_count || 0), 0);
    const appliancesNeedingMaintenance = appliances.filter(a => {
        const daysSince = calculateDaysSince(a.last_maintenance);
        return !daysSince || daysSince > 90;
    }).length;

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Properties
                    </Link>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {property.address}
                                </h1>
                                <div className="flex items-center gap-4 text-gray-600 mb-4">
                                    <span className="capitalize">
                                        {property.property_type || 'Property type not specified'}
                                    </span>
                                    <span>•</span>
                                    <span>{appliances.length} appliances</span>
                                    <span>•</span>
                                    <span>Added {formatDate(property.created_at)}</span>
                                </div>

                                {/* Property Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-green-600">
                                            {formatCurrency(totalMaintenanceCost)}
                                        </div>
                                        <div className="text-xs text-gray-600">Total Maintenance Cost</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-600">
                                            {totalMaintenanceCount}
                                        </div>
                                        <div className="text-xs text-gray-600">Total Services</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-yellow-600">
                                            {appliancesNeedingMaintenance}
                                        </div>
                                        <div className="text-xs text-gray-600">Need Maintenance</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-purple-600">
                                            {totalMaintenanceCount > 0 ? formatCurrency(totalMaintenanceCost / totalMaintenanceCount) : '$0'}
                                        </div>
                                        <div className="text-xs text-gray-600">Avg Service Cost</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddApplianceModal(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Appliance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="border-b">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Appliances Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('maintenance')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'maintenance'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Maintenance History
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Appliances Grid */}
                                {appliances.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No appliances yet
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Add appliances to start tracking maintenance and status.
                                        </p>
                                        <button
                                            onClick={() => setShowAddApplianceModal(true)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add First Appliance
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {appliances.map((appliance: Appliance) => {
                                            const maintenanceDays = calculateDaysSince(appliance.last_maintenance);
                                            const needsMaintenance = !maintenanceDays || maintenanceDays > 90;

                                            return (
                                                <div
                                                    key={appliance.id}
                                                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                                                >
                                                    {/* Appliance Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {appliance.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 capitalize">
                                                                {appliance.type || 'Type not specified'}
                                                            </p>
                                                        </div>

                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appliance.status)}`}>
                                                            {getStatusIcon(appliance.status)}
                                                            <span className="capitalize">{appliance.status}</span>
                                                        </div>
                                                    </div>

                                                    {/* Maintenance Stats */}
                                                    <div className="space-y-3 mb-4">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">Total Cost:</span>
                                                                <div className="font-semibold text-green-600">
                                                                    {formatCurrency(appliance.total_maintenance_cost)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Services:</span>
                                                                <div className="font-semibold text-blue-600">
                                                                    {appliance.maintenance_count || 0}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-600">Installed:</span>
                                                            <span className="font-medium">
                                                                {formatDate(appliance.installation_date)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Wrench className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-600">Last maintenance:</span>
                                                            <span className={`font-medium ${needsMaintenance ? 'text-red-600' : ''}`}>
                                                                {formatDate(appliance.last_maintenance)}
                                                                {maintenanceDays && (
                                                                    <span className="text-gray-500 ml-1">
                                                                        ({maintenanceDays} days ago)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* Maintenance Alert */}
                                                        {needsMaintenance && (
                                                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                                                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                                                <span className="text-red-800">
                                                                    {maintenanceDays ? `Overdue by ${maintenanceDays - 90} days` : 'Needs initial maintenance'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditAppliance(appliance)}
                                                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickMaintenance(appliance)}
                                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                                                        >
                                                            Quick Service
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddMaintenance(appliance)}
                                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                                                        >
                                                            Log Service
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'maintenance' && (
                            <div>
                                {appliances.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No maintenance history
                                        </h3>
                                        <p className="text-gray-600">
                                            Add appliances first to start tracking maintenance history.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {appliances.map((appliance) => (
                                            <div key={appliance.id}>
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                    {appliance.name}
                                                </h4>
                                                <MaintenanceHistory
                                                    applianceId={appliance.id}
                                                    showApplianceInfo={false}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddApplianceModal
                isOpen={showAddApplianceModal}
                onClose={() => setShowAddApplianceModal(false)}
                onSuccess={handleRefresh}
                propertyId={parseInt(propertyId)}
            />

            <EditApplianceModal
                isOpen={showEditApplianceModal}
                onClose={() => {
                    setShowEditApplianceModal(false);
                    setSelectedAppliance(null);
                }}
                onSuccess={handleRefresh}
                appliance={selectedAppliance}
            />

            <AddMaintenanceModal
                isOpen={showAddMaintenanceModal}
                onClose={() => {
                    setShowAddMaintenanceModal(false);
                    setSelectedAppliance(null);
                }}
                onSuccess={handleRefresh}
                applianceId={selectedAppliance?.id || 0}
                applianceName={selectedAppliance?.name || ''}
            />
        </main>
    );
}
