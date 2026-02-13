export interface Property {
    id: number;
    address: string;
    property_type: string | null;
    created_at: string;
    appliance_count?: string; // From JOIN query, comes as string
}

export interface Appliance {
    id: number;
    property_id: number;
    name: string;
    type: string | null;
    installation_date: string | null;
    last_maintenance: string | null;
    status: string;
    created_at: string;
    total_maintenance_cost?: number;
    last_maintenance_cost?: number;
    maintenance_count?: number;
}

export interface MaintenanceRecord {
    id: number;
    appliance_id: number;
    maintenance_type: 'routine' | 'repair' | 'inspection' | 'replacement' | 'cleaning' | 'upgrade';
    description: string;
    cost: number | null;
    technician_name: string | null;
    technician_company: string | null;
    maintenance_date: string;
    next_due_date: string | null;
    notes: string | null;
    parts_replaced: string[] | null;
    warranty_until: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    appliance_name?: string;
    property_address?: string;
}

export interface PropertyWithAppliances {
    property: Property;
    appliances: Appliance[];
}

export interface ApplianceWithMaintenance {
    appliance: Appliance;
    maintenance_records: MaintenanceRecord[];
    maintenance_summary: {
        total_records: number;
        total_cost: number;
        average_cost: number;
        last_maintenance_date: string | null;
        next_due_date: string | null;
        overdue_count: number;
    };
}

// New summary interfaces for dashboard analytics
export interface MaintenanceSummary {
    total_properties: number;
    total_appliances: number;
    total_maintenance_records: number;
    total_maintenance_cost: number;
    average_cost_per_maintenance: number;
    overdue_maintenance_count: number;
    upcoming_maintenance_count: number; // Next 30 days
}

export interface ApplianceMaintenanceStats {
    appliance_id: number;
    appliance_name: string;
    property_address: string;
    total_maintenance_cost: number;
    maintenance_count: number;
    average_cost: number;
    last_maintenance: string | null;
    next_due: string | null;
    days_overdue: number | null;
    status: string;
}

// Form interfaces for modals
export interface AddMaintenanceFormData {
    maintenance_type: string;
    description: string;
    cost: string;
    technician_name: string;
    technician_company: string;
    maintenance_date: string;
    next_due_date: string;
    notes: string;
    parts_replaced: string[];
    warranty_until: string;
    status: string;
}

export interface EditMaintenanceFormData extends AddMaintenanceFormData {
    id: number;
}

export interface Issue {
    id: number;
    appliance_id: number;
    title: string;
    description: string;
    urgency: string;
    status: string;
    reported_date: string;
    scheduled_date: string | null;
    resolved_date: string | null;
    resolution_notes: string | null;
    appliance_name: string;
    property_address: string;
    reported_by_name: string | null;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
}

export interface DashboardData {
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
    recent_maintenance: MaintenanceRecord[];
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
