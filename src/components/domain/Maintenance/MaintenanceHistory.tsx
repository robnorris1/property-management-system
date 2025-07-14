// src/components/domain/Maintenance/MaintenanceHistory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Chip,
    IconButton,
    Divider
} from '@mui/material';
import {
    ExpandMore,
    Calendar,
    Person,
    Build,
    Edit,
    Delete,
    Award,
    AttachMoney
} from '@mui/icons-material';
import { Card, LoadingSpinner, ErrorMessage, EmptyState, StatusChip } from '@/components/ui';

interface MaintenanceRecord {
    id: number;
    appliance_id: number;
    maintenance_type: string;
    description: string;
    cost: number | null;
    technician_name: string | null;
    technician_company: string | null;
    maintenance_date: string;
    next_due_date: string | null;
    notes: string | null;
    parts_replaced: string[] | null;
    warranty_until: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    appliance_name: string;
    property_address: string;
}

interface MaintenanceHistoryProps {
    applianceId: number;
    onEdit?: (record: MaintenanceRecord) => void;
    showApplianceInfo?: boolean;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({
                                                                          applianceId,
                                                                          onEdit,
                                                                          showApplianceInfo = false
                                                                      }) => {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMaintenanceHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/maintenance?appliance_id=${applianceId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch maintenance history');
            }

            const data = await response.json();
            setRecords(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load maintenance history');
        } finally {
            setIsLoading(false);
        }
    }, [applianceId]);

    useEffect(() => {
        fetchMaintenanceHistory();
    }, [fetchMaintenanceHistory]);

    const handleDelete = async (recordId: number) => {
        if (!confirm('Are you sure you want to delete this maintenance record?')) {
            return;
        }

        try {
            const response = await fetch(`/api/maintenance/${recordId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete maintenance record');
            }

            fetchMaintenanceHistory();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete record');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number | null | undefined) => {
        if (!amount) return '£0';
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const totalCost = records.reduce((sum, record) => sum + (record.cost || 0), 0);
    const averageCost = records.length > 0 ? totalCost / records.filter(r => r.cost).length : 0;

    if (isLoading) {
        return <LoadingSpinner message="Loading maintenance history..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchMaintenanceHistory} />;
    }

    return (
        <Card title="Maintenance History" subtitle={`${records.length} record${records.length !== 1 ? 's' : ''}`}>
            {/* Summary Stats */}
            {records.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                                {formatCurrency(totalCost)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Spent
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary.main" fontWeight={600}>
                                {formatCurrency(averageCost)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Average Cost
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="secondary.main" fontWeight={600}>
                                {records.filter(r => r.status === 'completed').length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Completed
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Records List */}
            {records.length === 0 ? (
                <EmptyState
                    icon={Build}
                    title="No maintenance records"
                    description="Maintenance history will appear here once you start logging service records."
                />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {records.map((record) => {
                        const hasWarranty = record.warranty_until && new Date(record.warranty_until) > new Date();

                        return (
                            <Accordion key={record.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 2 }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <StatusChip status={record.maintenance_type as any} />
                                                <StatusChip status={record.status as any} />
                                                {hasWarranty && (
                                                    <Chip
                                                        label="Under Warranty"
                                                        size="small"
                                                        icon={<Award />}
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="body2" fontWeight={500}>
                                                {record.description}
                                            </Typography>

                                            {showApplianceInfo && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {record.appliance_name} • {record.property_address}
                                                </Typography>
                                            )}

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption">
                                                        {formatDate(record.maintenance_date)}
                                                    </Typography>
                                                </Box>

                                                {record.cost && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AttachMoney sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" fontWeight={500}>
                                                            {formatCurrency(record.cost)}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {record.technician_name && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Person sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption">
                                                            {record.technician_name}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {onEdit && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(record);
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(record.id);
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        {record.technician_company && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Company:</strong> {record.technician_company}
                                                </Typography>
                                            </Grid>
                                        )}

                                        {record.parts_replaced && record.parts_replaced.length > 0 && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <strong>Parts Replaced:</strong>
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {record.parts_replaced.map((part, index) => (
                                                        <Chip key={index} label={part} size="small" variant="outlined" />
                                                    ))}
                                                </Box>
                                            </Grid>
                                        )}

                                        {record.next_due_date && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Next Due:</strong> {formatDate(record.next_due_date)}
                                                </Typography>
                                            </Grid>
                                        )}

                                        {record.warranty_until && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Warranty Until:</strong> {formatDate(record.warranty_until)}
                                                </Typography>
                                            </Grid>
                                        )}

                                        {record.notes && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Notes:</strong>
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {record.notes}
                                                </Typography>
                                            </Grid>
                                        )}

                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Record created {formatDate(record.created_at)}
                                                {record.updated_at !== record.created_at && (
                                                    <span> • Last updated {formatDate(record.updated_at)}</span>
                                                )}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            )}
        </Card>
    );
};
