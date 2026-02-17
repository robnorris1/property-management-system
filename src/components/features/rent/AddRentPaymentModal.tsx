import { useState } from 'react';
import { X, DollarSign, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { Property } from '@/types';

interface AddRentPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    property: Property;
}

export default function AddRentPaymentModal({ isOpen, onClose, onSuccess, property }: AddRentPaymentModalProps) {
    const [formData, setFormData] = useState({
        amount: property.monthly_rent?.toString() || '',
        payment_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        payment_method: 'transfer',
        reference_number: '',
        notes: '',
        late_fee_amount: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const paymentMethods = [
        { value: 'transfer', label: 'Bank Transfer' },
        { value: 'check', label: 'Check' },
        { value: 'cash', label: 'Cash' },
        { value: 'online', label: 'Online Payment' },
        { value: 'other', label: 'Other' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Payment amount is required and must be greater than 0');
            return false;
        }
        if (!formData.payment_date) {
            setError('Payment date is required');
            return false;
        }
        if (!formData.due_date) {
            setError('Due date is required');
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
            const response = await fetch('/api/rent-payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    property_id: property.id,
                    amount: parseFloat(formData.amount),
                    payment_date: formData.payment_date,
                    due_date: formData.due_date,
                    payment_method: formData.payment_method,
                    reference_number: formData.reference_number || null,
                    notes: formData.notes || null,
                    status: 'paid',
                    late_fee_amount: formData.late_fee_amount ? parseFloat(formData.late_fee_amount) : 0
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to record rent payment');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setFormData({
                    amount: property.monthly_rent?.toString() || '',
                    payment_date: new Date().toISOString().split('T')[0],
                    due_date: new Date().toISOString().split('T')[0],
                    payment_method: 'transfer',
                    reference_number: '',
                    notes: '',
                    late_fee_amount: ''
                });
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record rent payment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setFormData({
            amount: property.monthly_rent?.toString() || '',
            payment_date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            payment_method: 'transfer',
            reference_number: '',
            notes: '',
            late_fee_amount: ''
        });
        setError('');
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Record Rent Payment</h2>
                            <p className="text-sm text-gray-600">{property.address}</p>
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

                {showSuccess && (
                    <div className="p-6">
                        <div className="text-center">
                            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Recorded!</h3>
                            <p className="text-gray-600">Rent payment has been successfully recorded.</p>
                        </div>
                    </div>
                )}

                {!showSuccess && (
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Amount *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            id="amount"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="late_fee_amount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Late Fee
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            id="late_fee_amount"
                                            name="late_fee_amount"
                                            value={formData.late_fee_amount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Date *
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">When payment was received</p>
                                    <input
                                        type="date"
                                        id="payment_date"
                                        name="payment_date"
                                        value={formData.payment_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Due Date *
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">When this rent was originally due</p>
                                    <input
                                        type="date"
                                        id="due_date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <select
                                    id="payment_method"
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                    disabled={isLoading}
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reference Number
                                </label>
                                <input
                                    type="text"
                                    id="reference_number"
                                    name="reference_number"
                                    value={formData.reference_number}
                                    onChange={handleInputChange}
                                    placeholder="Check number, transaction ID, etc."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Optional notes about this payment"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                                    disabled={isLoading}
                                />
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
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.amount || !formData.payment_date || !formData.due_date}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Recording...
                                    </>
                                ) : (
                                    'Record Payment'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}