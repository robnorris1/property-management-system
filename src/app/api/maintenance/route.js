import pool from '@/lib/db';

export async function POST(request) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            appliance_id,
            maintenance_type,
            description,
            cost,
            technician_name,
            technician_company,
            maintenance_date,
            next_due_date,
            notes,
            parts_replaced,
            warranty_until,
            status
        } = await request.json();

        // Validate required fields
        if (!appliance_id || !maintenance_type || !description || !maintenance_date) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Appliance ID, maintenance type, description, and date are required' },
                { status: 400 }
            );
        }

        // Verify appliance exists
        const applianceCheck = await client.query(
            'SELECT id FROM appliances WHERE id = $1',
            [appliance_id]
        );

        if (applianceCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Appliance not found' },
                { status: 404 }
            );
        }

        // Convert cost to proper numeric type or null
        const numericCost = cost && !isNaN(parseFloat(cost)) ? parseFloat(cost) : null;

        // Insert maintenance record
        const result = await client.query(`
            INSERT INTO maintenance_records (
                appliance_id,
                maintenance_type,
                description,
                cost,
                technician_name,
                technician_company,
                maintenance_date,
                next_due_date,
                notes,
                parts_replaced,
                warranty_until,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
        `, [
            appliance_id,
            maintenance_type,
            description,
            numericCost,
            technician_name,
            technician_company,
            maintenance_date,
            next_due_date,
            notes,
            parts_replaced,
            warranty_until,
            status || 'completed'
        ]);

        // Update appliance totals - THIS IS THE KEY FIX
        await client.query(`
            UPDATE appliances
            SET
                last_maintenance = $1,
                last_maintenance_cost = COALESCE($2, 0),
                maintenance_count = maintenance_count + 1,
                total_maintenance_cost = COALESCE(total_maintenance_cost, 0) + COALESCE($2, 0)
            WHERE id = $3
        `, [
            maintenance_date,
            numericCost,
            appliance_id
        ]);

        await client.query('COMMIT');
        return Response.json(result.rows[0], { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to create maintenance record' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const applianceId = url.searchParams.get('appliance_id');
        const limit = url.searchParams.get('limit') || 50;

        let query = `
            SELECT 
                mr.*,
                a.name as appliance_name,
                p.address as property_address
            FROM maintenance_records mr
            JOIN appliances a ON mr.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
        `;

        let params = [];

        if (applianceId) {
            query += ' WHERE mr.appliance_id = $1';
            params.push(applianceId);
        }

        query += ' ORDER BY mr.maintenance_date DESC, mr.created_at DESC';

        if (limit) {
            const limitIndex = params.length + 1;
            query += ` LIMIT $${limitIndex}`;
            params.push(limit);
        }

        const result = await pool.query(query, params);
        return Response.json(result.rows);

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to fetch maintenance records' },
            { status: 500 }
        );
    }
}
