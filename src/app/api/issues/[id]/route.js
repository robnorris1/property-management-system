import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request, { params }) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const updateData = await request.json();

        await client.query('BEGIN');

        // Check if issue exists and user owns it
        const issueCheck = await client.query(`
            SELECT i.*, p.user_id
            FROM issues i
            JOIN appliances a ON i.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
            WHERE i.id = $1 AND p.user_id = $2
        `, [id, session.user.id]);

        if (issueCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Issue not found or access denied' },
                { status: 404 }
            );
        }

        // Build dynamic update query
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined && value !== null &&
                ['title', 'description', 'urgency', 'status', 'scheduled_date',
                    'resolved_date', 'resolution_notes', 'maintenance_record_id'].includes(key)) {
                updateFields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (updateFields.length === 0) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        values.push(id);

        const query = `
            UPDATE issues 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await client.query(query, values);

        await client.query('COMMIT');
        return Response.json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to update issue' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if issue exists and user owns it
        const issueCheck = await pool.query(`
            SELECT i.id
            FROM issues i
            JOIN appliances a ON i.appliance_id = a.id
            JOIN properties p ON a.property_id = p.id
            WHERE i.id = $1 AND p.user_id = $2
        `, [id, session.user.id]);

        if (issueCheck.rows.length === 0) {
            return Response.json(
                { error: 'Issue not found or access denied' },
                { status: 404 }
            );
        }

        await pool.query('DELETE FROM issues WHERE id = $1', [id]);

        return Response.json({ message: 'Issue deleted successfully' });

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to delete issue' },
            { status: 500 }
        );
    }
}
