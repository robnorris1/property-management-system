import pool from '@/lib/db';
import type { Appliance } from '@/types';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { property_id, name, type, installation_date, last_maintenance, status }: {
            property_id: number;
            name: string;
            type?: string;
            installation_date?: string;
            last_maintenance?: string;
            status?: string;
        } = await request.json();

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

        return Response.json(result.rows[0] as Appliance, { status: 201 });

    } catch (error) {
        console.error('Database error:', error);
        return Response.json(
            { error: 'Failed to create appliance' },
            { status: 500 }
        );
    }
}
