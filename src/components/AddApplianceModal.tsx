import { useState } from 'react';
import { X, Wrench, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AddApplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    propertyId: number;
}

export default function AddApplianceModal({ isOpen, onClose, onSuccess, propertyId }: AddApplianceModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        installation_date: '',
        last_maintenance: '',
        status: 'working'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const applianceTypes = [
        { value: '', label: 'Select appliance type' },
        { value: 'hvac', label: 'HVAC System' },
        { value: 'water_heater', label: 'Water Heater' },
        { value: 'refrigerator', label: 'Refrigerator' },
        { value: 'washer', label: 'Washer' },
        { value: 'dryer', label: 'Dryer' },
        { value: 'dishwasher', label: 'Dishwasher' },
        { value: 'oven', label: 'Oven/Range' },
        { value: 'microwave', label: 'Microwave' },
        { value: 'garbage_disposal', label: 'Garbage Disposal' },
        { value: 'furnace', label: 'Furnace' },
        { value: 'air_conditioner', label: 'Air Conditioner' },
        { value: 'boiler', label: 'Boiler' },
        { value: 'heat_pump', label: 'Heat Pump' },
        { value: 'other', label: 'Other' }
    ];

    const statusOptions = [
        { value: 'working', label: 'Working' },
        { value: 'maintenance', label: 'Needs Maintenance' },
        { value: 'broken', label: 'Broken' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Appliance name is required');
            return false;
        }
        if (formData.name.trim().length < 2) {
            setError('Please enter a valid appliance name');
            return false;
        }

        // Validate dates if provided
        if (formData.installation_date && formData.last_maintenance) {
            const installDate = new Date(formData.installation_date);
            const maintenanceDate = new Date(formData.last_maintenance);
            if (maintenanceDate < installDate) {
                setError('Last maintenance date cannot be before installation date');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/appliances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    name: formData.name.trim(),
                    type: formData.type || null,
                    installation_date: formData.installation_date || null,
                    last_maintenance: formData.last_maintenance || null,
                    status: formData.status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add appliance');
            }

            // Show success state
            setShowSuccess(true);

            // Wait a moment to show success, then close and refresh
            setTimeout(() => {
                setShowSuccess(false);
                setFormData({
                    name: '',
                    type: '',
                    installation_date: '',
                    last_maintenance: '',
                    status: 'working'
                });
                onSuccess(); // This will refresh the appliance list
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add appliance');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return; // Prevent closing while loading
        setFormData({
            name: '',
            type: '',
            installation_date: '',
            last_maintenance: '',
            status: 'working'
        });
        setError('');
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Wrench className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Add New Appliance</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success State */}
                {showSuccess && (
                    <div className="p-6">
                        <div className="text-center">
                            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Appliance Added!</h3>
                            <p className="text-gray-600">Your new appliance has been successfully added to the property.</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!showSuccess && (
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Appliance Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Appliance Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Kitchen Refrigerator, Main HVAC Unit"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Appliance Type */}
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Appliance Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                                    disabled={isLoading}
                                >
                                    {applianceTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                                    disabled={isLoading}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Installation Date */}
                            <div>
                                <label htmlFor="installation_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Installation Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        id="installation_date"
                                        name="installation_date"
                                        value={formData.installation_date}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Last Maintenance Date */}
                            <div>
                                <label htmlFor="last_maintenance" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Maintenance Date
                                </label>
                                <div className="relative">
                                    <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        id="last_maintenance"
                                        name="last_maintenance"
                                        value={formData.last_maintenance}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900"
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty if never maintained or unknown
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span className="text-red-800">{error}</span>
                                </div>
                            )}

                            {/* Footer */}
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
                                    type="submit"
                                    disabled={isLoading || !formData.name.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Appliance'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
