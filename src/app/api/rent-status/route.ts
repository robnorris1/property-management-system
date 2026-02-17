import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await pool.query(`
            SELECT 
                p.id as property_id,
                p.address as property_address,
                p.monthly_rent,
                MAX(rp.payment_date) as last_payment_date,
                (SELECT amount FROM rent_payments WHERE property_id = p.id ORDER BY payment_date DESC LIMIT 1) as last_payment_amount,
                COALESCE(
                    (SELECT SUM(amount) FROM rent_payments 
                     WHERE property_id = p.id 
                     AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                     AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)),
                    0
                ) as total_collected_this_month,
                COALESCE(
                    (SELECT SUM(amount) FROM rent_payments 
                     WHERE property_id = p.id 
                     AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)),
                    0
                ) as total_collected_this_year,
                CASE 
                    WHEN MAX(rp.payment_date) IS NULL THEN NULL
                    ELSE EXTRACT(DAYS FROM (CURRENT_DATE - MAX(rp.payment_date)))::integer
                END as days_since_last_payment,
                CASE 
                    WHEN p.monthly_rent IS NULL THEN 'not_set'
                    WHEN MAX(rp.payment_date) IS NULL THEN 'no_payments'
                    WHEN EXTRACT(DAYS FROM (CURRENT_DATE - MAX(rp.payment_date))) > 35 THEN 'overdue'
                    ELSE 'current'
                END as rent_status
            FROM properties p
            LEFT JOIN rent_payments rp ON p.id = rp.property_id
            WHERE p.user_id = $1
            GROUP BY p.id, p.address, p.monthly_rent
            ORDER BY p.address
        `, [session.user.id]);

        return Response.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to fetch rent status' }, { status: 500 });
    }
}