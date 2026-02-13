import {
    Building2,
    Wrench,
    PoundSterling,
    AlertTriangle,
    Activity,
    BarChart3,
    Calendar
} from 'lucide-react';
import type { DashboardData } from '@/types';

interface DashboardOverviewProps {
    data: DashboardData['overview'];
}

export default function DashboardOverview({ data }: DashboardOverviewProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Properties</p>
                            <p className="text-2xl font-bold text-gray-900">{data.total_properties}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{data.total_appliances}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.total_maintenance_cost)}</p>
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
                            <p className="text-2xl font-bold text-orange-600">{data.items_needing_attention}</p>
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
                            <p className="text-xl font-bold text-gray-900">{data.total_maintenance_records}</p>
                        </div>
                        <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Service Cost</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(data.average_cost_per_maintenance)}</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Upcoming Maintenance</p>
                            <p className="text-xl font-bold text-blue-600">{data.upcoming_maintenance_count}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
        </>
    );
}