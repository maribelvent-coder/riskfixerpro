import { db } from './db';
import { threatLibrary, controlLibrary } from '../shared/schema';
import { sql } from 'drizzle-orm';
import { DATACENTER_THREATS, DATACENTER_CONTROLS } from './db/seed-data/datacenter-data';

async function seedDatacenterThreatsAndControls() {
  console.log('🏢 Seeding Datacenter Threats and Controls...\n');

  // Insert threats
  console.log(`📊 Inserting ${DATACENTER_THREATS.length} datacenter threats...`);
  let threatsInserted = 0;
  for (const threat of DATACENTER_THREATS) {
    try {
      await db.insert(threatLibrary).values(threat);
      threatsInserted++;
      console.log(`  ✓ ${threat.name}`);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        console.log(`  ⊙ ${threat.name} (already exists)`);
      } else {
        console.error(`  ✗ Failed to insert ${threat.name}:`, error.message);
      }
    }
  }

  // Insert controls
  console.log(`\n📋 Inserting ${DATACENTER_CONTROLS.length} datacenter controls...`);
  let controlsInserted = 0;
  for (const control of DATACENTER_CONTROLS) {
    try {
      await db.insert(controlLibrary).values(control);
      controlsInserted++;
      console.log(`  ✓ ${control.name}`);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        console.log(`  ⊙ ${control.name} (already exists)`);
      } else {
        console.error(`  ✗ Failed to insert ${control.name}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Successfully seeded ${threatsInserted} threats and ${controlsInserted} controls!`);
  return { threatsInserted, controlsInserted };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatacenterThreatsAndControls()
    .then(() => {
      console.log('✨ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding threats and controls:', error);
      process.exit(1);
    });
}

export { seedDatacenterThreatsAndControls };
