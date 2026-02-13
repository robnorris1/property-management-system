'use client';

import { Plus } from 'lucide-react';
import AddPropertyModal from '@/components/features/properties/AddPropertyModal';
import { useModal } from '@/contexts/ModalContext';

interface PropertyManagementWrapperProps {
    children: React.ReactNode;
}

export default function PropertyManagementWrapper({ children }: PropertyManagementWrapperProps) {
    const { isAddPropertyModalOpen, openAddPropertyModal, closeAddPropertyModal, onPropertyAdded } = useModal();

    return (
        <>
            {children}

            {/* Add Property Modal */}
            <AddPropertyModal
                isOpen={isAddPropertyModalOpen}
                onClose={closeAddPropertyModal}
                onSuccess={onPropertyAdded}
            />

            {/* Floating Add Button */}
            <button
                onClick={openAddPropertyModal}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
                title="Add Property"
            >
                <Plus className="w-6 h-6" />
            </button>
        </>
    );
}
