// src/lib/auth.js
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions = {
    providers: [
        // Email/Password Authentication
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    // Check if user exists
                    const result = await pool.query(
                        'SELECT * FROM users WHERE email = $1',
                        [credentials.email]
                    )

                    if (result.rows.length === 0) {
                        return null
                    }

                    const user = result.rows[0]

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password_hash
                    )

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        }),
    ],

    pages: {
        signIn: '/auth/signin',
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub
                session.user.role = token.role
            }
            return session
        },
    },

    session: {
        strategy: 'jwt',
    },

    secret: process.env.NEXTAUTH_SECRET,
}
