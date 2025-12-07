/**
 * Seed Retail Store Interview Questions
 * Populates template_questions and question_threat_map/question_control_map tables with proper ID linkages
 */
import { db } from './db';
import { templateQuestions, questionThreatMap, questionControlMap } from '../shared/schema';
import { RETAIL_STORE_INTERVIEW_QUESTIONS } from './data/retail-store-interview-questionnaire';
import { eq, and } from 'drizzle-orm';

// Mapping from questionnaire snake_case identifiers to library names
const THREAT_NAME_MAP: Record<string, string> = {
  'armed_robbery': 'Armed Robbery',
  'burglary_after_hours': 'Forced Entry', // Mapped to closest match
  'employee_theft': 'Inventory Shrinkage', // Mapped to closest match (employee theft subset)
  'return_fraud': 'Credit Card Fraud', // Mapped to closest match
  'shoplifting_individual': 'Inventory Shrinkage',
  'shoplifting_organized_retail_crime': 'Organized Retail Crime',
  'smash_and_grab': 'Armed Robbery', // Mapped to closest violent theft
  'workplace_violence_customer': 'Assault'
};

const CONTROL_NAME_MAP: Record<string, string> = {
  'alarm_system_intrusion': 'Intrusion Detection System',
  'alarm_system_panic_buttons': 'Panic Button / Duress Alarm',
  'armored_car_service': 'Cash Management Procedures',
  'bollards_storefront_protection': 'Anti-Ram Bollards',
  'cash_limit_registers': 'Cash Management Procedures',
  'cctv_pos_registers': 'Point-of-Sale (POS) Security System',
  'cctv_sales_floor': 'CCTV System - IP/Network',
  'clear_sightlines_sales_floor': 'CPTED Principles - Clear Zones',
  'closing_procedures_two_person': 'Two-Person Rule',
  'dressing_room_attendant': 'Security Officers - Unarmed',
  'drop_safe': 'Cash Management Procedures',
  'dual_control_cash_procedures': 'Cash Management Procedures',
  'eas_system_gates': 'Electronic Article Surveillance (EAS)',
  'eas_system_tags': 'Security Tags & Anti-Theft Devices',
  'employee_background_checks': 'Background Checks',
  'employee_package_inspection': 'Package Inspection Procedures',
  'high_value_display_security': 'Security Tags & Anti-Theft Devices',
  'inventory_audit_cycle_counting': 'Inventory Audit & Shrink Analysis',
  'item_count_policy': 'Inventory Audit & Shrink Analysis',
  'loss_prevention_plain_clothes': 'Security Officers - Unarmed',
  'loss_prevention_uniformed': 'Security Officers - Armed',
  'mirrors_blind_spot_coverage': 'Mirrors - Convex Security',
  'merchandise_anchoring': 'Security Tags & Anti-Theft Devices',
  'pos_exception_reporting': 'Point-of-Sale (POS) Security System',
  'refund_authorization_controls': 'Access Authorization Process',
  'reinforced_entrance_doors': 'Reinforced Doors/Frames',
  'robbery_response_training': 'Active Threat Response Training',
  'security_gates_after_hours': 'Turnstiles/Speed Gates',
  'security_guard_uniformed': 'Security Officers - Armed',
  'security_officer_daytime': 'Security Officers - Armed',
  'signage_prosecution_policy': 'Access Control Policy & Audit',
  'stockroom_access_control': 'Card Access System',
  'time_delay_safe': 'Cash Management Procedures'
};

async function seedRetailQuestions() {
  console.log('🏪 Seeding Retail Store Interview Questions...\n');

  const templateId = 'retail-store';
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

  const allQuestions = flattenQuestions(RETAIL_STORE_INTERVIEW_QUESTIONS);
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
  console.log(`\n📊 Retail Store Questions Seeding Results:`);
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
  seedRetailQuestions()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedRetailQuestions };
