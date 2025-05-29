// src/app/api/appliances/route.js
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { property_id, name, type, installation_date, last_maintenance, status } = await request.json();

        // Validate required fields
        if (!property_id || !name) {
            return Response.json(
                { error: 'Property ID and appliance name are required' },
                { status: 400 }
            );
        }

        // Verify property exists
        const propertyCheck = await pool.query(
            'SELECT id FROM properties WHERE id = $1',
            [property_id]
        );

        if (propertyCheck.rows.length === 0) {
            return Response.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Insert new appliance
        const result = await pool.query(`
            INSERT INTO appliances (
                property_id, 
                name, 
                type, 
                installation_date, 
                last_maintenance, 
                status
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `, [
            property_id,
            name.trim(),
            type || null,
            installation_date || null,
            last_maintenance || null,
            status || 'working'
        ]);

        return Response.json(result.rows[0], { status: 201 });

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to create appliance' },
            { status: 500 }
        );
    }
}
