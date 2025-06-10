// src/app/api/issues/route.js
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await client.query('BEGIN');

        const {
            appliance_id,
            title,
            description,
            urgency,
            reported_date
        } = await request.json();

        // Validate required fields
        if (!appliance_id || !title || !description) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Appliance ID, title, and description are required' },
                { status: 400 }
            );
        }

        // Verify appliance exists and user owns it
        const applianceCheck = await client.query(`
            SELECT a.id, a.name, p.user_id 
            FROM appliances a
            JOIN properties p ON a.property_id = p.id
            WHERE a.id = $1 AND p.user_id = $2
        `, [appliance_id, session.user.id]);

        if (applianceCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Appliance not found or access denied' },
                { status: 404 }
            );
        }

        // Create issue
        const result = await client.query(`
            INSERT INTO issues (
                appliance_id,
                title,
                description,
                urgency,
                reported_date,
                reported_by,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, 'open')
            RETURNING *
        `, [
            appliance_id,
            title.trim(),
            description.trim(),
            urgency || 'medium',
            reported_date || new Date().toISOString().split('T')[0],
            session.user.id
        ]);

        await client.query('COMMIT');
        return Response.json(result.rows[0], { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to create issue' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const applianceId = url.searchParams.get('appliance_id');
        const status = url.searchParams.get('status');

        let query = `
            SELECT 
                i.*,
                a.name as appliance_name,
                p.address as property_address,
                u.name as reported_by_name
            FROM issues i
            JOIN appliances a ON i.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
            LEFT JOIN users u ON i.reported_by = u.id
            WHERE p.user_id = $1
        `;

        const params = [session.user.id];

        if (applianceId) {
            params.push(applianceId);
            query += ` AND i.appliance_id = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND i.status = $${params.length}`;
        }

        query += ' ORDER BY i.urgency = \'critical\' DESC, i.reported_date DESC, i.created_at DESC';

        const result = await pool.query(query, params);
        return Response.json(result.rows);

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to fetch issues' },
            { status: 500 }
        );
    }
}
