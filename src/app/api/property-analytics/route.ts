import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/property-analytics
 * 
 * Fetches comprehensive property performance analytics including:
 * - Rent collection data
 * - Maintenance costs
 * - Performance metrics and ratios
 * - Property categorization
 * 
 * @returns PropertyAnalytics[] - Array of property analytics data
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentYear = new Date().getFullYear();

        const result = await pool.query(`
            WITH property_financials AS (
                SELECT 
                    p.id,
                    p.address,
                    p.monthly_rent,
                    
                    -- Rent collection data for current year
                    COALESCE(rent_data.total_collected_year, 0) as total_rent_collected,
                    COALESCE(rent_data.months_with_payments, 0) as months_with_payments,
                    COALESCE(rent_data.total_late_fees, 0) as total_late_fees,
                    COALESCE(rent_data.expected_yearly_rent, 0) as expected_yearly_rent,
                    rent_data.last_payment_date,
                    
                    -- Maintenance cost data for current year
                    COALESCE(maintenance_data.total_maintenance_cost, 0) as total_maintenance_cost,
                    COALESCE(maintenance_data.maintenance_count, 0) as maintenance_count,
                    COALESCE(maintenance_data.recent_maintenance_cost, 0) as recent_maintenance_cost,
                    
                    -- Performance calculations
                    CASE 
                        WHEN p.monthly_rent IS NULL OR p.monthly_rent = 0 THEN NULL
                        ELSE ROUND(
                            (COALESCE(maintenance_data.total_maintenance_cost, 0)::decimal / (p.monthly_rent * 12))::numeric, 
                            4
                        )
                    END as maintenance_to_rent_ratio,
                    
                    -- Net income calculation
                    COALESCE(rent_data.total_collected_year, 0) - COALESCE(maintenance_data.total_maintenance_cost, 0) as net_income,
                    
                    -- Occupancy rate calculation
                    CASE 
                        WHEN rent_data.expected_yearly_rent > 0 
                        THEN ROUND(
                            (rent_data.total_collected_year::decimal / rent_data.expected_yearly_rent * 100)::numeric, 
                            2
                        )
                        ELSE NULL
                    END as occupancy_rate
                    
                FROM properties p
                
                -- Rent data subquery
                LEFT JOIN (
                    SELECT 
                        property_id,
                        SUM(amount + COALESCE(late_fee_amount, 0)) as total_collected_year,
                        SUM(COALESCE(late_fee_amount, 0)) as total_late_fees,
                        COUNT(DISTINCT DATE_TRUNC('month', payment_date)) as months_with_payments,
                        MAX(payment_date) as last_payment_date,
                        MAX(p2.monthly_rent) * 12 as expected_yearly_rent
                    FROM rent_payments rp
                    JOIN properties p2 ON p2.id = rp.property_id
                    WHERE EXTRACT(YEAR FROM payment_date) = $2
                    GROUP BY property_id
                ) rent_data ON p.id = rent_data.property_id
                
                -- Maintenance data subquery
                LEFT JOIN (
                    SELECT 
                        p3.id as property_id,
                        SUM(COALESCE(mr.cost, 0)) as total_maintenance_cost,
                        COUNT(mr.id) as maintenance_count,
                        SUM(
                            CASE 
                                WHEN mr.maintenance_date >= CURRENT_DATE - INTERVAL '6 months' 
                                THEN COALESCE(mr.cost, 0) 
                                ELSE 0 
                            END
                        ) as recent_maintenance_cost
                    FROM properties p3
                    LEFT JOIN appliances a ON p3.id = a.property_id
                    LEFT JOIN maintenance_records mr ON a.id = mr.appliance_id 
                        AND mr.status = 'completed'
                        AND EXTRACT(YEAR FROM mr.maintenance_date) = $2
                    GROUP BY p3.id
                ) maintenance_data ON p.id = maintenance_data.property_id
                
                WHERE p.user_id = $1
            )
            
            SELECT 
                id as property_id,
                address as property_address,
                monthly_rent,
                total_rent_collected,
                total_late_fees,
                months_with_payments,
                expected_yearly_rent,
                last_payment_date,
                total_maintenance_cost,
                maintenance_count,
                recent_maintenance_cost,
                maintenance_to_rent_ratio,
                net_income,
                occupancy_rate,
                
                -- Maintenance category classification
                CASE 
                    WHEN maintenance_to_rent_ratio > 0.3 THEN 'high_maintenance'
                    WHEN maintenance_to_rent_ratio > 0.15 THEN 'medium_maintenance'
                    WHEN maintenance_to_rent_ratio IS NULL THEN 'no_data'
                    ELSE 'low_maintenance'
                END as maintenance_category,
                
                -- Performance rating classification
                CASE 
                    WHEN occupancy_rate >= 90 THEN 'excellent'
                    WHEN occupancy_rate >= 75 THEN 'good'
                    WHEN occupancy_rate >= 60 THEN 'fair'
                    WHEN occupancy_rate IS NULL THEN 'no_data'
                    ELSE 'poor'
                END as performance_rating,
                
                -- Payment status classification
                CASE 
                    WHEN last_payment_date IS NULL THEN 'no_payments'
                    WHEN last_payment_date < CURRENT_DATE - INTERVAL '45 days' THEN 'overdue'
                    WHEN last_payment_date < CURRENT_DATE - INTERVAL '30 days' THEN 'late'
                    ELSE 'current'
                END as payment_status
                
            FROM property_financials
            ORDER BY net_income DESC, total_rent_collected DESC
        `, [session.user.id, currentYear]);

        return Response.json(result.rows);
        
    } catch (error) {
        console.error('Property analytics API error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            userId: (await getServerSession(authOptions))?.user?.id
        });
        
        return Response.json(
            { error: 'Failed to fetch property analytics' }, 
            { status: 500 }
        );
    }
}