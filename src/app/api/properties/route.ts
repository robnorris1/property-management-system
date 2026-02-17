import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET() {
    try {
        // Get user session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await pool.query(`
            SELECT 
                p.*,
                COALESCE(COUNT(a.id), 0)::integer as appliance_count
            FROM properties p
            LEFT JOIN appliances a ON p.id = a.property_id
            WHERE p.user_id = $1
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `, [session.user.id]);

        // Ensure appliance_count is always a number
        const properties = result.rows.map(property => ({
            ...property,
            appliance_count: parseInt(property.appliance_count) || 0
        }));

        return Response.json(properties);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get user session
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

        const result = await pool.query(
            'INSERT INTO properties (address, property_type, monthly_rent, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [address, property_type, monthly_rent, session.user.id]
        );

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to create property' }, { status: 500 });
    }
}
