import { Clock, Wrench } from 'lucide-react';
import type { DashboardData } from '@/types';

interface RecentMaintenanceProps {
    data: DashboardData['recent_maintenance'];
}

export default function RecentMaintenance({ data }: RecentMaintenanceProps) {
    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0);
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

    return (
        <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Maintenance
                </h3>
            </div>
            <div className="p-6">
                {data.length === 0 ? (
                    <div className="text-center py-8">
                        <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No recent maintenance records</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.slice(0, 5).map((record) => (
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
    );
}