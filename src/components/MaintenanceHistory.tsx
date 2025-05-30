import { useState, useEffect } from 'react';
import {
    Calendar,
    BadgePoundSterlingIcon,
    User,
    Wrench,
    ChevronDown,
    ChevronUp,
    Edit3,
    Trash2,
    Award,
    PoundSterlingIcon
} from 'lucide-react';

interface MaintenanceRecord {
    id: number;
    appliance_id: number;
    maintenance_type: string;
    description: string;
    cost: number | null;
    technician_name: string | null;
    technician_company: string | null;
    maintenance_date: string;
    next_due_date: string | null;
    notes: string | null;
    parts_replaced: string[] | null;
    warranty_until: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    appliance_name: string;
    property_address: string;
}

interface MaintenanceHistoryProps {
    applianceId: number;
    onEdit?: (record: MaintenanceRecord) => void;
    showApplianceInfo?: boolean;
}

export default function MaintenanceHistory({
                                               applianceId,
                                               onEdit,
                                               showApplianceInfo = false
                                           }: MaintenanceHistoryProps) {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchMaintenanceHistory();
    }, [applianceId]);

    const fetchMaintenanceHistory = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/maintenance?appliance_id=${applianceId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch maintenance history');
            }

            const data = await response.json();
            setRecords(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load maintenance history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (recordId: number) => {
        if (!confirm('Are you sure you want to delete this maintenance record?')) {
            return;
        }

        try {
            const response = await fetch(`/api/maintenance/${recordId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete maintenance record');
            }

            // Refresh the list
            fetchMaintenanceHistory();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete record');
        }
    };

    const toggleExpanded = (recordId: number) => {
        const newExpanded = new Set(expandedRecords);
        if (newExpanded.has(recordId)) {
            newExpanded.delete(recordId);
        } else {
            newExpanded.add(recordId);
        }
        setExpandedRecords(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    function formatCurrency(amount: number | null | undefined) {
        if (!amount) return '£0';
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

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

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const totalCost = records.reduce((sum, record) => sum + (record.cost || 0), 0);
    const averageCost = records.length > 0 ? totalCost / records.filter(r => r.cost).length : 0;

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={fetchMaintenanceHistory}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header with Summary */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Maintenance History
                    </h3>
                    <span className="text-sm text-gray-500">
                        {records.length} record{records.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Summary Stats */}
                {records.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                                {formatCurrency(totalCost)}
                            </div>
                            <div className="text-xs text-gray-600">Total Spent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                                {formatCurrency(averageCost)}
                            </div>
                            <div className="text-xs text-gray-600">Average Cost</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">
                                {records.filter(r => r.status === 'completed').length}
                            </div>
                            <div className="text-xs text-gray-600">Completed</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Records List */}
            <div className="divide-y">
                {records.length === 0 ? (
                    <div className="p-8 text-center">
                        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No maintenance records</h4>
                        <p className="text-gray-600">
                            Maintenance history will appear here once you start logging service records.
                        </p>
                    </div>
                ) : (
                    records.map((record) => {
                        const isExpanded = expandedRecords.has(record.id);
                        const hasWarranty = record.warranty_until && new Date(record.warranty_until) > new Date();

                        return (
                            <div key={record.id} className="p-6">
                                {/* Record Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceTypeColor(record.maintenance_type)}`}>
                                                {record.maintenance_type.charAt(0).toUpperCase() + record.maintenance_type.slice(1)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
                                            </span>
                                            {hasWarranty && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                                                    <Award className="w-3 h-3" />
                                                    Under Warranty
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-medium text-gray-900 mb-1">
                                            {record.description}
                                        </h4>

                                        {showApplianceInfo && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                {record.appliance_name} • {record.property_address}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(record.maintenance_date)}
                                            </span>
                                            {record.cost && (
                                                <span className="flex items-center gap-1">
                                                    <PoundSterlingIcon className="w-4 h-4" />
                                                    {formatCurrency(record.cost)}
                                                </span>
                                            )}
                                            {record.technician_name && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {record.technician_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(record)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit record"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(record.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleExpanded(record.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title={isExpanded ? "Show less" : "Show more"}
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                        {record.technician_company && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Company: </span>
                                                <span className="text-sm text-gray-600">{record.technician_company}</span>
                                            </div>
                                        )}

                                        {record.parts_replaced && record.parts_replaced.length > 0 && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Parts Replaced: </span>
                                                <div className="mt-1">
                                                    {record.parts_replaced.map((part, index) => (
                                                        <span key={index} className="inline-block bg-white px-2 py-1 rounded text-xs text-gray-600 mr-2 mb-1">
                                                            {part}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {record.next_due_date && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Next Due: </span>
                                                <span className="text-sm text-gray-600">{formatDate(record.next_due_date)}</span>
                                            </div>
                                        )}

                                        {record.warranty_until && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Warranty Until: </span>
                                                <span className="text-sm text-gray-600">{formatDate(record.warranty_until)}</span>
                                            </div>
                                        )}

                                        {record.notes && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Notes: </span>
                                                <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 pt-2 border-t">
                                            Record created {formatDate(record.created_at)}
                                            {record.updated_at !== record.created_at && (
                                                <span> • Last updated {formatDate(record.updated_at)}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
