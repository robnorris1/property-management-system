import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    size?: number;
}

export function LoadingSpinner({ message = 'Loading...', size = 40 }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className={`animate-spin text-blue-600`} size={size} />
            {message && (
                <p className="text-sm text-gray-600">
                    {message}
                </p>
            )}
        </div>
    );
}