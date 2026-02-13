import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon = <Inbox className="w-12 h-12 text-gray-400" />
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-600 mb-6 max-w-sm">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}