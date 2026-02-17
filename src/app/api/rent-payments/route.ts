import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('property_id');

        let query = `
            SELECT 
                rp.*,
                p.address as property_address
            FROM rent_payments rp
            JOIN properties p ON p.id = rp.property_id
            WHERE p.user_id = $1
        `;
        let params = [session.user.id];

        if (propertyId) {
            query += ' AND rp.property_id = $2';
            params.push(propertyId);
        }

        query += ' ORDER BY rp.due_date DESC, rp.payment_date DESC';

        const result = await pool.query(query, params);

        return Response.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to fetch rent payments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            property_id, 
            amount, 
            payment_date, 
            due_date, 
            payment_method, 
            reference_number, 
            notes, 
            status, 
            late_fee_amount 
        }: {
            property_id: number;
            amount: number;
            payment_date: string;
            due_date: string;
            payment_method?: string;
            reference_number?: string;
            notes?: string;
            status?: string;
            late_fee_amount?: number;
        } = await request.json();

        if (!property_id || !amount || !payment_date || !due_date) {
            return Response.json({ 
                error: 'Property ID, amount, payment date, and due date are required' 
            }, { status: 400 });
        }

        // Verify the property belongs to the user
        const propertyCheck = await pool.query(
            'SELECT id FROM properties WHERE id = $1 AND user_id = $2',
            [property_id, session.user.id]
        );

        if (propertyCheck.rows.length === 0) {
            return Response.json({ error: 'Property not found' }, { status: 404 });
        }

        const result = await pool.query(`
            INSERT INTO rent_payments (
                property_id, 
                amount, 
                payment_date, 
                due_date, 
                payment_method, 
                reference_number, 
                notes, 
                status, 
                late_fee_amount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *
        `, [
            property_id,
            amount,
            payment_date,
            due_date,
            payment_method || null,
            reference_number || null,
            notes || null,
            status || 'paid',
            late_fee_amount || 0
        ]);

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to create rent payment' }, { status: 500 });
    }
}