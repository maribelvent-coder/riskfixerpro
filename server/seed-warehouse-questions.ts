/**
 * Seed Warehouse Interview Questions
 * Populates template_questions and question_threat_map/question_control_map tables with proper ID linkages
 */
import { db } from './db';
import { templateQuestions, questionThreatMap, questionControlMap } from '../shared/schema';
import { WAREHOUSE_INTERVIEW_QUESTIONS } from './data/warehouse-interview-questionnaire';
import { eq, and } from 'drizzle-orm';

// Mapping from questionnaire snake_case identifiers to library names
const THREAT_NAME_MAP: Record<string, string> = {
  'cargo_theft_full_truckload': 'Cargo Theft',
  'cargo_theft_pilferage': 'Cargo Theft',
  'hijacking_in_transit': 'Cargo Theft',
  'insider_theft_employee_driver_collusion': 'Insider Threat',
  'inventory_shrinkage_unknown': 'Inventory Shrinkage',
  'loading_dock_breach': 'Forced Entry',
  'vehicle_fleet_theft': 'Vehicle Theft',
  'yard_trailer_theft': 'Vehicle Theft'
};

const CONTROL_NAME_MAP: Record<string, string> = {
  'alarm_response_procedures': 'Alarm Response Procedures',
  'cargo_theft_response_plan': 'Incident Response Plan',
  'cctv_high_value_storage': 'CCTV System - IP/Network',
  'cctv_perimeter': 'CCTV System - Outdoor',
  'cctv_warehouse_interior': 'CCTV System - IP/Network',
  'cctv_yard': 'CCTV System - Outdoor',
  'clear_zone_perimeter': 'CPTED Principles - Clear Zones',
  'cycle_counting_program': 'Inventory Audit & Shrink Analysis',
  'dock_door_sensors_open_close': 'Door/Window Sensors',
  'dock_intrusion_alarm': 'Alarm Monitoring Service',
  'dock_leveler_locks': 'Dock Leveler Lock',
  'dock_procedure_documentation': 'Loading Dock Operating Procedures',
  'dock_scheduling_system': 'Access Authorization Process',
  'driver_background_checks': 'Background Checks',
  'driver_check_in_procedures': 'Visitor Management System',
  'employee_background_checks_all': 'Background Checks',
  'employee_badge_access_control': 'Card Access System',
  'exception_based_reporting': 'Point-of-Sale (POS) Security System',
  'fuel_theft_prevention': 'Asset Tracking System',
  'gate_access_control_with_guard': 'Security Officers - Armed',
  'gps_tracking_fleet_vehicles': 'GPS Tracking',
  'high_security_fencing_8ft': 'Perimeter Fencing - Anti-Climb',
  'high_value_inventory_caging': 'Physical Barrier - Security Cage',
  'insider_threat_program': 'Background Checks',
  'interior_caging_high_value': 'Physical Barrier - Security Cage',
  'key_control_system': 'Key Control System',
  'kingpin_locks_parked_trailers': 'Kingpin Lock',
  'loading_dock_cctv_all_doors': 'CCTV System - IP/Network',
  'load_verification_procedures': 'Inventory Audit & Shrink Analysis',
  'lot_serial_tracking': 'Asset Tracking System',
  'perimeter_intrusion_detection': 'Alarm Monitoring Service',
  'perimeter_lighting_adequate': 'Perimeter Lighting',
  'real_time_inventory_visibility': 'Inventory Audit & Shrink Analysis',
  'security_awareness_training': 'Security Awareness Training',
  'shipping_manifest_verification': 'Inventory Audit & Shrink Analysis',
  'shipping_receiving_procedures': 'Shipping & Receiving Procedures',
  'theft_reporting_hotline': 'Anonymous Reporting Hotline',
  'trailer_parking_designated_area': 'Yard Management System',
  'trailer_seal_verification_system': 'Inventory Audit & Shrink Analysis',
  'two_driver_rule_high_value_loads': 'Two-Person Rule',
  'two_person_rule_high_value': 'Two-Person Rule',
  'vehicle_immobilization_system': 'Vehicle Immobilization System',
  'video_analytics': 'Video Analytics',
  'video_retention_30_days': 'CCTV System - IP/Network',
  'visitor_check_in_system': 'Visitor Management System',
  'warehouse_management_system': 'Warehouse Management System (WMS)',
  'yard_lighting': 'Yard Lighting'
};

async function seedWarehouseQuestions() {
  console.log('🏭 Seeding Warehouse Interview Questions...\n');

  const templateId = 'warehouse';
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const unmappedThreats = new Set<string>();
  const unmappedControls = new Set<string>();

  // Pre-load all control and threat mappings for efficiency
  console.log('📚 Loading control and threat libraries...');
  const { loadControlLibraryByName, loadThreatLibraryByName } = await import('./services/library-resolver');
  const controlLib = await loadControlLibraryByName();
  const threatLib = await loadThreatLibraryByName();
  console.log(`   Loaded ${controlLib.size} controls and ${threatLib.size} threats\n`);

  // Helper function to convert questionnaire data to flat question list
  function flattenQuestions(questions: any[], parentSection: string = ''): any[] {
    const result: any[] = [];
    for (const q of questions) {
      result.push(q);
      if (q.followUpQuestions && q.followUpQuestions.length > 0) {
        result.push(...flattenQuestions(q.followUpQuestions, q.section));
      }
    }
    return result;
  }

  const allQuestions = flattenQuestions(WAREHOUSE_INTERVIEW_QUESTIONS);
  console.log(`📋 Processing ${allQuestions.length} questions (including follow-ups)...\n`);

  for (const question of allQuestions) {
    try {
      console.log(`Processing question ${question.id}...`);
      
      // Resolve control name to ID (only take first control mapping for FK)
      let controlLibraryId: string | null = null;
      if (question.suggestsControls && question.suggestsControls.length > 0) {
        const snakeCaseName = question.suggestsControls[0];
        const libraryName = CONTROL_NAME_MAP[snakeCaseName];
        
        if (!libraryName) {
          unmappedControls.add(snakeCaseName);
          console.warn(`⚠️  Question ${question.id}: Unmapped control: ${snakeCaseName}`);
        } else {
          const control = controlLib.get(libraryName);
          if (control) {
            controlLibraryId = control.id;
          } else {
            console.warn(`⚠️  Question ${question.id}: Control not found in library: ${libraryName}`);
          }
        }
      }

      // Check if question already exists
      const existingQuestion = await db
        .select()
        .from(templateQuestions)
        .where(
          and(
            eq(templateQuestions.templateId, templateId),
            eq(templateQuestions.questionId, question.id)
          )
        );

      let dbQuestionId: string;

      if (existingQuestion.length > 0) {
        // Update existing question
        await db
          .update(templateQuestions)
          .set({
            category: question.section,
            subcategory: question.zoneApplicable?.join(', ') || null,
            question: question.questionText,
            bestPractice: null,
            rationale: question.riskIndicators?.join('; ') || null,
            importance: question.required ? 'High' : 'Medium',
            type: question.questionType.replace('_', '-'),
            options: question.options || null,
            orderIndex: parseInt(question.id.replace(/[^0-9]/g, '')) || 0,
            controlLibraryId: controlLibraryId
          })
          .where(eq(templateQuestions.id, existingQuestion[0].id));

        dbQuestionId = existingQuestion[0].id;
        updatedCount++;
      } else {
        // Insert new question
        const result = await db
          .insert(templateQuestions)
          .values({
            templateId,
            questionId: question.id,
            category: question.section,
            subcategory: question.zoneApplicable?.join(', ') || null,
            question: question.questionText,
            bestPractice: null,
            rationale: question.riskIndicators?.join('; ') || null,
            importance: question.required ? 'High' : 'Medium',
            type: question.questionType.replace('_', '-'),
            options: question.options || null,
            orderIndex: parseInt(question.id.replace(/[^0-9]/g, '')) || 0,
            controlLibraryId: controlLibraryId
          })
          .returning();

        dbQuestionId = result[0].id;
        insertedCount++;
      }

      // Create threat mappings in question_threat_map
      if (question.informsThreat && question.informsThreat.length > 0) {
        for (const snakeCaseName of question.informsThreat) {
          const libraryName = THREAT_NAME_MAP[snakeCaseName];
          
          if (!libraryName) {
            unmappedThreats.add(snakeCaseName);
            console.warn(`⚠️  Question ${question.id}: Unmapped threat: ${snakeCaseName}`);
            continue;
          }

          const threat = threatLib.get(libraryName);
          if (!threat) {
            console.error(`❌ CRITICAL: Question ${question.id}: Threat not found in library: "${libraryName}"`);
            errorCount++;
            continue;
          }

          // Check if mapping already exists
          const existingMapping = await db
            .select()
            .from(questionThreatMap)
            .where(
              and(
                eq(questionThreatMap.questionId, dbQuestionId),
                eq(questionThreatMap.threatId, threat.id)
              )
            );

          if (existingMapping.length === 0) {
            await db.insert(questionThreatMap).values({
              questionId: dbQuestionId,
              threatId: threat.id,
              impactDriver: question.informsImpact || false
            });
          }
        }
      }

      // Create control mappings in question_control_map
      if (question.suggestsControls && question.suggestsControls.length > 0) {
        for (let i = 0; i < question.suggestsControls.length; i++) {
          const snakeCaseName = question.suggestsControls[i];
          const libraryName = CONTROL_NAME_MAP[snakeCaseName];
          
          if (!libraryName) {
            unmappedControls.add(snakeCaseName);
            continue; // Already warned above
          }

          const control = controlLib.get(libraryName);
          if (!control) {
            console.error(`❌ CRITICAL: Question ${question.id}: Control not found in library: "${libraryName}"`);
            errorCount++;
            continue;
          }

          // Check if mapping already exists
          const existingMapping = await db
            .select()
            .from(questionControlMap)
            .where(
              and(
                eq(questionControlMap.questionId, dbQuestionId),
                eq(questionControlMap.controlId, control.id)
              )
            );

          if (existingMapping.length === 0) {
            await db.insert(questionControlMap).values({
              questionId: dbQuestionId,
              controlId: control.id,
              isPrimary: i === 0
            });
          }
        }
      }

    } catch (error) {
      console.error(`❌ Error processing question ${question.id}:`, error);
      errorCount++;
    }
  }

  console.log('\n═'.repeat(70));
  console.log(`\n📊 Warehouse Questions Seeding Results:`);
  console.log(`   Inserted: ${insertedCount} questions`);
  console.log(`   Updated: ${updatedCount} questions`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${allQuestions.length} questions processed\n`);

  if (unmappedThreats.size > 0) {
    console.warn(`\n⚠️  Unmapped Threats (${unmappedThreats.size}):`);
    unmappedThreats.forEach(t => console.warn(`   - ${t}`));
  }

  if (unmappedControls.size > 0) {
    console.warn(`\n⚠️  Unmapped Controls (${unmappedControls.size}):`);
    unmappedControls.forEach(c => console.warn(`   - ${c}`));
  }

  if (errorCount > 0) {
    console.error(`\n❌ SEED FAILED: ${errorCount} error(s) occurred during seeding.`);
    console.error(`   Review the errors above and fix the threat/control mappings.\n`);
    throw new Error(`Seeding failed with ${errorCount} error(s)`);
  }

  console.log('✅ All questions seeded successfully with valid ID-based linkages!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedWarehouseQuestions()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedWarehouseQuestions };
