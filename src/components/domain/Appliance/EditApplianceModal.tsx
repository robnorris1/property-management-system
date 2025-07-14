import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { ApplianceForm } from '@/components/forms';
import { CheckCircle, Delete } from '@mui/icons-material';
import { Box, Typography, Alert } from '@mui/material';
import { Appliance } from '@/types';

interface EditApplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appliance: Appliance | null;
}

interface ApplianceFormData {
    name: string;
    type: string;
    installation_date: string;
    last_maintenance: string;
    status: string;
}

export const EditApplianceModal: React.FC<EditApplianceModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          onSuccess,
                                                                          appliance
                                                                      }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const getInitialValues = (): Partial<ApplianceFormData> => {
        if (!appliance) return {};

        return {
            name: appliance.name || '',
            type: appliance.type || '',
            installation_date: formatDateForInput(appliance.installation_date),
            last_maintenance: formatDateForInput(appliance.last_maintenance),
            status: appliance.status || 'working'
        };
    };

    const handleSubmit = async (data: ApplianceFormData) => {
        if (!appliance) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/appliances/${appliance.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name.trim(),
                    type: data.type || null,
                    installation_date: data.installation_date || null,
                    last_maintenance: data.last_maintenance || null,
                    status: data.status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update appliance');
            }

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Failed to update appliance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!appliance) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/appliances/${appliance.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete appliance');
            }

            setShowDeleteConfirm(false);
            onSuccess();
            onClose();

        } catch (error) {
            console.error('Failed to delete appliance:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (isLoading || isDeleting) return;
        setShowSuccess(false);
        setShowDeleteConfirm(false);
        onClose();
    };

    if (showDeleteConfirm) {
        return (
            <Modal
                open={isOpen}
                onClose={handleClose}
                title="Delete Appliance"
                subtitle={`Are you sure you want to delete "${appliance?.name}"?`}
            >
                <Alert severity="warning" sx={{ mb: 3 }}>
                    This action cannot be undone. All maintenance records for this appliance will also be deleted.
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        loading={isDeleting}
                        loadingText="Deleting..."
                    >
                        Delete Appliance
                    </Button>
                </Box>
            </Modal>
        );
    }

    if (showSuccess) {
        return (
            <Modal open={isOpen} onClose={handleClose} title="Success!">
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Appliance Updated!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your appliance has been successfully updated.
                    </Typography>
                </Box>
            </Modal>
        );
    }

    if (!appliance) return null;

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Edit Appliance"
            subtitle={`Update details for ${appliance.name}`}
        >
            <Box sx={{ mb: 3 }}>
                <ApplianceForm
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    loading={isLoading}
                    initialValues={getInitialValues()}
                />
            </Box>

            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    fullWidth
                >
                    Delete Appliance
                </Button>
            </Box>
        </Modal>
    );
};
