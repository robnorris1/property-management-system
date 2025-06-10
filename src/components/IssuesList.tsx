// src/components/IssuesList.tsx
import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    AlertOctagon,
    Zap,
    Info,
    Calendar,
    ChevronDown,
    ChevronUp,
    CheckSquare
} from 'lucide-react';

interface Issue {
    id: number;
    appliance_id: number;
    title: string;
    description: string;
    urgency: string;
    status: string;
    reported_date: string;
    scheduled_date: string | null;
    resolved_date: string | null;
    resolution_notes: string | null;
    appliance_name: string;
    property_address: string;
    reported_by_name: string | null;
}

interface IssuesListProps {
    applianceId?: number;
    propertyId?: number;
    onResolve?: () => void;
}

export default function IssuesList({ applianceId, onResolve }: IssuesListProps) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

    useEffect(() => {
        fetchIssues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applianceId, filter]);

    const fetchIssues = async () => {
        try {
            setIsLoading(true);
            let url = '/api/issues';
            const params = new URLSearchParams();

            if (applianceId) {
                params.append('appliance_id', applianceId.toString());
            }

            if (filter !== 'all') {
                params.append('status', filter === 'open' ? 'open' : 'resolved');
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch issues');
            }

            const data = await response.json();
            setIssues(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load issues');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpanded = (issueId: number) => {
        const newExpanded = new Set(expandedIssues);
        if (newExpanded.has(issueId)) {
            newExpanded.delete(issueId);
        } else {
            newExpanded.add(issueId);
        }
        setExpandedIssues(newExpanded);
    };

    const handleResolveIssue = async (issueId: number) => {
        if (!confirm('Mark this issue as resolved?')) return;

        try {
            const response = await fetch(`/api/issues/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'resolved',
                    resolved_date: new Date().toISOString().split('T')[0]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to resolve issue');
            }

            fetchIssues();
            if (onResolve) onResolve();
        } catch {
            alert('Failed to resolve issue');
        }
    };

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency) {
            case 'critical': return <AlertOctagon className="w-4 h-4" />;
            case 'high': return <AlertTriangle className="w-4 h-4" />;
            case 'medium': return <Zap className="w-4 h-4" />;
            case 'low': return <Info className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-red-600 bg-red-100';
            case 'scheduled': return 'text-yellow-600 bg-yellow-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'resolved': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateDaysAgo = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={fetchIssues}
                        className="mt-2 text-blue-600 hover:text-blue-800 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const openIssues = issues.filter(i => i.status !== 'resolved');
    const resolvedIssues = issues.filter(i => i.status === 'resolved');

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Reported Issues
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('open')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                filter === 'open'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Open ({openIssues.length})
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                filter === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Resolved ({resolvedIssues.length})
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All ({issues.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Issues List */}
            <div className="divide-y">
                {issues.length === 0 ? (
                    <div className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === 'open' ? 'No open issues' : filter === 'resolved' ? 'No resolved issues' : 'No issues reported'}
                        </h4>
                        <p className="text-gray-600">
                            {filter === 'open' ? 'All issues have been resolved!' : 'Issues will appear here when reported.'}
                        </p>
                    </div>
                ) : (
                    issues.map((issue) => {
                        const isExpanded = expandedIssues.has(issue.id);
                        const daysAgo = calculateDaysAgo(issue.reported_date);

                        return (
                            <div key={issue.id} className="p-6">
                                {/* Issue Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor(issue.urgency)}`}>
                                                {getUrgencyIcon(issue.urgency)}
                                                {issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1)}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('_', ' ')}
                                            </span>
                                        </div>

                                        <h4 className="font-medium text-gray-900 mb-1">
                                            {issue.title}
                                        </h4>

                                        <p className="text-sm text-gray-600 mb-2">
                                            {issue.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(issue.reported_date)} ({daysAgo} days ago)
                                            </span>
                                            {issue.reported_by_name && (
                                                <span>Reported by {issue.reported_by_name}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {issue.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleResolveIssue(issue.id)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Mark as resolved"
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleExpanded(issue.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title={isExpanded ? "Show less" : "Show more"}
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                        {issue.scheduled_date && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Scheduled: </span>
                                                <span className="text-sm text-gray-600">{formatDate(issue.scheduled_date)}</span>
                                            </div>
                                        )}

                                        {issue.resolved_date && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Resolved: </span>
                                                <span className="text-sm text-gray-600">{formatDate(issue.resolved_date)}</span>
                                            </div>
                                        )}

                                        {issue.resolution_notes && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Resolution: </span>
                                                <p className="text-sm text-gray-600 mt-1">{issue.resolution_notes}</p>
                                            </div>
                                        )}

                                        {!applianceId && (
                                            <div className="text-xs text-gray-500 pt-2 border-t">
                                                Appliance: {issue.appliance_name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
