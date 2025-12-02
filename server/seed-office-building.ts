import { db } from './db';
import { threatLibrary, controlLibrary } from '../shared/schema';
import { officeThreats, officeControls } from './db/seed-data/office-data';
import { eq } from 'drizzle-orm';

async function seedOfficeBuilding() {
  console.log('🏢 Starting Office Building Seed Data Process...\n');

  // Seed Office Threats
  console.log('📊 Seeding Office Building Threats...');
  let threatsInserted = 0;
  let threatsSkipped = 0;

  for (const threat of officeThreats) {
    try {
      // Check if threat already exists
      const existing = await db.select().from(threatLibrary).where(eq(threatLibrary.name, threat.name)).limit(1);

      if (existing && existing.length > 0) {
        console.log(`  ⏭️  Skipped (exists): ${threat.name}`);
        threatsSkipped++;
        continue;
      }

      await db.insert(threatLibrary).values({
        name: threat.name,
        category: threat.category,
        subcategory: threat.category, // Use category as subcategory for simplicity
        description: threat.description,
        typicalLikelihood: getLikelihoodLevel(threat.likelihood),
        typicalImpact: getImpactLevel(threat.impact),
        asisCode: null,
        mitigation: null,
        examples: [],
        active: true
      });

      console.log(`  ✅ Inserted: ${threat.name}`);
      threatsInserted++;
    } catch (error) {
      console.error(`  ❌ Error inserting threat "${threat.name}":`, error);
    }
  }

  console.log(`\n📊 Threats Summary: ${threatsInserted} inserted, ${threatsSkipped} skipped`);

  // Seed Office Controls
  console.log('\n🛡️  Seeding Office Building Controls...');
  let controlsInserted = 0;
  let controlsSkipped = 0;

  for (const control of officeControls) {
    try {
      // Check if control already exists
      const existing = await db.select().from(controlLibrary).where(eq(controlLibrary.name, control.name)).limit(1);

      if (existing && existing.length > 0) {
        console.log(`  ⏭️  Skipped (exists): ${control.name}`);
        controlsSkipped++;
        continue;
      }

      await db.insert(controlLibrary).values({
        name: control.name,
        category: control.category,
        controlType: control.controlType || 'Preventive',
        description: control.description,
        baseWeight: control.baseWeight || 3,
        reductionPercentage: control.reductionPercentage || 50,
        implementationNotes: control.implementationNotes || null,
        estimatedCost: control.estimatedCost || null,
        maintenanceLevel: control.maintenanceLevel || 'Medium',
        trainingRequired: control.trainingRequired ?? false,
        maintenanceRequired: control.maintenanceRequired ?? false
      });

      console.log(`  ✅ Inserted: ${control.name}`);
      controlsInserted++;
    } catch (error) {
      console.error(`  ❌ Error inserting control "${control.name}":`, error);
    }
  }

  console.log(`\n🛡️  Controls Summary: ${controlsInserted} inserted, ${controlsSkipped} skipped`);
  console.log('\n✅ Office Building seed data process complete!\n');
}

// Helper functions to convert numeric values to string levels
function getLikelihoodLevel(value: number): string {
  if (value >= 5) return 'Very High';
  if (value >= 4) return 'High';
  if (value >= 3) return 'Medium';
  if (value >= 2) return 'Low';
  return 'Very Low';
}

function getImpactLevel(value: number): string {
  if (value >= 5) return 'Critical';
  if (value >= 4) return 'High';
  if (value >= 3) return 'Medium';
  if (value >= 2) return 'Low';
  return 'Minimal';
}

// Execute seed function
seedOfficeBuilding()
  .then(() => {
    console.log('✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
