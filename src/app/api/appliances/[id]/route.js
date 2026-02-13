import pool from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { name, type, installation_date, last_maintenance, status } = await request.json();

        // Validate required fields
        if (!name) {
            return Response.json(
                { error: 'Appliance name is required' },
                { status: 400 }
            );
        }

        // Check if appliance exists
        const existingAppliance = await pool.query(
            'SELECT id FROM appliances WHERE id = $1',
            [id]
        );

        if (existingAppliance.rows.length === 0) {
            return Response.json(
                { error: 'Appliance not found' },
                { status: 404 }
            );
        }

        // Update appliance
        const result = await pool.query(`
            UPDATE appliances 
            SET 
                name = $1,
                type = $2,
                installation_date = $3,
                last_maintenance = $4,
                status = $5
            WHERE id = $6
            RETURNING *
        `, [
            name.trim(),
            type || null,
            installation_date || null,
            last_maintenance || null,
            status || 'working',
            id
        ]);

        return Response.json(result.rows[0]);

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to update appliance' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Check if appliance exists
        const existingAppliance = await pool.query(
            'SELECT id, name FROM appliances WHERE id = $1',
            [id]
        );

        if (existingAppliance.rows.length === 0) {
            return Response.json(
                { error: 'Appliance not found' },
                { status: 404 }
            );
        }

        // Delete appliance
        await pool.query('DELETE FROM appliances WHERE id = $1', [id]);

        return Response.json({
            message: 'Appliance deleted successfully'
        });

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to delete appliance' },
            { status: 500 }
        );
    }
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const result = await pool.query(
            'SELECT * FROM appliances WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return Response.json(
                { error: 'Appliance not found' },
                { status: 404 }
            );
        }

        return Response.json(result.rows[0]);

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to fetch appliance' },
            { status: 500 }
        );
    }
}
