// debug-database.js
// First, let's check what your DATABASE_URL looks like

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging database connection...');
console.log('DATABASE_URL from .env.local:', process.env.DATABASE_URL);

// Parse the DATABASE_URL to see what database it's trying to connect to
if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        console.log('\n📊 Database connection details:');
        console.log('   Protocol:', url.protocol);
        console.log('   Host:', url.hostname);
        console.log('   Port:', url.port);
        console.log('   Database name:', url.pathname.slice(1)); // Remove leading slash
        console.log('   Username:', url.username);
        console.log('   Password:', url.password ? '[HIDDEN]' : 'Not set');
    } catch (error) {
        console.error('❌ Invalid DATABASE_URL format:', error.message);
    }
} else {
    console.error('❌ DATABASE_URL not found in .env.local file');
}

// Check if .env.local file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('\n✅ .env.local file found at:', envPath);

    // Read the file and show DATABASE_URL line
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const dbUrlLine = lines.find(line => line.startsWith('DATABASE_URL'));

    if (dbUrlLine) {
        console.log('DATABASE_URL line in file:', dbUrlLine);
    } else {
        console.log('❌ No DATABASE_URL found in .env.local');
        console.log('File contents:');
        console.log(envContent);
    }
} else {
    console.log('❌ .env.local file not found at:', envPath);
}
