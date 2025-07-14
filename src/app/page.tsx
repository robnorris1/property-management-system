'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Container,
    Grid,
    Box,
    Typography,
    Tabs,
    Tab
} from '@mui/material';
import {
    Business,
    Build,
    PoundSterling,
    ReportProblem,
    Activity,
    BarChart3,
    Calendar,
    CheckCircle,
    ArrowForward
} from '@mui/icons-material';
import { Property } from '@/types';
import { Header, PropertyManagementWrapper } from '@/components/layout';
import { AddPropertyButton } from '@/components/ui/AddPropertyButton/AddPropertyButton';
import { StatCard } from '@/components/ui/StatCard/StatCard';
import { Card, EmptyState, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { AuthWrapper } from '@/components/AuthWrapper';
import { useSession } from 'next-auth/react';

interface DashboardData {
    overview: {
        total_properties: number;
        total_appliances: number;
        total_maintenance_records: number;
        total_maintenance_cost: number;
        average_cost_per_maintenance: number;
        overdue_maintenance_count: number;
        upcoming_maintenance_count: number;
        items_needing_attention: number;
    };
    recent_maintenance: Array<{
        id: number;
        appliance_name: string;
        property_address: string;
        maintenance_type: string;
        cost: number;
        maintenance_date: string;
        status: string;
    }>;
    expensive_appliances: Array<{
        appliance_name: string;
        property_address: string;
        total_maintenance_cost: number;
        maintenance_count: number;
    }>;
    properties_needing_attention: Array<{
        property_address: string;
        open_issues_count: number;
        critical_issues_count: number;
        overdue_maintenance_count: number;
        total_issues: number;
    }>;
    monthly_spending: Array<{
        month: string;
        total_cost: number;
        maintenance_count: number;
    }>;
}

export default function Home() {
    const { data: session } = useSession();
    const [properties, setProperties] = useState<Property[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'properties'>('dashboard');

    useEffect(() => {
        if (session) {
            fetchProperties();
            fetchDashboardData();
        }
    }, [session]);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/properties', {
                cache: 'no-store'
            });

            if (!res.ok) {
                throw new Error('Failed to fetch properties');
            }

            const data = await res.json();
            setProperties(data);
        } catch (err) {
            setError('Failed to load properties');
            console.error('Error fetching properties:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setIsDashboardLoading(true);
            const response = await fetch('/api/dashboard?timeRange=6months');

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsDashboardLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'dashboard' | 'properties') => {
        setActiveTab(newValue);
    };

    if (isLoading) {
        return (
            <AuthWrapper>
                <LoadingSpinner message="Loading your properties..." />
            </AuthWrapper>
        );
    }

    if (error) {
        return (
            <AuthWrapper>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <ErrorMessage
                        message={error}
                        onRetry={fetchProperties}
                    />
                </Container>
            </AuthWrapper>
        );
    }

    return (
        <AuthWrapper>
            <PropertyManagementWrapper>
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                    <Header
                        actions={<AddPropertyButton />}
                    />

                    <Container maxWidth="xl" sx={{ py: 3 }}>
                        {/* Tab Navigation */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                <Tab
                                    label="Dashboard"
                                    value="dashboard"
                                    icon={<BarChart3 />}
                                    iconPosition="start"
                                />
                                <Tab
                                    label={`Properties (${properties.length})`}
                                    value="properties"
                                    icon={<Business />}
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Box>

                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <Box>
                                {dashboardData && !isDashboardLoading ? (
                                    <Grid container spacing={3}>
                                        {/* Overview Cards */}
                                        <Grid item xs={12}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <StatCard
                                                        title="Total Properties"
                                                        value={dashboardData.overview.total_properties}
                                                        icon={Business}
                                                        color="primary"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <StatCard
                                                        title="Total Appliances"
                                                        value={dashboardData.overview.total_appliances}
                                                        icon={Build}
                                                        color="secondary"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <StatCard
                                                        title="Total Maintenance Cost"
                                                        value={formatCurrency(dashboardData.overview.total_maintenance_cost)}
                                                        icon={PoundSterling}
                                                        color="success"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <StatCard
                                                        title="Items Needing Attention"
                                                        value={dashboardData.overview.items_needing_attention}
                                                        icon={ReportProblem}
                                                        color="warning"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Secondary Stats */}
                                        <Grid item xs={12}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={4}>
                                                    <StatCard
                                                        title="Total Services"
                                                        value={dashboardData.overview.total_maintenance_records}
                                                        icon={Activity}
                                                        subtitle="Maintenance records"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <StatCard
                                                        title="Average Service Cost"
                                                        value={formatCurrency(dashboardData.overview.average_cost_per_maintenance)}
                                                        icon={BarChart3}
                                                        subtitle="Per maintenance"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <StatCard
                                                        title="Upcoming Maintenance"
                                                        value={dashboardData.overview.upcoming_maintenance_count}
                                                        icon={Calendar}
                                                        color="primary"
                                                        subtitle="Next 30 days"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Recent Maintenance & Properties Needing Attention */}
                                        <Grid item xs={12}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} lg={6}>
                                                    <Card title="Recent Maintenance">
                                                        {dashboardData.recent_maintenance.length === 0 ? (
                                                            <EmptyState
                                                                icon={Build}
                                                                title="No recent maintenance"
                                                                description="Maintenance records will appear here"
                                                            />
                                                        ) : (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                {dashboardData.recent_maintenance.slice(0, 5).map((record) => (
                                                                    <Box
                                                                        key={record.id}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            p: 2,
                                                                            bgcolor: 'background.paper',
                                                                            borderRadius: 1,
                                                                            border: 1,
                                                                            borderColor: 'divider'
                                                                        }}
                                                                    >
                                                                        <Box>
                                                                            <Typography variant="body2" fontWeight={500}>
                                                                                {record.appliance_name}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {record.property_address}
                                                                            </Typography>
                                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                                {formatDate(record.maintenance_date)}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {formatCurrency(record.cost)}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Card>
                                                </Grid>

                                                <Grid item xs={12} lg={6}>
                                                    <Card title="Properties Needing Attention">
                                                        {dashboardData.properties_needing_attention.length === 0 ? (
                                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                                                <Typography variant="h6" color="success.main" gutterBottom>
                                                                    All properties up to date!
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    No overdue maintenance items
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                {dashboardData.properties_needing_attention.map((property, index) => (
                                                                    <Box
                                                                        key={index}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            p: 2,
                                                                            bgcolor: 'error.50',
                                                                            borderRadius: 1,
                                                                            border: 1,
                                                                            borderColor: 'error.200'
                                                                        }}
                                                                    >
                                                                        <Box>
                                                                            <Typography variant="body2" fontWeight={500}>
                                                                                {property.property_address}
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                                                {property.critical_issues_count > 0 && (
                                                                                    <Typography variant="caption" color="error.main">
                                                                                        {property.critical_issues_count} critical issue{property.critical_issues_count !== 1 ? 's' : ''}
                                                                                    </Typography>
                                                                                )}
                                                                                {property.open_issues_count > 0 && (
                                                                                    <Typography variant="caption" color="warning.main">
                                                                                        {property.open_issues_count} open issue{property.open_issues_count !== 1 ? 's' : ''}
                                                                                    </Typography>
                                                                                )}
                                                                                {property.overdue_maintenance_count > 0 && (
                                                                                    <Typography variant="caption" color="warning.main">
                                                                                        {property.overdue_maintenance_count} overdue
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                        <Typography variant="h6" color="error.main">
                                                                            {property.total_issues}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Highest Maintenance Costs */}
                                        {dashboardData.expensive_appliances.length > 0 && (
                                            <Grid item xs={12}>
                                                <Card title="Highest Maintenance Costs">
                                                    <Grid container spacing={2}>
                                                        {dashboardData.expensive_appliances.slice(0, 6).map((appliance, index) => (
                                                            <Grid item xs={12} md={6} lg={4} key={index}>
                                                                <Box
                                                                    sx={{
                                                                        p: 2,
                                                                        bgcolor: 'background.paper',
                                                                        borderRadius: 1,
                                                                        border: 1,
                                                                        borderColor: 'divider'
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                        <Typography variant="body2" fontWeight={500} noWrap>
                                                                            {appliance.appliance_name}
                                                                        </Typography>
                                                                        <Typography variant="body2" fontWeight={600} color="error.main">
                                                                            {formatCurrency(appliance.total_maintenance_cost)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                                        {appliance.property_address}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {appliance.maintenance_count} services
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Card>
                                            </Grid>
                                        )}
                                    </Grid>
                                ) : (
                                    <Grid container spacing={3}>
                                        {[1, 2, 3, 4].map(i => (
                                            <Grid item xs={12} sm={6} md={3} key={i}>
                                                <LoadingSpinner />
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        )}

                        {/* Properties Tab */}
                        {activeTab === 'properties' && (
                            <Box>
                                {properties.length === 0 ? (
                                    <EmptyState
                                        icon={Business}
                                        title="No properties yet"
                                        description="Add your first property to start managing appliances and maintenance."
                                        action={{
                                            label: "Add First Property",
                                            onClick: () => window.dispatchEvent(new CustomEvent('openAddPropertyModal'))
                                        }}
                                    />
                                ) : (
                                    <>
                                        <Grid container spacing={3}>
                                            {properties.map((property: Property) => (
                                                <Grid item xs={12} md={6} lg={4} key={property.id}>
                                                    <Card
                                                        sx={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            transition: 'all 0.2s ease-in-out',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: (theme) => theme.shadows[8],
                                                            },
                                                            cursor: 'pointer'
                                                        }}
                                                        component={Link}
                                                        href={`/property/${property.id}`}
                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="h6" gutterBottom>
                                                                        {property.address}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                                        {property.property_type || 'Type not specified'}
                                                                    </Typography>
                                                                </Box>
                                                                <ArrowForward sx={{ color: 'text.secondary' }} />
                                                            </Box>

                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Build sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {property.appliance_count || '0'} appliance{property.appliance_count !== '1' ? 's' : ''}
                                                                    </Typography>
                                                                </Box>

                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Added {formatDate(property.created_at)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>

                                                        <Box sx={{ pt: 2, mt: 2, borderTop: 1, borderColor: 'divider' }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Click to view details
                                                            </Typography>
                                                            {property.appliance_count && parseInt(property.appliance_count) > 0 && (
                                                                <Typography variant="caption" color="primary.main" sx={{ ml: 2 }}>
                                                                    View appliances →
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        {/* Properties Summary */}
                                        <Grid container spacing={3} sx={{ mt: 2 }}>
                                            <Grid item xs={12}>
                                                <Card title="Properties Summary">
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={6} md={3}>
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="h4" color="primary.main" fontWeight={700}>
                                                                    {properties.length}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Properties
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6} md={3}>
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="h4" color="secondary.main" fontWeight={700}>
                                                                    {properties.reduce((sum, p) => sum + parseInt(p.appliance_count || '0'), 0)}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Total Appliances
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6} md={3}>
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="h4" color="warning.main" fontWeight={700}>
                                                                    {properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + parseInt(p.appliance_count || '0'), 0) / properties.length) : 0}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Avg per Property
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6} md={3}>
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="h4" color="success.main" fontWeight={700}>
                                                                    {properties.filter(p => parseInt(p.appliance_count || '0') > 0).length}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Active Properties
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            </Box>
                        )}
                    </Container>
                </Box>
            </PropertyManagementWrapper>
        </AuthWrapper>
    );
}
