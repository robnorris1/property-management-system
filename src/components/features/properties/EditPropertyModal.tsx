import { useState } from 'react';
import { X, Home, MapPin, CheckCircle, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import type { Property } from '@/types';

interface EditPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    property: Property;
}

export default function EditPropertyModal({ isOpen, onClose, onSuccess, property }: EditPropertyModalProps) {
    const [formData, setFormData] = useState({
        address: property.address || '',
        property_type: property.property_type || '',
        monthly_rent: property.monthly_rent?.toString() || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const propertyTypes = [
        { value: '', label: 'Select property type' },
        { value: 'house', label: 'House' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'condo', label: 'Condo' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'office', label: 'Office' },
        { value: 'retail', label: 'Retail' },
        { value: 'warehouse', label: 'Warehouse' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.address.trim()) {
            setError('Property address is required');
            return false;
        }
        if (formData.address.trim().length < 5) {
            setError('Please enter a complete address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/properties/${property.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: formData.address.trim(),
                    property_type: formData.property_type || null,
                    monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update property');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update property');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setFormData({
            address: property.address || '',
            property_type: property.property_type || '',
            monthly_rent: property.monthly_rent?.toString() || ''
        });
        setError('');
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Edit Property</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {showSuccess && (
                    <div className="p-6">
                        <div className="text-center">
                            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Updated!</h3>
                            <p className="text-gray-600">Your property has been successfully updated.</p>
                        </div>
                    </div>
                )}

                {!showSuccess && (
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter full property address"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Type
                                </label>
                                <select
                                    id="property_type"
                                    name="property_type"
                                    value={formData.property_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    disabled={isLoading}
                                >
                                    {propertyTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Rent
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        id="monthly_rent"
                                        name="monthly_rent"
                                        value={formData.monthly_rent}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Leave blank to remove rent amount</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span className="text-red-800">{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.address.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Property'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}