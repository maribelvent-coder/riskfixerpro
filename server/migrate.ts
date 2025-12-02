import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function runMigrations() {
  console.log('⏳ Running Phase 2 Executive Protection migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations complete! All 8 Phase 2 tables created:');
    console.log('   - executive_profiles');
    console.log('   - executive_interviews');
    console.log('   - executive_locations');
    console.log('   - executive_travel_routes');
    console.log('   - crime_data_imports');
    console.log('   - crime_incidents');
    console.log('   - executive_points_of_interest');
    console.log('   - osint_findings');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
