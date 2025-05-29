import React, { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, User, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AddMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    applianceId: number;
    applianceName: string;
}

export default function AddMaintenanceModal({
                                                isOpen,
                                                onClose,
                                                onSuccess,
                                                applianceId,
                                                applianceName
                                            }: AddMaintenanceModalProps) {
    const [formData, setFormData] = useState({
        maintenance_type: 'routine',
        description: '',
        cost: '',
        technician_name: '',
        technician_company: '',
        maintenance_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        notes: '',
        parts_replaced: [''],
        warranty_until: '',
        status: 'completed'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const maintenanceTypes = [
        { value: 'routine', label: 'Routine Maintenance', description: 'Regular scheduled maintenance' },
        { value: 'repair', label: 'Repair', description: 'Fix broken or malfunctioning parts' },
        { value: 'inspection', label: 'Inspection', description: 'Safety or performance inspection' },
        { value: 'replacement', label: 'Replacement', description: 'Part or component replacement' },
        { value: 'cleaning', label: 'Deep Cleaning', description: 'Thorough cleaning service' },
        { value: 'upgrade', label: 'Upgrade', description: 'Performance or efficiency upgrade' }
    ];

    const statusOptions = [
        { value: 'completed', label: 'Completed' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handlePartChange = (index: number, value: string) => {
        const newParts = [...formData.parts_replaced];
        newParts[index] = value;
        setFormData(prev => ({
            ...prev,
            parts_replaced: newParts
        }));
    };

    const addPartField = () => {
        setFormData(prev => ({
            ...prev,
            parts_replaced: [...prev.parts_replaced, '']
        }));
    };

    const removePartField = (index: number) => {
        const newParts = formData.parts_replaced.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            parts_replaced: newParts.length ? newParts : ['']
        }));
    };

    const calculateNextDueDate = (maintenanceType: string, maintenanceDate: string) => {
        if (!maintenanceDate) return '';

        const date = new Date(maintenanceDate);
        const intervals = {
            routine: 90,      // 3 months
            cleaning: 180,    // 6 months
            inspection: 365,  // 1 year
            repair: 90,       // 3 months (follow-up)
            replacement: 365, // 1 year
            upgrade: 730     // 2 years
        };

        date.setDate(date.getDate() + (intervals[maintenanceType as keyof typeof intervals] || 90));
        return date.toISOString().split('T')[0];
    };

    // Auto-calculate next due date when maintenance type or date changes
    React.useEffect(() => {
        if (formData.maintenance_type && formData.maintenance_date && !formData.next_due_date) {
            const nextDue = calculateNextDueDate(formData.maintenance_type, formData.maintenance_date);
            setFormData(prev => ({ ...prev, next_due_date: nextDue }));
        }
    }, [formData.maintenance_type, formData.maintenance_date]);

    const validateForm = () => {
        if (!formData.description.trim()) {
            setError('Maintenance description is required');
            return false;
        }

        if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) {
            setError('Please enter a valid cost amount');
            return false;
        }

        if (formData.next_due_date && formData.maintenance_date) {
            const maintenanceDate = new Date(formData.maintenance_date);
            const nextDueDate = new Date(formData.next_due_date);
            if (nextDueDate <= maintenanceDate) {
                setError('Next due date must be after the maintenance date');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            // Clean up parts list - remove empty entries
            const cleanParts = formData.parts_replaced.filter(part => part.trim() !== '');

            const response = await fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appliance_id: applianceId,
                    maintenance_type: formData.maintenance_type,
                    description: formData.description.trim(),
                    cost: formData.cost ? parseFloat(formData.cost) : null,
                    technician_name: formData.technician_name.trim() || null,
                    technician_company: formData.technician_company.trim() || null,
                    maintenance_date: formData.maintenance_date,
                    next_due_date: formData.next_due_date || null,
                    notes: formData.notes.trim() || null,
                    parts_replaced: cleanParts.length ? cleanParts : null,
                    warranty_until: formData.warranty_until || null,
                    status: formData.status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add maintenance record');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setFormData({
                    maintenance_type: 'routine',
                    description: '',
                    cost: '',
                    technician_name: '',
                    technician_company: '',
                    maintenance_date: new Date().toISOString().split('T')[0],
                    next_due_date: '',
                    notes: '',
                    parts_replaced: [''],
                    warranty_until: '',
                    status: 'completed'
                });
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add maintenance record');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setFormData({
            maintenance_type: 'routine',
            description: '',
            cost: '',
            technician_name: '',
            technician_company: '',
            maintenance_date: new Date().toISOString().split('T')[0],
            next_due_date: '',
            notes: '',
            parts_replaced: [''],
            warranty_until: '',
            status: 'completed'
        });
        setError('');
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Add Maintenance Record</h2>
                            <p className="text-sm text-gray-600">{applianceName}</p>
                        </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance Recorded!</h3>
                            <p className="text-gray-600">The maintenance record has been successfully added.</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!showSuccess && (
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Maintenance Type & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maintenance Type *
                                    </label>
                                    <select
                                        name="maintenance_type"
                                        value={formData.maintenance_type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                    >
                                        {maintenanceTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {maintenanceTypes.find(t => t.value === formData.maintenance_type)?.description}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe what was done during this maintenance..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maintenance Date *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            name="maintenance_date"
                                            value={formData.maintenance_date}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Next Due Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            name="next_due_date"
                                            value={formData.next_due_date}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Auto-calculated based on maintenance type
                                    </p>
                                </div>
                            </div>

                            {/* Cost & Warranty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cost
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            name="cost"
                                            value={formData.cost}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Warranty Until
                                    </label>
                                    <input
                                        type="date"
                                        name="warranty_until"
                                        value={formData.warranty_until}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Technician Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Technician Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="technician_name"
                                            value={formData.technician_name}
                                            onChange={handleInputChange}
                                            placeholder="John Smith"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="technician_company"
                                        value={formData.technician_company}
                                        onChange={handleInputChange}
                                        placeholder="ABC Repair Services"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Parts Replaced */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Parts Replaced
                                </label>
                                <div className="space-y-2">
                                    {formData.parts_replaced.map((part, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={part}
                                                onChange={(e) => handlePartChange(index, e.target.value)}
                                                placeholder="Part name or description"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                disabled={isLoading}
                                            />
                                            {formData.parts_replaced.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePartField(index)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addPartField}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                        disabled={isLoading}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add another part
                                    </button>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any additional observations, recommendations, or notes..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span className="text-red-800">{error}</span>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex gap-3 pt-4 border-t">
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
                                    disabled={isLoading || !formData.description.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding Record...
                                        </>
                                    ) : (
                                        'Add Maintenance Record'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
