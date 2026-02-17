import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await pool.query(
            'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
            [params.id, session.user.id]
        );

        if (result.rows.length === 0) {
            return Response.json({ error: 'Property not found' }, { status: 404 });
        }

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to fetch property' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { address, property_type, monthly_rent }: { 
            address: string; 
            property_type?: string;
            monthly_rent?: number;
        } = await request.json();

        if (!address?.trim()) {
            return Response.json({ error: 'Address is required' }, { status: 400 });
        }

        // Verify property belongs to user
        const existingProperty = await pool.query(
            'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
            [params.id, session.user.id]
        );

        if (existingProperty.rows.length === 0) {
            return Response.json({ error: 'Property not found' }, { status: 404 });
        }

        const result = await pool.query(
            'UPDATE properties SET address = $1, property_type = $2, monthly_rent = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [address, property_type, monthly_rent, params.id, session.user.id]
        );

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to update property' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify property belongs to user
        const existingProperty = await pool.query(
            'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
            [params.id, session.user.id]
        );

        if (existingProperty.rows.length === 0) {
            return Response.json({ error: 'Property not found' }, { status: 404 });
        }

        await pool.query(
            'DELETE FROM properties WHERE id = $1 AND user_id = $2',
            [params.id, session.user.id]
        );

        return Response.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to delete property' }, { status: 500 });
    }
}