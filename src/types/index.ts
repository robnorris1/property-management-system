export interface Property {
    id: number;
    address: string;
    property_type: string | null;
    monthly_rent?: number | null;
    created_at: string;
    appliance_count?: number; // Now consistently returned as number from API
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

// Rent tracking interfaces
export interface RentPayment {
    id: number;
    property_id: number;
    amount: number;
    payment_date: string;
    due_date: string;
    payment_method: string | null;
    reference_number: string | null;
    notes: string | null;
    status: 'paid' | 'late' | 'partial';
    late_fee_amount: number;
    created_at: string;
    updated_at: string;
    property_address?: string;
}

export interface RentPaymentFormData {
    amount: string;
    payment_date: string;
    due_date: string;
    payment_method: string;
    reference_number: string;
    notes: string;
    status: string;
    late_fee_amount: string;
}

export interface PropertyRentStatus {
    property_id: number;
    property_address: string;
    monthly_rent: number | null;
    last_payment_date: string | null;
    last_payment_amount: number | null;
    total_collected_this_month: number;
    total_collected_this_year: number;
    days_since_last_payment: number | null;
    rent_status: 'current' | 'overdue' | 'not_set' | 'no_payments';
}

export interface PropertyAnalytics {
    property_id: number;
    property_address: string;
    monthly_rent: number | null;
    total_rent_collected: number;
    total_late_fees: number;
    months_with_payments: number;
    expected_yearly_rent: number;
    last_payment_date: string | null;
    total_maintenance_cost: number;
    maintenance_count: number;
    recent_maintenance_cost: number;
    maintenance_to_rent_ratio: number | null;
    net_income: number;
    occupancy_rate: number | null;
    maintenance_category: 'low_maintenance' | 'medium_maintenance' | 'high_maintenance' | 'no_data';
    performance_rating: 'excellent' | 'good' | 'fair' | 'poor' | 'no_data';
    payment_status: 'current' | 'late' | 'overdue' | 'no_payments';
}
