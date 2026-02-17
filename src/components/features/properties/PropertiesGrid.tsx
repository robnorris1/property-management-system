import Link from 'next/link';
import { ArrowRight, Wrench, Building2, DollarSign, Trash2, Edit, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import type { Property } from '@/types';

interface PropertiesGridProps {
    properties: Property[];
    onDeleteProperty: (id: number) => Promise<void>;
}

export default function PropertiesGrid({ properties, onDeleteProperty }: PropertiesGridProps) {
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; property: Property | null }>({
        isOpen: false,
        property: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, property: Property) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteDialog({ isOpen: true, property });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.property) return;

        setIsDeleting(true);
        try {
            await onDeleteProperty(deleteDialog.property.id);
            setDeleteDialog({ isOpen: false, property: null });
        } catch (error) {
            console.error('Failed to delete property:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteDialog = () => {
        if (isDeleting) return;
        setDeleteDialog({ isOpen: false, property: null });
    };

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property: Property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-blue-200 transition-all group relative">
                        {/* Property Header */}
                        <div className="flex items-start justify-between mb-4">
                            <Link href={`/property/${property.id}`} className="flex-1 cursor-pointer">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {property.address}
                                </h3>
                                <p className="text-sm text-gray-600 capitalize mt-1">
                                    {property.property_type || 'Type not specified'}
                                </p>
                            </Link>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Link
                                    href={`/property/${property.id}`}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={(e) => handleDeleteClick(e, property)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete property"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Property Stats */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {property.appliance_count || 0} appliance{property.appliance_count !== 1 ? 's' : ''}
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

                            {property.monthly_rent && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">
                                        ${property.monthly_rent.toLocaleString()}/month
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex gap-2">
                                <span className="flex-1 text-xs text-gray-500">
                                    Click to view details
                                </span>
                                {property.appliance_count && property.appliance_count > 0 && (
                                    <span className="text-xs text-blue-600 font-medium">
                                        View appliances →
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="Delete Property"
                message={`Are you sure you want to delete "${deleteDialog.property?.address}"? This action cannot be undone.`}
                confirmText="Delete Property"
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />
        </>
    );
}