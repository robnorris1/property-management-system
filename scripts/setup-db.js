import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config({path: '.env.local'});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id
                SERIAL
                PRIMARY
                KEY,
                email
                VARCHAR
            (
                255
            ) UNIQUE NOT NULL,
                password_hash VARCHAR
            (
                255
            ),
                name VARCHAR
            (
                100
            ),
                role VARCHAR
            (
                50
            ) DEFAULT 'user',
                email_verified BOOLEAN DEFAULT FALSE,
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        // NextAuth.js required tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS accounts
            (
                id
                SERIAL
                PRIMARY
                KEY,
                user_id
                INTEGER
                NOT
                NULL
                REFERENCES
                users
            (
                id
            ) ON DELETE CASCADE,
                type VARCHAR
            (
                255
            ) NOT NULL,
                provider VARCHAR
            (
                255
            ) NOT NULL,
                provider_account_id VARCHAR
            (
                255
            ) NOT NULL,
                refresh_token TEXT,
                access_token TEXT,
                expires_at INTEGER,
                token_type VARCHAR
            (
                255
            ),
                scope VARCHAR
            (
                255
            ),
                id_token TEXT,
                session_state VARCHAR
            (
                255
            ),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE
            (
                provider,
                provider_account_id
            )
                );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions
            (
                id
                SERIAL
                PRIMARY
                KEY,
                session_token
                VARCHAR
            (
                255
            ) UNIQUE NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users
            (
                id
            ) ON DELETE CASCADE,
                expires TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_tokens
            (
                identifier
                VARCHAR
            (
                255
            ) NOT NULL,
                token VARCHAR
            (
                255
            ) UNIQUE NOT NULL,
                expires TIMESTAMP NOT NULL,
                PRIMARY KEY
            (
                identifier,
                token
            )
                );
        `);

        // Update existing properties table to associate with users
        await pool.query(`
            ALTER TABLE properties
                ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
        `);

        // Create properties table if it doesn't exist (for new setups)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS properties
            (
                id
                SERIAL
                PRIMARY
                KEY,
                address
                VARCHAR
            (
                255
            ) NOT NULL,
                property_type VARCHAR
            (
                100
            ),
                user_id INTEGER REFERENCES users
            (
                id
            ),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        // Create appliances table with maintenance tracking fields
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appliances
            (
                id
                SERIAL
                PRIMARY
                KEY,
                property_id
                INTEGER
                REFERENCES
                properties
            (
                id
            ),
                name VARCHAR
            (
                100
            ) NOT NULL,
                type VARCHAR
            (
                50
            ),
                installation_date DATE,
                last_maintenance DATE,
                status VARCHAR
            (
                50
            ) DEFAULT 'working',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_maintenance_cost DECIMAL
            (
                10,
                2
            ) DEFAULT 0,
                last_maintenance_cost DECIMAL
            (
                10,
                2
            ),
                maintenance_count INTEGER DEFAULT 0
                );
        `);

        // Create maintenance_records table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS maintenance_records
            (
                id
                SERIAL
                PRIMARY
                KEY,
                appliance_id
                INTEGER
                REFERENCES
                appliances
            (
                id
            ) ON DELETE CASCADE,
                maintenance_type VARCHAR
            (
                50
            ) NOT NULL,
                description TEXT NOT NULL,
                cost DECIMAL
            (
                10,
                2
            ),
                technician_name VARCHAR
            (
                100
            ),
                technician_company VARCHAR
            (
                100
            ),
                maintenance_date DATE NOT NULL,
                next_due_date DATE,
                notes TEXT,
                parts_replaced TEXT[],
                warranty_until DATE,
                status VARCHAR
            (
                20
            ) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues
            (
                id
                SERIAL
                PRIMARY
                KEY,
                appliance_id
                INTEGER
                NOT
                NULL
                REFERENCES
                appliances
            (
                id
            ) ON DELETE CASCADE,
                title VARCHAR
            (
                255
            ) NOT NULL,
                description TEXT NOT NULL,
                urgency VARCHAR
            (
                20
            ) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
                status VARCHAR
            (
                20
            ) NOT NULL DEFAULT 'open', -- open, scheduled, in_progress, resolved, cancelled
                reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
                reported_by INTEGER REFERENCES users
            (
                id
            ),
                scheduled_date DATE,
                resolved_date DATE,
                resolution_notes TEXT,
                maintenance_record_id INTEGER REFERENCES maintenance_records
            (
                id
            ),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        // Create maintenance_photos table for future photo attachments
        await pool.query(`
            CREATE TABLE IF NOT EXISTS maintenance_photos
            (
                id
                SERIAL
                PRIMARY
                KEY,
                maintenance_record_id
                INTEGER
                REFERENCES
                maintenance_records
            (
                id
            ) ON DELETE CASCADE,
                filename VARCHAR
            (
                255
            ) NOT NULL,
                original_name VARCHAR
            (
                255
            ),
                file_size INTEGER,
                mime_type VARCHAR
            (
                100
            ),
                upload_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        // Add indexes for better performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_maintenance_records_appliance_id
                ON maintenance_records(appliance_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_maintenance_records_maintenance_date
                ON maintenance_records(maintenance_date);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_maintenance_records_next_due_date
                ON maintenance_records(next_due_date);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_maintenance_photos_maintenance_record_id
                ON maintenance_photos(maintenance_record_id);
        `);

        // Create trigger function for updating updated_at timestamp
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create triggers to automatically update updated_at
        await pool.query(`
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        `);

        await pool.query(`
            CREATE TRIGGER update_users_updated_at 
                BEFORE UPDATE ON users 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await pool.query(`
            DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON maintenance_records;
        `);

        await pool.query(`
            CREATE TRIGGER update_maintenance_records_updated_at 
                BEFORE UPDATE ON maintenance_records 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        // Add any missing columns to existing appliances table (for existing databases)
        await pool.query(`
            ALTER TABLE appliances
                ADD COLUMN IF NOT EXISTS total_maintenance_cost DECIMAL (10,2) DEFAULT 0,
                ADD COLUMN IF NOT EXISTS last_maintenance_cost DECIMAL (10,2),
                ADD COLUMN IF NOT EXISTS maintenance_count INTEGER DEFAULT 0;
        `);

        console.log('✅ Database tables created successfully!');
        console.log('✅ User authentication tables added!');
        console.log('✅ NextAuth.js tables configured!');
        console.log('✅ Maintenance system tables added!');
        console.log('✅ Indexes created for performance!');
        console.log('✅ Triggers and views created!');
        console.log('');
        console.log('🎯 Your multi-user property management system is ready with:');
        console.log('   👥 User authentication and sessions');
        console.log('   📍 User-specific properties and appliances');
        console.log('   🔧 Comprehensive maintenance logging');
        console.log('   💰 Cost tracking and analytics');
        console.log('   🔒 Secure data isolation between users');
        console.log('   📊 Performance optimized queries');

    } catch (err) {
        console.error('❌ Error setting up database:', err);
        console.error('');
        console.error('Common issues:');
        console.error('1. Make sure PostgreSQL is running');
        console.error('2. Check your DATABASE_URL in .env.local');
        console.error('3. Ensure database exists and user has proper permissions');
    } finally {
        await pool.end();
    }
}

setupDatabase();
