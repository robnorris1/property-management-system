'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, Calendar, AlertTriangle, CheckCircle, Plus, Edit } from 'lucide-react'
import AddApplianceModal from '@/components/features/maintenance/AddApplianceModal';
import EditApplianceModal from '@/components/features/maintenance/EditApplianceModal';
import AddMaintenanceModal from '@/components/features/maintenance/AddMaintenanceModal';
import MaintenanceHistory from '@/components/features/maintenance/MaintenanceHistory';
import ReportIssueModal from '@/components/features/maintenance/ReportIssueModal';
import IssuesList from '@/components/features/maintenance/IssuesList';
import EditPropertyModal from '@/components/features/properties/EditPropertyModal';
import AddRentPaymentModal from '@/components/features/rent/AddRentPaymentModal';
import PaymentHistory from '@/components/features/rent/PaymentHistory';

import type { Appliance, PropertyWithAppliances } from '@/types';

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'working': return 'text-green-600 bg-green-50';
        case 'needs_repair': return 'text-orange-600 bg-orange-50';
        case 'under_repair': return 'text-yellow-600 bg-yellow-50';
        case 'out_of_service': return 'text-red-600 bg-red-50';
        case 'maintenance': return 'text-yellow-600 bg-yellow-50';
        case 'broken': return 'text-red-600 bg-red-50';
        default: return 'text-gray-600 bg-gray-50';
    }
}

function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
        case 'working': return <CheckCircle className="w-4 h-4" />;
        case 'needs_repair': return <Wrench className="w-4 h-4" />;
        case 'under_repair': return <Wrench className="w-4 h-4" />;
        case 'out_of_service': return <AlertTriangle className="w-4 h-4" />;
        case 'maintenance': return <Wrench className="w-4 h-4" />;
        case 'broken': return <AlertTriangle className="w-4 h-4" />;
        default: return <CheckCircle className="w-4 h-4" />;
    }
}

function getStatusLabel(status: string) {
    switch (status.toLowerCase()) {
        case 'working': return 'Working';
        case 'needs_repair': return 'Needs Repair';
        case 'under_repair': return 'Under Repair';
        case 'out_of_service': return 'Out of Service';
        case 'maintenance': return 'Needs Maintenance';
        case 'broken': return 'Broken';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function formatDate(dateString: string | null) {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatCurrency(amount: number | null | undefined) {
    if (!amount && amount !== 0) return '£0';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
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
    const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'issues' | 'rent'>('overview');

    // Modal states
    const [showAddApplianceModal, setShowAddApplianceModal] = useState(false);
    const [showEditApplianceModal, setShowEditApplianceModal] = useState(false);
    const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
    const [showReportIssueModal, setShowReportIssueModal] = useState(false);
    const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
    const [showAddRentPaymentModal, setShowAddRentPaymentModal] = useState(false);
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

    const handleReportIssue = (appliance: Appliance) => {
        setSelectedAppliance(appliance);
        setShowReportIssueModal(true);
    };

    const handleMarkServiced = async (appliance: Appliance) => {
        const confirmed = confirm(
            `Mark ${appliance.name} as Serviced\n\n` +
            `This will:\n` +
            `• Add a routine maintenance record for today\n` +
            `• Set status to 'working'\n` +
            `• Update maintenance counters\n\n` +
            `Continue?`
        );

        if (!confirmed) return;

        try {
            // Create a proper maintenance record
            const response = await fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appliance_id: appliance.id,
                    maintenance_type: 'routine',
                    description: 'Routine maintenance service completed',
                    cost: null, // No cost for quick service
                    maintenance_date: new Date().toISOString().split('T')[0],
                    status: 'completed',
                    notes: 'Service marked as completed via Mark Serviced button'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add maintenance record');
            }

            // Update appliance status to working (only send status to avoid overwriting last_maintenance)
            await fetch(`/api/appliances/${appliance.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'working'
                }),
            });

            // Refresh the data to show updated counts and costs
            handleRefresh();

            // Show success message
            alert(`✅ ${appliance.name} marked as serviced successfully!`);

        } catch (err) {
            console.error('Failed to mark as serviced:', err);
            alert(`❌ Failed to mark ${appliance.name} as serviced. Please try again.\n\nError: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    const totalMaintenanceCost = appliances.reduce((sum, a) => {
        return sum + (a.total_maintenance_cost || 0);
    }, 0);

    const totalMaintenanceCount = appliances.reduce((sum, a) => {
        return sum + (a.maintenance_count || 0);
    }, 0);

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
                                            {totalMaintenanceCount > 0 ? formatCurrency(totalMaintenanceCost / totalMaintenanceCount) : '£0'}
                                        </div>
                                        <div className="text-xs text-gray-600">Avg Service Cost</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowEditPropertyModal(true)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Property
                                </button>
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
                            <button
                                onClick={() => setActiveTab('issues')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'issues'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Issues & Problems
                            </button>
                            <button
                                onClick={() => setActiveTab('rent')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'rent'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Rent Payments
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
                                                            <span>{getStatusLabel(appliance.status)}</span>
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
                                                                    {maintenanceDays && maintenanceDays > 90 
                                                                        ? `Overdue by ${maintenanceDays - 90} days` 
                                                                        : !appliance.last_maintenance 
                                                                            ? 'No maintenance history - consider scheduling first service'
                                                                            : 'Maintenance recommended (90+ days since last service)'
                                                                    }
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
                                                        {appliance.status !== 'working' ? (
                                                            <button
                                                                onClick={() => handleAddMaintenance(appliance)}
                                                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                                                            >
                                                                Fix Issue
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleReportIssue(appliance)}
                                                                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <AlertTriangle className="w-3 h-3"/>
                                                                    Report Issue
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkServiced(appliance)}
                                                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <CheckCircle className="w-3 h-3"/>
                                                                    Service
                                                                </button>
                                                            </>
                                                        )}
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

                        {activeTab === 'issues' && (
                            <div>
                                {appliances.length === 0 ? (
                                    <div className="text-center py-12">
                                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No issues to track
                                        </h3>
                                        <p className="text-gray-600">
                                            Add appliances first to start reporting issues.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {appliances.map((appliance) => (
                                            <div key={appliance.id}>
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                    {appliance.name}
                                                </h4>
                                                <IssuesList
                                                    applianceId={appliance.id}
                                                    onResolve={handleRefresh}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'rent' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Rent Management</h3>
                                        <p className="text-sm text-gray-600">Record and track rent payments for this property</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddRentPaymentModal(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Record Rent Payment
                                    </button>
                                </div>
                                
                                <PaymentHistory 
                                    propertyId={parseInt(propertyId)}
                                    propertyAddress={property.address}
                                    monthlyRent={property.monthly_rent}
                                />
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

            <ReportIssueModal
                isOpen={showReportIssueModal}
                onClose={() => {
                    setShowReportIssueModal(false);
                    setSelectedAppliance(null);
                }}
                onSuccess={handleRefresh}
                applianceId={selectedAppliance?.id || 0}
                applianceName={selectedAppliance?.name || ''}
            />

            <EditPropertyModal
                isOpen={showEditPropertyModal}
                onClose={() => setShowEditPropertyModal(false)}
                onSuccess={handleRefresh}
                property={property}
            />

            <AddRentPaymentModal
                isOpen={showAddRentPaymentModal}
                onClose={() => setShowAddRentPaymentModal(false)}
                onSuccess={handleRefresh}
                property={property}
            />
        </main>
    );
}
