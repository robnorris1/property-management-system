import React, { useState } from 'react';
import {
    X,
    AlertTriangle,
    Calendar,
    CheckCircle,
    AlertCircle,
    Loader2,
    Zap,
    AlertOctagon,
    Info
} from 'lucide-react';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    applianceId: number;
    applianceName: string;
}

export default function ReportIssueModal({
                                             isOpen,
                                             onClose,
                                             onSuccess,
                                             applianceId,
                                             applianceName
                                         }: ReportIssueModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        urgency: 'medium',
        reported_date: new Date().toISOString().split('T')[0]
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const urgencyOptions = [
        {
            value: 'critical',
            label: 'Critical',
            icon: <AlertOctagon className="w-4 h-4" />,
            description: 'Not functioning - needs immediate attention',
            color: 'text-red-600 bg-red-100'
        },
        {
            value: 'high',
            label: 'High',
            icon: <AlertTriangle className="w-4 h-4" />,
            description: 'Major issue - fix soon',
            color: 'text-orange-600 bg-orange-100'
        },
        {
            value: 'medium',
            label: 'Medium',
            icon: <Zap className="w-4 h-4" />,
            description: 'Noticeable problem - schedule repair',
            color: 'text-yellow-600 bg-yellow-100'
        },
        {
            value: 'low',
            label: 'Low',
            icon: <Info className="w-4 h-4" />,
            description: 'Minor issue - fix when convenient',
            color: 'text-blue-600 bg-blue-100'
        }
    ];

    const commonIssues = [
        'Not working',
        'Making unusual noise',
        'Leaking',
        'Not heating/cooling properly',
        'Electrical issue',
        'Physical damage',
        'Performance degraded',
        'Error message/code'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleUrgencyChange = (urgency: string) => {
        setFormData(prev => ({
            ...prev,
            urgency
        }));
    };

    const handleQuickIssue = (issue: string) => {
        setFormData(prev => ({
            ...prev,
            title: issue
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Please provide a brief title for the issue');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Please describe the problem');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appliance_id: applianceId,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    urgency: formData.urgency,
                    reported_date: formData.reported_date
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to report issue');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setFormData({
                    title: '',
                    description: '',
                    urgency: 'medium',
                    reported_date: new Date().toISOString().split('T')[0]
                });
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to report issue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setFormData({
            title: '',
            description: '',
            urgency: 'medium',
            reported_date: new Date().toISOString().split('T')[0]
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
                        <div className="bg-red-100 p-2 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Report an Issue</h2>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Reported!</h3>
                            <p className="text-gray-600">We&apos;ll look into this issue as soon as possible.</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!showSuccess && (
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Urgency Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    How urgent is this issue?
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {urgencyOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleUrgencyChange(option.value)}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                formData.urgency === option.value
                                                    ? 'border-gray-900 bg-gray-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center mb-2 ${option.color} w-10 h-10 rounded-full mx-auto`}>
                                                {option.icon}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{option.label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Common Issues */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Common issues (click to use)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {commonIssues.map((issue) => (
                                        <button
                                            key={issue}
                                            type="button"
                                            onClick={() => handleQuickIssue(issue)}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                                        >
                                            {issue}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Issue Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    What&apos;s the problem? *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Not working, Making noise, Leaking..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Describe the issue *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Please provide details about what&apos;s wrong, when it started, and any other relevant information..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none text-gray-900 placeholder-gray-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Date Noticed */}
                            <div>
                                <label htmlFor="reported_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    When did you notice this issue?
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        id="reported_date"
                                        name="reported_date"
                                        value={formData.reported_date}
                                        onChange={handleInputChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-gray-900"
                                        disabled={isLoading}
                                    />
                                </div>
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
                                    disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Reporting...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-4 h-4" />
                                            Report Issue
                                        </>
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
