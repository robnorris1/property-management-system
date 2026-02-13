import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { DashboardData } from '@/types';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const timeRange = url.searchParams.get('timeRange') as '3months' | '6months' | '12months' || '6months';

        // Calculate date range
        const now = new Date();
        const monthsBack = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

        // 1. Overview Statistics
        const overviewQuery = await pool.query(`
            WITH property_stats AS (
                SELECT COUNT(*) as total_properties
                FROM properties 
                WHERE user_id = $1
            ),
            appliance_stats AS (
                SELECT 
                    COUNT(*) as total_appliances,
                    COUNT(CASE WHEN status IN ('needs_repair', 'out_of_service') THEN 1 END) as broken_appliances
                FROM appliances a
                JOIN properties p ON a.property_id = p.id
                WHERE p.user_id = $1
            ),
            issue_stats AS (
                SELECT 
                    COUNT(*) as open_issues,
                    COUNT(CASE WHEN urgency = 'critical' THEN 1 END) as critical_issues
                FROM issues i
                JOIN appliances a ON i.appliance_id = a.id
                JOIN properties p ON a.property_id = p.id
                WHERE p.user_id = $1 AND i.status IN ('open', 'scheduled', 'in_progress')
            ),
            maintenance_stats AS (
                SELECT 
                    COUNT(*) as total_maintenance_records,
                    COALESCE(SUM(COALESCE(cost, 0)), 0) as total_maintenance_cost,
                    COUNT(CASE WHEN cost IS NOT NULL AND cost > 0 THEN 1 END) as paid_maintenance_count,
                    CASE 
                        WHEN COUNT(CASE WHEN cost IS NOT NULL AND cost > 0 THEN 1 END) > 0 
                        THEN SUM(CASE WHEN cost IS NOT NULL AND cost > 0 THEN cost ELSE 0 END) / COUNT(CASE WHEN cost IS NOT NULL AND cost > 0 THEN 1 END)
                        ELSE 0
                    END as average_cost_per_maintenance
                FROM maintenance_records mr
                JOIN appliances a ON mr.appliance_id = a.id
                JOIN properties p ON a.property_id = p.id
                WHERE p.user_id = $1 AND mr.maintenance_date >= $2
            ),
            overdue_stats AS (
                SELECT COUNT(*) as overdue_maintenance_count
                FROM maintenance_records mr
                JOIN appliances a ON mr.appliance_id = a.id
                JOIN properties p ON a.property_id = p.id
                WHERE p.user_id = $1 
                AND mr.next_due_date < CURRENT_DATE
                AND mr.next_due_date IS NOT NULL
            ),
            upcoming_stats AS (
                SELECT COUNT(*) as upcoming_maintenance_count
                FROM maintenance_records mr
                JOIN appliances a ON mr.appliance_id = a.id
                JOIN properties p ON a.property_id = p.id
                WHERE p.user_id = $1 
                AND mr.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                AND mr.next_due_date IS NOT NULL
            )
            SELECT 
                ps.total_properties,
                aps.total_appliances,
                aps.broken_appliances,
                iss.open_issues,
                iss.critical_issues,
                ms.total_maintenance_records,
                ms.total_maintenance_cost,
                ms.average_cost_per_maintenance,
                os.overdue_maintenance_count,
                us.upcoming_maintenance_count,
                (aps.broken_appliances + iss.open_issues + os.overdue_maintenance_count) as items_needing_attention
            FROM property_stats ps, appliance_stats aps, issue_stats iss, maintenance_stats ms, overdue_stats os, upcoming_stats us
        `, [session.user.id, startDate]);

        // 2. Recent Maintenance
        const recentMaintenanceQuery = await pool.query(`
            SELECT 
                mr.id,
                a.name as appliance_name,
                p.address as property_address,
                mr.maintenance_type,
                COALESCE(mr.cost, 0) as cost,
                mr.maintenance_date,
                mr.status
            FROM maintenance_records mr
            JOIN appliances a ON mr.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
            WHERE p.user_id = $1
            ORDER BY mr.maintenance_date DESC, mr.created_at DESC
            LIMIT 10
        `, [session.user.id]);

        // 3. Most Expensive Appliances
        const expensiveAppliancesQuery = await pool.query(`
            SELECT 
                a.name as appliance_name,
                p.address as property_address,
                COALESCE(SUM(CASE WHEN mr.cost IS NOT NULL THEN mr.cost ELSE 0 END), 0) as total_maintenance_cost,
                COUNT(CASE WHEN mr.cost IS NOT NULL AND mr.cost > 0 THEN 1 END) as paid_maintenance_count,
                COUNT(mr.id) as total_maintenance_count
            FROM appliances a
            JOIN properties p ON a.property_id = p.id
            LEFT JOIN maintenance_records mr ON a.id = mr.appliance_id AND mr.maintenance_date >= $2
            WHERE p.user_id = $1
            GROUP BY a.id, a.name, p.address
            HAVING COUNT(CASE WHEN mr.cost IS NOT NULL AND mr.cost > 0 THEN 1 END) > 0
            ORDER BY total_maintenance_cost DESC
            LIMIT 10
        `, [session.user.id, startDate]);

        // 4. Properties Needing Attention
        const propertiesNeedingAttentionQuery = await pool.query(`
            WITH property_issues AS (
                SELECT 
                    p.id,
                    p.address,
                    COUNT(DISTINCT i.id) as open_issues_count,
                    COUNT(DISTINCT CASE WHEN i.urgency = 'critical' THEN i.id END) as critical_issues_count,
                    COUNT(DISTINCT CASE WHEN mr.next_due_date < CURRENT_DATE THEN mr.id END) as overdue_maintenance_count
                FROM properties p
                LEFT JOIN appliances a ON a.property_id = p.id
                LEFT JOIN issues i ON i.appliance_id = a.id AND i.status IN ('open', 'scheduled', 'in_progress')
                LEFT JOIN maintenance_records mr ON mr.appliance_id = a.id AND mr.next_due_date < CURRENT_DATE
                WHERE p.user_id = $1
                GROUP BY p.id, p.address
                HAVING (COUNT(DISTINCT i.id) > 0 OR COUNT(DISTINCT CASE WHEN mr.next_due_date < CURRENT_DATE THEN mr.id END) > 0)
            )
            SELECT 
                address as property_address,
                open_issues_count,
                critical_issues_count,
                overdue_maintenance_count,
                (open_issues_count + overdue_maintenance_count) as total_issues
            FROM property_issues
            ORDER BY critical_issues_count DESC, total_issues DESC
            LIMIT 5
        `, [session.user.id]);

        // 5. Monthly Spending
        const monthlySpendingQuery = await pool.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', mr.maintenance_date), 'Mon YYYY') as month,
                COALESCE(SUM(CASE WHEN mr.cost IS NOT NULL THEN mr.cost ELSE 0 END), 0) as total_cost,
                COUNT(CASE WHEN mr.cost IS NOT NULL AND mr.cost > 0 THEN 1 END) as paid_maintenance_count,
                COUNT(mr.id) as total_maintenance_count
            FROM maintenance_records mr
            JOIN appliances a ON mr.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
            WHERE p.user_id = $1 
            AND mr.maintenance_date >= $2
            GROUP BY DATE_TRUNC('month', mr.maintenance_date)
            ORDER BY DATE_TRUNC('month', mr.maintenance_date) DESC
            LIMIT 6
        `, [session.user.id, startDate]);

        // Convert numeric values to ensure proper formatting
        const overview = overviewQuery.rows[0] || {
            total_properties: 0,
            total_appliances: 0,
            broken_appliances: 0,
            open_issues: 0,
            critical_issues: 0,
            total_maintenance_records: 0,
            total_maintenance_cost: 0,
            average_cost_per_maintenance: 0,
            overdue_maintenance_count: 0,
            upcoming_maintenance_count: 0,
            items_needing_attention: 0
        };

        // Ensure numbers are properly formatted
        const response = {
            overview: {
                total_properties: parseInt(overview.total_properties) || 0,
                total_appliances: parseInt(overview.total_appliances) || 0,
                broken_appliances: parseInt(overview.broken_appliances) || 0,
                open_issues: parseInt(overview.open_issues) || 0,
                critical_issues: parseInt(overview.critical_issues) || 0,
                total_maintenance_records: parseInt(overview.total_maintenance_records) || 0,
                total_maintenance_cost: parseFloat(overview.total_maintenance_cost) || 0,
                average_cost_per_maintenance: parseFloat(overview.average_cost_per_maintenance) || 0,
                overdue_maintenance_count: parseInt(overview.overdue_maintenance_count) || 0,
                upcoming_maintenance_count: parseInt(overview.upcoming_maintenance_count) || 0,
                items_needing_attention: parseInt(overview.items_needing_attention) || 0
            },
            recent_maintenance: recentMaintenanceQuery.rows.map(row => ({
                ...row,
                cost: parseFloat(row.cost) || 0
            })),
            expensive_appliances: expensiveAppliancesQuery.rows.map(row => ({
                appliance_name: row.appliance_name,
                property_address: row.property_address,
                total_maintenance_cost: parseFloat(row.total_maintenance_cost) || 0,
                maintenance_count: parseInt(row.paid_maintenance_count) || 0
            })),
            properties_needing_attention: propertiesNeedingAttentionQuery.rows.map(row => ({
                property_address: row.property_address,
                open_issues_count: parseInt(row.open_issues_count) || 0,
                critical_issues_count: parseInt(row.critical_issues_count) || 0,
                overdue_maintenance_count: parseInt(row.overdue_maintenance_count) || 0,
                total_issues: parseInt(row.total_issues) || 0
            })),
            monthly_spending: monthlySpendingQuery.rows.reverse().map(row => ({
                month: row.month,
                total_cost: parseFloat(row.total_cost) || 0,
                maintenance_count: parseInt(row.paid_maintenance_count) || 0
            }))
        };

        return Response.json(response as DashboardData);

    } catch (error) {
        console.error('Dashboard API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return Response.json(
            { error: 'Failed to fetch dashboard data', details: errorMessage },
            { status: 500 }
        );
    }
}
