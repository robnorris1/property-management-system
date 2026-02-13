import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ErrorMessageProps {
    title?: string;
    message: string;
    severity?: 'error' | 'warning' | 'info' | 'success';
    onRetry?: () => void;
}

export function ErrorMessage({ 
    title, 
    message, 
    severity = 'error',
    onRetry 
}: ErrorMessageProps) {
    const severityConfig = {
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-800'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800'
        },
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            textColor: 'text-green-800'
        }
    };

    const config = severityConfig[severity];
    const IconComponent = config.icon;

    return (
        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    {title && (
                        <h3 className={`font-semibold ${config.textColor} mb-1`}>
                            {title}
                        </h3>
                    )}
                    <p className={`text-sm ${config.textColor}`}>
                        {message}
                    </p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className={`text-sm font-medium ${config.textColor} hover:underline`}
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}