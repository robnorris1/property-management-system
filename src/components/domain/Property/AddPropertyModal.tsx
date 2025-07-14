import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { PropertyForm } from '@/components/forms';
import { CheckCircle } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface PropertyFormData {
    address: string;
    property_type: string;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onSuccess
                                                                  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (data: PropertyFormData) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: data.address.trim(),
                    property_type: data.property_type || null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add property');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Failed to add property:', error);
            // You could add error handling here
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setShowSuccess(false);
        onClose();
    };

    if (showSuccess) {
        return (
            <Modal open={isOpen} onClose={handleClose} title="Success!">
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Property Added!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your new property has been successfully added to the system.
                    </Typography>
                </Box>
            </Modal>
        );
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Add New Property"
            subtitle="Add a property to start managing appliances and maintenance"
        >
            <PropertyForm
                onSubmit={handleSubmit}
                onCancel={handleClose}
                loading={isLoading}
            />
        </Modal>
    );
};
