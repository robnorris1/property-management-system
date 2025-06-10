import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateDatabase() {
    try {
        console.log('🔄 Starting database update for issues system...');

        // Create issues table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                appliance_id INTEGER NOT NULL REFERENCES appliances(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                urgency VARCHAR(20) NOT NULL DEFAULT 'medium',
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
                reported_by INTEGER REFERENCES users(id),
                scheduled_date DATE,
                resolved_date DATE,
                resolution_notes TEXT,
                maintenance_record_id INTEGER REFERENCES maintenance_records(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Issues table created');

        // Update appliance status values
        await pool.query(`
            UPDATE appliances 
            SET status = CASE 
                WHEN status = 'maintenance' THEN 'needs_repair'
                WHEN status = 'broken' THEN 'out_of_service'
                ELSE status
            END;
        `);
        console.log('✅ Appliance statuses updated');

        // Add new columns to appliances
        await pool.query(`
            ALTER TABLE appliances 
            ADD COLUMN IF NOT EXISTS has_open_issues BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20);
        `);
        console.log('✅ New columns added to appliances');

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_issues_appliance_id ON issues(appliance_id);
            CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
            CREATE INDEX IF NOT EXISTS idx_issues_urgency ON issues(urgency);
            CREATE INDEX IF NOT EXISTS idx_issues_reported_date ON issues(reported_date);
        `);
        console.log('✅ Indexes created');

        // Create the trigger function
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_appliance_issue_status()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                    UPDATE appliances 
                    SET 
                        has_open_issues = EXISTS (
                            SELECT 1 FROM issues 
                            WHERE appliance_id = NEW.appliance_id 
                            AND status IN ('open', 'scheduled', 'in_progress')
                        ),
                        urgency_level = (
                            SELECT MAX(urgency) FROM issues 
                            WHERE appliance_id = NEW.appliance_id 
                            AND status IN ('open', 'scheduled', 'in_progress')
                        ),
                        status = CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM issues 
                                WHERE appliance_id = NEW.appliance_id 
                                AND status IN ('open', 'scheduled', 'in_progress')
                                AND urgency = 'critical'
                            ) THEN 'out_of_service'
                            WHEN EXISTS (
                                SELECT 1 FROM issues 
                                WHERE appliance_id = NEW.appliance_id 
                                AND status IN ('open', 'scheduled', 'in_progress')
                            ) THEN 'needs_repair'
                            ELSE 'working'
                        END
                    WHERE id = NEW.appliance_id;
                END IF;
                
                IF TG_OP = 'DELETE' THEN
                    UPDATE appliances 
                    SET 
                        has_open_issues = EXISTS (
                            SELECT 1 FROM issues 
                            WHERE appliance_id = OLD.appliance_id 
                            AND status IN ('open', 'scheduled', 'in_progress')
                        ),
                        urgency_level = (
                            SELECT MAX(urgency) FROM issues 
                            WHERE appliance_id = OLD.appliance_id 
                            AND status IN ('open', 'scheduled', 'in_progress')
                        ),
                        status = CASE 
                            WHEN NOT EXISTS (
                                SELECT 1 FROM issues 
                                WHERE appliance_id = OLD.appliance_id 
                                AND status IN ('open', 'scheduled', 'in_progress')
                            ) THEN 'working'
                            ELSE status
                        END
                    WHERE id = OLD.appliance_id;
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('✅ Trigger function created');

        // Create trigger
        await pool.query(`
            DROP TRIGGER IF EXISTS update_appliance_on_issue_change ON issues;
            CREATE TRIGGER update_appliance_on_issue_change
                AFTER INSERT OR UPDATE OR DELETE ON issues
                FOR EACH ROW
                EXECUTE FUNCTION update_appliance_issue_status();
        `);
        console.log('✅ Trigger created');

        // Add trigger for updated_at
        await pool.query(`
            DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
            CREATE TRIGGER update_issues_updated_at 
                BEFORE UPDATE ON issues 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✅ Updated_at trigger created');

        console.log('🎉 Database update completed successfully!');
        console.log('');
        console.log('Your property management system now includes:');
        console.log('   📋 Issues tracking system');
        console.log('   🔄 Automatic status updates');
        console.log('   🚨 Urgency levels');
        console.log('   📊 Enhanced dashboard metrics');

    } catch (err) {
        console.error('❌ Error updating database:', err);
        console.error('');
        console.error('Please check:');
        console.error('1. Your database connection');
        console.error('2. That the previous tables exist');
        console.error('3. Your user has ALTER TABLE permissions');
    } finally {
        await pool.end();
    }
}

updateDatabase();
