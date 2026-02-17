import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Clock, CheckCircle, AlertTriangle, CreditCard, FileText } from 'lucide-react';
import type { RentPayment } from '@/types';

interface PaymentHistoryProps {
    propertyId: number;
    propertyAddress: string;
    monthlyRent?: number | null;
}

export default function PaymentHistory({ propertyId, propertyAddress, monthlyRent }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<RentPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [propertyId]);

    const fetchPayments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/rent-payments?property_id=${propertyId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch payment history');
            }

            const data = await response.json();
            setPayments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payment history');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string, dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        
        switch (status) {
            case 'paid':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'late':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'partial':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            default:
                return due < today ? 
                    <AlertTriangle className="w-4 h-4 text-red-600" /> : 
                    <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Paid';
            case 'late': return 'Late Payment';
            case 'partial': return 'Partial Payment';
            default: return status;
        }
    };

    const getStatusColor = (status: string, dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        
        switch (status) {
            case 'paid': return 'bg-green-50 text-green-800 border-green-200';
            case 'late': return 'bg-red-50 text-red-800 border-red-200';
            case 'partial': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            default: return due < today ? 
                'bg-red-50 text-red-800 border-red-200' : 
                'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLateFees = payments.reduce((sum, payment) => sum + payment.late_fee_amount, 0);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                        <p className="text-sm text-gray-600">{propertyAddress}</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Payments</p>
                        <p className="text-lg font-semibold text-gray-900">{payments.length}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Collected</p>
                        <p className="text-lg font-semibold text-green-900">{formatCurrency(totalCollected)}</p>
                    </div>
                    {monthlyRent && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Rent</p>
                            <p className="text-lg font-semibold text-blue-900">{formatCurrency(monthlyRent)}</p>
                        </div>
                    )}
                    {totalLateFees > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Late Fees</p>
                            <p className="text-lg font-semibold text-red-900">{formatCurrency(totalLateFees)}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment List */}
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {payments.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">No payment history found</p>
                        <p className="text-sm text-gray-500">Add the first payment to see history here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(payment.status, payment.due_date)}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(payment.status, payment.due_date)}`}>
                                                    {getStatusText(payment.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Paid: {formatDate(payment.payment_date)}
                                                </span>
                                                <span>Due: {formatDate(payment.due_date)}</span>
                                                {payment.payment_method && (
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {payment.payment_method}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        {payment.late_fee_amount > 0 && (
                                            <div className="text-sm text-red-600 font-medium mb-1">
                                                Late Fee: {formatCurrency(payment.late_fee_amount)}
                                            </div>
                                        )}
                                        {payment.reference_number && (
                                            <div className="text-xs text-gray-500">
                                                Ref: {payment.reference_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {payment.notes && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                        <span className="font-medium">Note: </span>
                                        {payment.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}