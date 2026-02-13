import type { Property } from '@/types';

interface PropertiesSummaryProps {
    properties: Property[];
}

export default function PropertiesSummary({ properties }: PropertiesSummaryProps) {
    return (
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
    );
}