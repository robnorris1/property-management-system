import { Building2 } from 'lucide-react';
import AddPropertyButton from '@/components/features/properties/AddPropertyButton';

export default function PropertiesEmptyState() {
    return (
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
    );
}