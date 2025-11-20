/**
 * Seed Office Building Interview Questions
 * Populates template_questions and question_threat_map tables with proper ID linkages
 */
import { db } from './db';
import { templateQuestions, questionThreatMap, questionControlMap } from '../shared/schema';
import { OFFICE_BUILDING_INTERVIEW_QUESTIONS } from './data/office-building-interview-questionnaire';
import { resolveControlNames, resolveThreatNames } from './services/library-resolver';
import { eq, and } from 'drizzle-orm';

async function seedOfficeQuestions() {
  console.log('🏢 Seeding Office Building Interview Questions...\n');

  const templateId = 'office-building';
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  // Pre-load all control and threat mappings for efficiency
  console.log('📚 Loading control and threat libraries...');
  const { loadControlLibraryByName, loadThreatLibraryByName } = await import('./services/library-resolver');
  const controlLib = await loadControlLibraryByName();
  const threatLib = await loadThreatLibraryByName();
  console.log(`   Loaded ${controlLib.size} controls and ${threatLib.size} threats\n`);

  for (const question of OFFICE_BUILDING_INTERVIEW_QUESTIONS) {
    try {
      console.log(`Processing question ${question.id}...`);
      
      // Resolve control name to ID (only take first control mapping for FK)
      let controlLibraryId: string | null = null;
      if (question.controlMappings.length > 0) {
        const control = controlLib.get(question.controlMappings[0]);
        if (control) {
          controlLibraryId = control.id;
        } else {
          console.warn(`⚠️  Question ${question.id}: Control not found: ${question.controlMappings[0]}`);
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
            category: question.category,
            subcategory: question.subcategory || null,
            question: question.question,
            bestPractice: question.helpText || null,
            rationale: question.riskIndicators?.highRisk || null,
            importance: 'High', // Default importance
            type: question.type,
            orderIndex: parseInt(question.id.replace('.', '')) || 0,
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
            category: question.category,
            subcategory: question.subcategory || null,
            question: question.question,
            bestPractice: question.helpText || null,
            rationale: question.riskIndicators?.highRisk || null,
            importance: 'High', // Default importance
            type: question.type,
            orderIndex: parseInt(question.id.replace('.', '')) || 0,
            controlLibraryId: controlLibraryId
          })
          .returning();

        dbQuestionId = result[0].id;
        insertedCount++;
      }

      // Create threat mappings in question_threat_map using pre-loaded libraries
      if (question.threatMappings.length > 0) {
        for (const threatName of question.threatMappings) {
          const threat = threatLib.get(threatName);
          if (!threat) {
            console.error(`❌ CRITICAL: Question ${question.id}: Threat not found: "${threatName}"`);
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
              impactDriver: true
            });
          }
        }
      }

      // Create control mappings in question_control_map using pre-loaded libraries
      if (question.controlMappings.length > 0) {
        for (let i = 0; i < question.controlMappings.length; i++) {
          const controlName = question.controlMappings[i];
          const control = controlLib.get(controlName);
          if (!control) {
            console.error(`❌ CRITICAL: Question ${question.id}: Control not found: "${controlName}"`);
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
              isPrimary: i === 0 // First control is primary
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
  console.log(`\n📊 Office Building Questions Seeding Results:`);
  console.log(`   Inserted: ${insertedCount} questions`);
  console.log(`   Updated: ${updatedCount} questions`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${OFFICE_BUILDING_INTERVIEW_QUESTIONS.length} questions processed\n`);

  if (errorCount > 0) {
    console.error(`\n❌ SEED FAILED: ${errorCount} error(s) occurred during seeding.`);
    console.error(`   This indicates broken threat/control mappings in the questionnaire.`);
    console.error(`   Review the errors above and fix the questionnaire configuration.\n`);
    throw new Error(`Seeding failed with ${errorCount} error(s)`);
  }

  console.log('✅ All questions seeded successfully with valid ID-based linkages!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOfficeQuestions()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedOfficeQuestions };
