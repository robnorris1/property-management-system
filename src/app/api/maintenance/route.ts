import pool from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
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

        // Update appliance totals and status if repair is completed
        const shouldUpdateStatus = (maintenance_type === 'repair' || maintenance_type === 'replacement') && 
                                  (status === 'completed' || !status);
        
        if (shouldUpdateStatus) {
            // Update appliance totals and set status to working when repair is completed
            await client.query(`
                UPDATE appliances
                SET
                    last_maintenance = $1,
                    last_maintenance_cost = COALESCE($2, 0),
                    maintenance_count = maintenance_count + 1,
                    total_maintenance_cost = COALESCE(total_maintenance_cost, 0) + COALESCE($2, 0),
                    status = 'working'
                WHERE id = $3
            `, [
                maintenance_date,
                numericCost,
                appliance_id
            ]);

            // Auto-resolve any open issues for this appliance when repair is completed
            await client.query(`
                UPDATE issues
                SET 
                    status = 'resolved',
                    resolved_date = $1,
                    resolution_notes = COALESCE(resolution_notes, '') || 
                        CASE 
                            WHEN resolution_notes IS NOT NULL AND resolution_notes != '' 
                            THEN E'\n\nAuto-resolved: ' 
                            ELSE 'Auto-resolved: ' 
                        END || $2,
                    maintenance_record_id = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE appliance_id = $4 
                AND status IN ('open', 'scheduled', 'in_progress')
            `, [
                maintenance_date,
                `${maintenance_type} maintenance completed - ${description}`,
                result.rows[0].id,
                appliance_id
            ]);
        } else {
            // Update appliance totals only
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
        }

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

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const applianceId = url.searchParams.get('appliance_id');
        const limitParam = url.searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : 50;

        let query = `
            SELECT 
                mr.*,
                a.name as appliance_name,
                p.address as property_address
            FROM maintenance_records mr
            JOIN appliances a ON mr.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
        `;

        const params: (string | number)[] = [];

        if (applianceId) {
            query += ' WHERE mr.appliance_id = $1';
            params.push(applianceId);
        }

        query += ' ORDER BY mr.maintenance_date DESC, mr.created_at DESC';

        if (limit) {
            const limitIndex = params.length + 1;
            query += ` LIMIT $${limitIndex}`;
            params.push(limit.toString());
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
