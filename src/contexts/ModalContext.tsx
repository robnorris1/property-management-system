'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
    isAddPropertyModalOpen: boolean;
    openAddPropertyModal: () => void;
    closeAddPropertyModal: () => void;
    onPropertyAdded: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);

    const openAddPropertyModal = () => setIsAddPropertyModalOpen(true);
    const closeAddPropertyModal = () => setIsAddPropertyModalOpen(false);
    
    const onPropertyAdded = () => {
        closeAddPropertyModal();
        // Trigger a refresh of property data - will be handled by property context later
        window.location.reload();
    };

    return (
        <ModalContext.Provider value={{
            isAddPropertyModalOpen,
            openAddPropertyModal,
            closeAddPropertyModal,
            onPropertyAdded
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}