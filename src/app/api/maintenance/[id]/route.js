import pool from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const updateData = await request.json();

        // Check if maintenance record exists
        const existingRecord = await pool.query(
            'SELECT * FROM maintenance_records WHERE id = $1',
            [id]
        );

        if (existingRecord.rows.length === 0) {
            return Response.json(
                { error: 'Maintenance record not found' },
                { status: 404 }
            );
        }

        // Build dynamic update query
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined && value !== null) {
                // Handle cost field
                if (key === 'cost') {
                    const numericCost = !isNaN(parseFloat(value)) ? parseFloat(value) : null;
                    updateFields.push(`${key} = $${paramCount}`);
                    values.push(numericCost);
                } else {
                    updateFields.push(`${key} = $${paramCount}`);
                    values.push(value);
                }
                paramCount++;
            }
        }

        if (updateFields.length === 0) {
            return Response.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE maintenance_records 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return Response.json(result.rows[0]);

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to update maintenance record' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id } = await params;

        // Check if maintenance record exists and get details
        const existingRecord = await client.query(
            'SELECT appliance_id, cost FROM maintenance_records WHERE id = $1',
            [id]
        );

        if (existingRecord.rows.length === 0) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Maintenance record not found' },
                { status: 404 }
            );
        }

        const { appliance_id, cost } = existingRecord.rows[0];

        // Delete maintenance record
        await client.query('DELETE FROM maintenance_records WHERE id = $1', [id]);

        // Update appliance totals (subtract deleted cost)
        if (cost && parseFloat(cost) > 0) {
            await client.query(`
                UPDATE appliances
                SET
                    maintenance_count = GREATEST(maintenance_count - 1, 0),
                    total_maintenance_cost = GREATEST(COALESCE(total_maintenance_cost, 0) - $1, 0)
                WHERE id = $2
            `, [parseFloat(cost), appliance_id]);
        } else {
            await client.query(`
                UPDATE appliances
                SET maintenance_count = GREATEST(maintenance_count - 1, 0)
                WHERE id = $1
            `, [appliance_id]);
        }

        await client.query('COMMIT');
        return Response.json({ message: 'Maintenance record deleted successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to delete maintenance record' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
