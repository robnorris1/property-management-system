// src/app/api/auth/register/route.js
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request) {
    try {
        const { email, password, name } = await request.json()

        // Validate input
        if (!email || !password || !name) {
            return Response.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return Response.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        )

        if (existingUser.rows.length > 0) {
            return Response.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const saltRounds = 12
        const passwordHash = await bcrypt.hash(password, saltRounds)

        // Create user
        const result = await pool.query(`
            INSERT INTO users (email, password_hash, name, role) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email, name, role, created_at
        `, [
            email.toLowerCase(),
            passwordHash,
            name.trim(),
            'user'
        ])

        const user = result.rows[0]

        return Response.json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Registration error:', error)
        return Response.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
