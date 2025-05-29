// src/app/page.tsx
'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Wrench, ArrowRight } from 'lucide-react';
import { Property } from '@/types';
import PropertyManagementWrapper from '@/components/PropertyManagementWrapper';
import AddPropertyButton from '@/components/AddPropertyButton';
import AuthWrapper from '@/components/AuthWrapper';
import UserMenu from '@/components/UserMenu';
import { useSession } from 'next-auth/react';

export default function Home() {
    const { data: session } = useSession();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session) {
            fetchProperties();
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
                        <div className="max-w-6xl mx-auto px-6 py-8">
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

                    {/* Properties Grid */}
                    <div className="max-w-6xl mx-auto p-6">
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
                                                        Added {new Date(property.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
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
                        )}

                        {/* Summary Stats */}
                        {properties.length > 0 && (
                            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
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
                        )}
                    </div>
                </main>
            </PropertyManagementWrapper>
        </AuthWrapper>
    );
}
