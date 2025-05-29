'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AddPropertyModal from '@/components/AddPropertyModal';

interface PropertyManagementWrapperProps {
    children: React.ReactNode;
}

export default function PropertyManagementWrapper({ children }: PropertyManagementWrapperProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleOpenModal = () => {
            setIsModalOpen(true);
        };

        window.addEventListener('openAddPropertyModal', handleOpenModal);

        return () => {
            window.removeEventListener('openAddPropertyModal', handleOpenModal);
        };
    }, []);

    const handleModalSuccess = () => {
        // Refresh the page to show the new property
        window.location.reload();
    };

    return (
        <>
            {children}

            {/* Add Property Modal */}
            <AddPropertyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />

            {/* Floating Add Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
                title="Add Property"
            >
                <Plus className="w-6 h-6" />
            </button>
        </>
    );
}
