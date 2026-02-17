import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * GET /api/monthly-analytics
 * 
 * Fetches monthly property performance data including:
 * - Monthly rent collection
 * - Monthly maintenance costs
 * - Net income trends
 * - Collection rates
 * 
 * Query parameters:
 * - year: Year to fetch data for (defaults to current year)
 * - property_id: Optional property ID to filter by specific property
 * 
 * @returns MonthlyData[] - Array of monthly analytics data
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('property_id');
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

        // Validate year parameter
        if (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 1) {
            return Response.json({ error: 'Invalid year parameter' }, { status: 400 });
        }

        // Validate property_id parameter if provided
        if (propertyId && (isNaN(parseInt(propertyId)) || parseInt(propertyId) <= 0)) {
            return Response.json({ error: 'Invalid property_id parameter' }, { status: 400 });
        }

        let query = `
            WITH monthly_rent AS (
                SELECT 
                    p.id as property_id,
                    p.address as property_address,
                    p.monthly_rent as expected_monthly_rent,
                    EXTRACT(MONTH FROM rp.payment_date) as month,
                    EXTRACT(YEAR FROM rp.payment_date) as year,
                    COALESCE(SUM(rp.amount + COALESCE(rp.late_fee_amount, 0)), 0) as rent_collected,
                    COUNT(rp.id) as payments_count
                FROM properties p
                LEFT JOIN rent_payments rp ON p.id = rp.property_id 
                    AND EXTRACT(YEAR FROM rp.payment_date) = $2
                WHERE p.user_id = $1
                GROUP BY p.id, p.address, p.monthly_rent, EXTRACT(MONTH FROM rp.payment_date), EXTRACT(YEAR FROM rp.payment_date)
            ),
            monthly_maintenance AS (
                SELECT 
                    p.id as property_id,
                    EXTRACT(MONTH FROM mr.maintenance_date) as month,
                    EXTRACT(YEAR FROM mr.maintenance_date) as year,
                    COALESCE(SUM(mr.cost), 0) as maintenance_cost,
                    COUNT(mr.id) as maintenance_count
                FROM properties p
                LEFT JOIN appliances a ON p.id = a.property_id
                LEFT JOIN maintenance_records mr ON a.id = mr.appliance_id 
                    AND mr.status = 'completed'
                    AND EXTRACT(YEAR FROM mr.maintenance_date) = $2
                WHERE p.user_id = $1
                GROUP BY p.id, EXTRACT(MONTH FROM mr.maintenance_date), EXTRACT(YEAR FROM mr.maintenance_date)
            )
            
            SELECT 
                COALESCE(mr.property_id, mm.property_id) as property_id,
                mr.property_address,
                COALESCE(mr.month, mm.month) as month,
                COALESCE(mr.year, mm.year, $2) as year,
                COALESCE(mr.rent_collected, 0) as rent_collected,
                COALESCE(mm.maintenance_cost, 0) as maintenance_cost,
                COALESCE(mr.rent_collected, 0) - COALESCE(mm.maintenance_cost, 0) as net_income,
                COALESCE(mr.payments_count, 0) as payments_count,
                COALESCE(mm.maintenance_count, 0) as maintenance_count,
                COALESCE(mr.expected_monthly_rent, 0) as expected_rent
            FROM monthly_rent mr
            FULL OUTER JOIN monthly_maintenance mm ON mr.property_id = mm.property_id 
                AND mr.month = mm.month 
                AND mr.year = mm.year
            WHERE (mr.property_id IS NOT NULL OR mm.property_id IS NOT NULL)
        `;

        let params: (string | number)[] = [session.user.id, year];

        // Add property filter if specified
        if (propertyId) {
            query += ' AND COALESCE(mr.property_id, mm.property_id) = $3';
            params.push(parseInt(propertyId));
        }

        query += ' ORDER BY COALESCE(mr.year, mm.year, $2), COALESCE(mr.month, mm.month, 1)';

        const result = await pool.query(query, params);

        // Get unique properties from results
        const properties = [...new Set(result.rows.map(row => ({ 
            id: row.property_id, 
            address: row.property_address,
            expected_rent: row.expected_rent
        })).filter(p => p.id !== null))];

        // Fill in missing months with zero data for better visualization
        const completeData = [];
        
        for (const property of properties) {
            for (let month = 1; month <= 12; month++) {
                const existingData = result.rows.find(row => 
                    row.property_id === property.id && 
                    parseInt(row.month) === month &&
                    parseInt(row.year) === year
                );

                completeData.push({
                    property_id: property.id,
                    property_address: property.address,
                    month: month.toString(),
                    year: year,
                    rent_collected: existingData?.rent_collected || 0,
                    maintenance_cost: existingData?.maintenance_cost || 0,
                    net_income: (existingData?.rent_collected || 0) - (existingData?.maintenance_cost || 0),
                    payments_count: existingData?.payments_count || 0,
                    maintenance_count: existingData?.maintenance_count || 0,
                    expected_rent: property.expected_rent || 0
                });
            }
        }

        return Response.json(completeData);
        
    } catch (error) {
        console.error('Monthly analytics API error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            userId: (await getServerSession(authOptions))?.user?.id,
            queryParams: {
                year: new URL(request.url).searchParams.get('year'),
                propertyId: new URL(request.url).searchParams.get('property_id')
            }
        });
        
        return Response.json(
            { error: 'Failed to fetch monthly analytics' }, 
            { status: 500 }
        );
    }
}