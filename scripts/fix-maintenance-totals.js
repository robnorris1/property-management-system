// fix-maintenance-totals.js
// Use CommonJS syntax instead of ES6 imports

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixMaintenanceTotals() {
    const client = await pool.connect();

    try {
        console.log('🔧 Starting maintenance totals fix...');

        // Get all appliances
        const appliances = await client.query('SELECT id, name FROM appliances');
        console.log(`Found ${appliances.rows.length} appliances to check`);

        for (const appliance of appliances.rows) {
            console.log(`\n📝 Processing: ${appliance.name} (ID: ${appliance.id})`);

            // Calculate actual totals from maintenance records
            const totals = await client.query(`
                SELECT 
                    COUNT(*) as total_count,
                    COALESCE(SUM(CASE WHEN cost IS NOT NULL THEN cost ELSE 0 END), 0) as total_cost,
                    MAX(cost) as last_cost,
                    MAX(maintenance_date) as last_maintenance_date
                FROM maintenance_records 
                WHERE appliance_id = $1
            `, [appliance.id]);

            const { total_count, total_cost, last_cost, last_maintenance_date } = totals.rows[0];

            console.log(`   Records found: ${total_count}`);
            console.log(`   Total cost: £${parseFloat(total_cost)}`);
            console.log(`   Last cost: £${last_cost || 0}`);
            console.log(`   Last maintenance: ${last_maintenance_date || 'Never'}`);

            // Update appliance with correct totals
            await client.query(`
                UPDATE appliances 
                SET 
                    maintenance_count = $1,
                    total_maintenance_cost = $2,
                    last_maintenance_cost = $3,
                    last_maintenance = $4
                WHERE id = $5
            `, [
                parseInt(total_count),
                parseFloat(total_cost),
                last_cost ? parseFloat(last_cost) : null,
                last_maintenance_date,
                appliance.id
            ]);

            console.log(`   ✅ Updated appliance ${appliance.id}`);
        }

        // Show final summary
        console.log('\n📊 Final Summary:');
        const summary = await client.query(`
            SELECT 
                COUNT(*) as total_appliances,
                SUM(COALESCE(maintenance_count, 0)) as total_maintenance_records,
                SUM(COALESCE(total_maintenance_cost, 0)) as total_cost
            FROM appliances
        `);

        const { total_appliances, total_maintenance_records, total_cost } = summary.rows[0];
        console.log(`   Total appliances: ${total_appliances}`);
        console.log(`   Total maintenance records: ${total_maintenance_records}`);
        console.log(`   Total maintenance cost: £${parseFloat(total_cost)}`);

        console.log('\n🎉 All maintenance totals fixed successfully!');

    } catch (error) {
        console.error('❌ Error fixing totals:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
        console.log('\n👋 Database connection closed');
    }
}

// Run the fix
console.log('🚀 Starting maintenance totals fix script...');
fixMaintenanceTotals()
    .then(() => {
        console.log('✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
