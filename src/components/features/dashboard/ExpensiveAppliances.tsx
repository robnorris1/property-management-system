import { PoundSterling } from 'lucide-react';
import type { DashboardData } from '@/types';

interface ExpensiveAppliancesProps {
    data: DashboardData['expensive_appliances'];
}

export default function ExpensiveAppliances({ data }: ExpensiveAppliancesProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (data.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5" />
                    Highest Maintenance Costs
                </h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.slice(0, 6).map((appliance, index) => (
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
    );
}