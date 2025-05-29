'use client';

import { Plus } from 'lucide-react';

interface AddPropertyButtonProps {
    variant?: 'default' | 'primary';
}

export default function AddPropertyButton({ variant = 'default' }: AddPropertyButtonProps) {
    const handleClick = () => {
        // Dispatch custom event to trigger modal
        window.dispatchEvent(new CustomEvent('openAddPropertyModal'));
    };

    if (variant === 'primary') {
        return (
            <button
                onClick={handleClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Add First Property
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            Add Property
        </button>
    );
}
