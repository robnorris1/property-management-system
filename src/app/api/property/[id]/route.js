import pool from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Get property details
        const propertyResult = await pool.query(
            'SELECT * FROM properties WHERE id = $1',
            [id]
        );

        if (propertyResult.rows.length === 0) {
            return Response.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Get all appliances for this property WITH maintenance cost data
        const appliancesResult = await pool.query(`
            SELECT 
                id,
                name,
                type,
                installation_date,
                last_maintenance,
                status,
                created_at,
                COALESCE(total_maintenance_cost, 0)::numeric as total_maintenance_cost,
                COALESCE(last_maintenance_cost, 0)::numeric as last_maintenance_cost,
                COALESCE(maintenance_count, 0)::integer as maintenance_count
            FROM appliances 
            WHERE property_id = $1 
            ORDER BY created_at DESC
        `, [id]);

        // Convert numeric fields to proper numbers
        const appliances = appliancesResult.rows.map(appliance => ({
            ...appliance,
            total_maintenance_cost: parseFloat(appliance.total_maintenance_cost) || 0,
            last_maintenance_cost: parseFloat(appliance.last_maintenance_cost) || 0,
            maintenance_count: parseInt(appliance.maintenance_count) || 0
        }));

        return Response.json({
            property: propertyResult.rows[0],
            appliances: appliances
        });

    } catch (error) {
        console.error('Database error in property API:', error);
        return Response.json(
            { error: 'Failed to fetch property details', details: error.message },
            { status: 500 }
        );
    }
}
