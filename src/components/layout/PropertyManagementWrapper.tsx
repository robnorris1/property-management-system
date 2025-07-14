'use client';

import React, { useState, useEffect } from 'react';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { AddPropertyModal } from '@/components/domain';

interface PropertyManagementWrapperProps {
    children: React.ReactNode;
}

export const PropertyManagementWrapper: React.FC<PropertyManagementWrapperProps> = ({ children }) => {
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
        window.location.reload();
    };

    return (
        <>
            {children}

            <AddPropertyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />

            <Fab
                color="primary"
                onClick={() => setIsModalOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000
                }}
            >
                <Add />
            </Fab>
        </>
    );
};
