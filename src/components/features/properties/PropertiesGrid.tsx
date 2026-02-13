import Link from 'next/link';
import { ArrowRight, Wrench, Building2 } from 'lucide-react';
import type { Property } from '@/types';

interface PropertiesGridProps {
    properties: Property[];
}

export default function PropertiesGrid({ properties }: PropertiesGridProps) {
    return (
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
    );
}