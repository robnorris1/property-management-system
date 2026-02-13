import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { DashboardData } from '@/types';

interface PropertiesNeedingAttentionProps {
    data: DashboardData['properties_needing_attention'];
}

export default function PropertiesNeedingAttention({ data }: PropertiesNeedingAttentionProps) {
    return (
        <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Properties Needing Attention
                </h3>
            </div>
            <div className="p-6">
                {data.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-600 font-medium">All properties up to date!</p>
                        <p className="text-gray-500 text-sm">No overdue maintenance items</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.map((property, index) => (
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
    );
}