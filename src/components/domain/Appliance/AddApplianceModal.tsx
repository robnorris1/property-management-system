import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { ApplianceForm } from '@/components/forms';
import { CheckCircle } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

interface AddApplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    propertyId: number;
}

interface ApplianceFormData {
    name: string;
    type: string;
    installation_date: string;
    last_maintenance: string;
    status: string;
}

export const AddApplianceModal: React.FC<AddApplianceModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onSuccess,
                                                                        propertyId
                                                                    }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (data: ApplianceFormData) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/appliances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    name: data.name.trim(),
                    type: data.type || null,
                    installation_date: data.installation_date || null,
                    last_maintenance: data.last_maintenance || null,
                    status: data.status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add appliance');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Failed to add appliance:', error);
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
                        Appliance Added!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your new appliance has been successfully added to the property.
                    </Typography>
                </Box>
            </Modal>
        );
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Add New Appliance"
            subtitle="Add an appliance to track its maintenance and status"
        >
            <ApplianceForm
                onSubmit={handleSubmit}
                onCancel={handleClose}
                loading={isLoading}
            />
        </Modal>
    );
};
