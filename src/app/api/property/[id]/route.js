// Create this file: src/app/api/property/[id]/route.js
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

        // Get all appliances for this property
        const appliancesResult = await pool.query(`
            SELECT
                id,
                name,
                type,
                installation_date,
                last_maintenance,
                status,
                created_at
            FROM appliances
            WHERE property_id = $1
            ORDER BY created_at DESC
        `, [id]);

        return Response.json({
            property: propertyResult.rows[0],
            appliances: appliancesResult.rows
        });

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to fetch property details' },
            { status: 500 }
        );
    }
}
