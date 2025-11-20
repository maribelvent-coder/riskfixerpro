import { db } from './db';
import { templateQuestions, controlLibrary } from '../shared/schema';
import { RETAIL_STORE_QUESTIONS } from './question-configs/retail-store-questions';
import { WAREHOUSE_QUESTIONS } from './question-configs/warehouse-questions';
import { DATA_CENTER_QUESTIONS } from './question-configs/data-center-questions';
import { MANUFACTURING_QUESTIONS } from './question-configs/manufacturing-questions';
import type { QuestionConfig } from './question-configs/retail-store-questions';
import { eq } from 'drizzle-orm';

// DEPRECATED: Old office-building questions for reference
const OFFICE_BUILDING_QUESTIONS_DEPRECATED = [
  {
    templateId: 'office-building',
    questionId: '1.1',
    category: 'Perimeter Security',
    subcategory: 'Barriers',
    question: 'What types of perimeter barriers are in place (fencing, walls, bollards)?',
    standard: 'ASIS-PSC',
    type: 'text' as const,
    orderIndex: 1,
    bestPractice: 'Assess physical barriers for height, material strength, and deterrent value',
    rationale: 'Perimeter barriers provide the first line of defense against unauthorized access',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '1.2',
    category: 'Perimeter Security',
    subcategory: 'Barriers',
    question: 'What is the condition of perimeter barriers (integrity, maintenance)?',
    standard: 'ASIS-PSC',
    type: 'rating' as const,
    orderIndex: 2,
    bestPractice: 'Rate condition from 1 (poor) to 5 (excellent) based on structural integrity',
    rationale: 'Poorly maintained barriers compromise security effectiveness',
    importance: 'Medium'
  },
  {
    templateId: 'office-building',
    questionId: '1.3',
    category: 'Perimeter Security',
    subcategory: 'Lighting',
    question: 'Is perimeter lighting adequate for surveillance and deterrence?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 3,
    bestPractice: 'Verify minimum 2 foot-candles at ground level along entire perimeter',
    rationale: 'Proper lighting enables detection and deters unauthorized access',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '1.4',
    category: 'Perimeter Security',
    subcategory: 'Lighting',
    question: 'Are there dark zones or blind spots in perimeter lighting?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 4,
    bestPractice: 'Conduct nighttime survey to identify coverage gaps',
    rationale: 'Dark zones create opportunities for covert access',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '2.1',
    category: 'Surveillance',
    subcategory: 'CCTV Coverage',
    question: 'What areas are covered by CCTV surveillance?',
    standard: 'ASIS-PSC',
    type: 'text' as const,
    orderIndex: 5,
    bestPractice: 'Document all camera locations and field of view',
    rationale: 'Comprehensive coverage enables monitoring and investigation',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '2.2',
    category: 'Surveillance',
    subcategory: 'CCTV Coverage',
    question: 'Are CCTV cameras operational and providing clear imagery?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 6,
    bestPractice: 'Test camera functionality and image quality during site visit',
    rationale: 'Non-functional cameras provide false sense of security',
    importance: 'Critical'
  },
  {
    templateId: 'office-building',
    questionId: '3.1',
    category: 'Access Control',
    subcategory: 'Entry Points',
    question: 'How many public entry points does the facility have?',
    standard: 'ASIS-PSC',
    type: 'measurement' as const,
    orderIndex: 7,
    bestPractice: 'Count and document all public and employee entry points',
    rationale: 'Multiple entry points increase monitoring complexity',
    importance: 'Medium'
  },
  {
    templateId: 'office-building',
    questionId: '3.2',
    category: 'Access Control',
    subcategory: 'Entry Points',
    question: 'Are access control systems (card readers, biometrics) functioning properly?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 8,
    bestPractice: 'Test card reader response time and audit logs',
    rationale: 'Failed access control allows unauthorized entry',
    importance: 'Critical'
  },
  {
    templateId: 'office-building',
    questionId: '3.3',
    category: 'Access Control',
    subcategory: 'Visitor Management',
    question: 'Describe the visitor management process',
    standard: 'ASIS-PSC',
    type: 'text' as const,
    orderIndex: 9,
    bestPractice: 'Document check-in procedures, badge issuance, and escort requirements',
    rationale: 'Proper visitor controls prevent unauthorized access to sensitive areas',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '4.1',
    category: 'Intrusion Detection',
    subcategory: 'Alarm Systems',
    question: 'What types of intrusion detection systems are installed?',
    standard: 'ASIS-PSC',
    type: 'text' as const,
    orderIndex: 10,
    bestPractice: 'Identify motion sensors, door contacts, glass break detectors',
    rationale: 'Layered detection provides defense in depth',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '4.2',
    category: 'Intrusion Detection',
    subcategory: 'Alarm Systems',
    question: 'Are alarm systems monitored 24/7?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 11,
    bestPractice: 'Verify monitoring station credentials and response procedures',
    rationale: 'Unmonitored alarms defeat the purpose of detection',
    importance: 'Critical'
  },
  {
    templateId: 'office-building',
    questionId: '5.1',
    category: 'Security Personnel',
    subcategory: 'Staffing',
    question: 'How many security personnel are on duty during business hours?',
    standard: 'ASIS-PSC',
    type: 'measurement' as const,
    orderIndex: 12,
    bestPractice: 'Document staffing levels for all shifts',
    rationale: 'Adequate staffing ensures effective security response',
    importance: 'Medium'
  },
  {
    templateId: 'office-building',
    questionId: '5.2',
    category: 'Security Personnel',
    subcategory: 'Training',
    question: 'Are security personnel trained in emergency response procedures?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 13,
    bestPractice: 'Review training records and certifications',
    rationale: 'Untrained personnel cannot execute effective emergency response',
    importance: 'High'
  },
  {
    templateId: 'office-building',
    questionId: '6.1',
    category: 'Physical Hardening',
    subcategory: 'Doors and Locks',
    question: 'Are exterior doors constructed of solid core material?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 14,
    bestPractice: 'Inspect door construction and lock quality',
    rationale: 'Weak doors can be easily breached',
    importance: 'Medium'
  },
  {
    templateId: 'office-building',
    questionId: '6.2',
    category: 'Physical Hardening',
    subcategory: 'Windows',
    question: 'Are ground-floor windows protected (bars, film, tempered glass)?',
    standard: 'ASIS-PSC',
    type: 'yes-no' as const,
    orderIndex: 15,
    bestPractice: 'Document window protection measures',
    rationale: 'Unprotected windows are vulnerable entry points',
    importance: 'Medium'
  }
];

async function seedFacilityQuestions() {
  try {
    console.log('🌱 Seeding facility survey questions for all templates...\n');
    
    // Step 1: Clean up deprecated office-building questions (if not referenced)
    console.log('🧹 Attempting to clean up legacy office-building questions...');
    try {
      const deletedLegacy = await db.delete(templateQuestions)
        .where(eq(templateQuestions.templateId, 'office-building'))
        .returning();
      console.log(`  ✅ Removed ${deletedLegacy.length} legacy office-building questions\n`);
    } catch (error: any) {
      if (error.code === '23503') {
        console.log(`  ⚠️  Legacy questions still referenced by existing assessments - skipping cleanup\n`);
      } else {
        throw error;
      }
    }
    
    // Step 2: Fetch all controls to create name→ID mapping
    const controls = await db.select().from(controlLibrary);
    const controlNameToId = new Map(controls.map(c => [c.name, c.id]));
    
    console.log(`📚 Loaded ${controls.length} controls from control_library\n`);
    
    const templates = [
      { id: 'retail-store', name: 'Retail Store', questions: RETAIL_STORE_QUESTIONS },
      { id: 'warehouse-distribution', name: 'Warehouse & Distribution', questions: WAREHOUSE_QUESTIONS },
      { id: 'data-center', name: 'Data Center', questions: DATA_CENTER_QUESTIONS },
      { id: 'manufacturing-facility', name: 'Manufacturing Facility', questions: MANUFACTURING_QUESTIONS }
    ];
    
    let totalQuestionsAdded = 0;
    let totalQuestionsUpdated = 0;
    let totalErrors = 0;
    
    for (const template of templates) {
      console.log(`📋 Processing: ${template.name}`);
      console.log('─'.repeat(60));
      
      let added = 0;
      let updated = 0;
      let errors = 0;
      
      for (const question of template.questions) {
        const questionId = `${template.id}-${question.orderIndex.toString().padStart(3, '0')}`;
        const controlId = controlNameToId.get(question.controlLibraryName);
        
        if (!controlId) {
          console.log(`  ❌ Control not found: "${question.controlLibraryName}" for question ${questionId}`);
          errors++;
          totalErrors++;
          continue;
        }
        
        try {
          // Check if question already exists
          const existing = await db.select()
            .from(templateQuestions)
            .where(eq(templateQuestions.questionId, questionId))
            .limit(1);
          
          const questionData = {
            templateId: template.id,
            questionId: questionId,
            category: question.category,
            question: question.questionText,
            type: question.questionType,
            orderIndex: question.orderIndex,
            controlLibraryId: controlId,
            bestPractice: question.followUpText || null,
            rationale: question.evidenceType || null,
            importance: "Medium" // Default importance
          };
          
          if (existing.length > 0) {
            // Update existing question
            await db.update(templateQuestions)
              .set(questionData)
              .where(eq(templateQuestions.questionId, questionId));
            updated++;
            totalQuestionsUpdated++;
          } else {
            // Insert new question
            await db.insert(templateQuestions).values(questionData);
            added++;
            totalQuestionsAdded++;
          }
        } catch (error: any) {
          console.log(`  ❌ Error processing question ${questionId}: ${error.message}`);
          errors++;
          totalErrors++;
        }
      }
      
      console.log(`  ✅ Added: ${added} | Updated: ${updated} | Errors: ${errors}`);
      console.log(`  📊 Total questions for ${template.name}: ${template.questions.length}\n`);
    }
    
    console.log('═'.repeat(60));
    console.log('✅ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`  - Total questions added: ${totalQuestionsAdded}`);
    console.log(`  - Total questions updated: ${totalQuestionsUpdated}`);
    console.log(`  - Total errors: ${totalErrors}`);
    console.log(`  - Grand total: ${totalQuestionsAdded + totalQuestionsUpdated} questions in database\n`);
    
    // Verify seeding
    console.log('🔍 Verifying seeded data...');
    for (const template of templates) {
      const count = await db.select()
        .from(templateQuestions)
        .where(eq(templateQuestions.templateId, template.id));
      console.log(`  - ${template.name}: ${count.length} questions`);
    }
    
    console.log('\n✅ All facility questions seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding facility questions:', error);
    process.exit(1);
  }
}

seedFacilityQuestions();
