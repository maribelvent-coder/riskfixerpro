import { db } from './db';
import { templateQuestions } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  'Checklist Item': string;
  'Best Practice for Conducting the Review': string;
  'Rationale (Risk Mitigated)': string;
  'Importance': string;
}

// Infer question type based on content
function inferQuestionType(questionText: string, importance: string): string {
  const lowerQuestion = questionText.toLowerCase();
  
  // Questions asking for specific details or descriptions
  if (lowerQuestion.includes('what') || 
      lowerQuestion.includes('describe') ||
      lowerQuestion.includes('how are') ||
      lowerQuestion.includes('how is')) {
    return 'text';
  }
  
  // Questions that might need photo evidence (physical security assessments)
  if (lowerQuestion.includes('visible') || 
      lowerQuestion.includes('imagery') ||
      lowerQuestion.includes('inspect') ||
      lowerQuestion.includes('physical')) {
    return 'photo-text'; // Combo: text response + optional photo
  }
  
  // Questions about policies, procedures, or yes/no scenarios
  if (lowerQuestion.includes('is there') ||
      lowerQuestion.includes('does the') ||
      lowerQuestion.includes('are there') ||
      lowerQuestion.includes('has a')) {
    return 'yes-no';
  }
  
  // Critical questions that need detailed assessment
  if (importance === 'Critical') {
    return 'rating'; // 1-5 rating scale with notes
  }
  
  // Default to yes-no for most questions
  return 'yes-no';
}

// Parse section from question ID
function parseSection(questionId: string): { section: number; category: string } {
  const sectionNum = parseInt(questionId.charAt(0));
  
  // Special handling for specific questions that need to be recategorized
  // 1.1.1 (PII), 1.1.3 (Dark Web), and 1.2.x (Social Media) → Digital Footprint
  if (questionId === '1.1.1' || questionId === '1.1.3' || questionId.startsWith('1.2')) {
    return {
      section: 1,
      category: 'Digital Footprint Analysis'
    };
  }
  
  // 1.1.2 (Residential Imagery) → Residential Security
  if (questionId === '1.1.2') {
    return {
      section: 2,
      category: 'Residential Security Assessment'
    };
  }
  
  if (sectionNum === 1) {
    return {
      section: 1,
      category: 'Travel Assessment'
    };
  } else if (sectionNum === 2) {
    return {
      section: 2,
      category: 'Residential Security Assessment'
    };
  } else if (sectionNum === 3) {
    return {
      section: 3,
      category: 'Executive Office & Corporate Security'
    };
  }
  
  return { section: 0, category: 'Unknown' };
}

// Extract subcategory from section headers
function getSubcategory(questionId: string, questionText: string): string {
  // Special handling for recategorized questions
  if (questionId === '1.1.1' || questionId === '1.1.3') {
    return 'PII & Dark Web Exposure';
  }
  
  if (questionId.startsWith('1.2')) {
    return 'Social Media Review (Executive & Family)';
  }
  
  if (questionId === '1.1.2') {
    return 'Residential Physical Security';
  }
  
  // Section 1 subcategories (OSINT & Threat Assessment)
  if (questionId.startsWith('1.1')) return 'Open-Source Intelligence (OSINT)';
  if (questionId.startsWith('1.3')) return 'Personal Practices & Pattern of Life';
  if (questionId.startsWith('1.4')) return 'Travel Security & Advance Work';
  if (questionId.startsWith('1.5')) return 'Secure Transportation Protocols';
  if (questionId.startsWith('1.6')) return 'Travel Digital Security Hygiene';
  
  // Section 2 subcategories
  if (questionId.startsWith('2.1')) return 'Perimeter Security (CPTED & Landscaping)';
  if (questionId.startsWith('2.2')) return 'Perimeter Security (Physical Barriers & Lighting)';
  if (questionId.startsWith('2.3')) return 'Access Control & Physical Hardening';
  if (questionId.startsWith('2.4')) return 'Interior Security Systems (Alarm, CCTV, PIDS)';
  if (questionId.startsWith('2.5')) return 'Specialized Residential Protections';
  if (questionId.startsWith('2.6')) return 'Residential Emergency & Response Planning';
  
  // Section 3 subcategories
  if (questionId.startsWith('3.1')) return 'Executive Floor Physical Security & CPTED';
  if (questionId.startsWith('3.2')) return 'Executive Access Control (RBAC)';
  if (questionId.startsWith('3.3')) return 'Visitor Management & Control Protocols';
  if (questionId.startsWith('3.4')) return 'Secure Communications & Information Handling';
  if (questionId.startsWith('3.5')) return 'Executive Emergency Evacuation & Shelter-in-Place';
  
  return '';
}

async function seedExecutiveSurveyQuestions() {
  console.log('🔄 Starting Executive Protection question seeding...');
  
  let deletedFacilitySurveyData = false;
  
  try {
    // Step 1: First, get all template question IDs for executive-protection
    console.log('🔍 Finding existing executive protection template questions...');
    const existingQuestions = await db.select({ id: templateQuestions.id })
      .from(templateQuestions)
      .where(eq(templateQuestions.templateId, 'executive-protection'));
    
    const templateQuestionIds = existingQuestions.map((q: { id: string }) => q.id);
    console.log(`📋 Found ${templateQuestionIds.length} existing template questions`);
    
    // Step 2: Delete facility_survey_questions that reference these template questions
    if (templateQuestionIds.length > 0) {
      console.log('🗑️  Removing facility survey questions that reference template...');
      const { facilitySurveyQuestions } = await import('../shared/schema');
      const { inArray } = await import('drizzle-orm');
      
      await db.delete(facilitySurveyQuestions)
        .where(inArray(facilitySurveyQuestions.templateQuestionId, templateQuestionIds));
      
      deletedFacilitySurveyData = true;
      console.log('✅ Removed dependent facility survey questions');
    }
    
    // Step 3: Now remove existing executive protection template questions
    console.log('🗑️  Removing existing executive protection template questions...');
    await db.delete(templateQuestions)
      .where(eq(templateQuestions.templateId, 'executive-protection'));
    
    // Step 2: Read and parse CSV
    const csvPath = path.join(__dirname, 'data/executive-survey-questions.csv');
    console.log(`📖 Reading CSV from: ${csvPath}`);
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle BOM character
    }) as CSVRow[];
    
    console.log(`📊 Parsed ${records.length} rows from CSV`);
    
    // Step 3: Process and insert questions
    const questionsToInsert = [];
    let orderIndex = 0;
    
    for (const record of records) {
      const checklistItem = record['Checklist Item'];
      
      // Skip empty rows and section headers (they don't have question IDs with dots)
      if (!checklistItem || !checklistItem.match(/^\d+\.\d+\.\d+:/)) {
        continue;
      }
      
      // Extract question ID and question text
      const match = checklistItem.match(/^(\d+\.\d+\.\d+):\s*(.+)/);
      if (!match) {
        continue;
      }
      
      const [, questionId, questionText] = match;
      const bestPractice = record['Best Practice for Conducting the Review'] || '';
      const rationale = record['Rationale (Risk Mitigated)'] || '';
      const importance = record['Importance'] || 'Medium';
      
      // Parse section and subcategory
      const { section, category } = parseSection(questionId);
      const subcategory = getSubcategory(questionId, questionText);
      
      // Infer question type
      const questionType = inferQuestionType(questionText, importance);
      
      questionsToInsert.push({
        templateId: 'executive-protection',
        questionId,
        category,
        subcategory,
        question: questionText,
        bestPractice: bestPractice || null,
        rationale: rationale || null,
        importance,
        type: questionType,
        orderIndex: orderIndex++
      });
    }
    
    console.log(`✅ Prepared ${questionsToInsert.length} questions for insertion`);
    
    // Add "Additional Observations" section at the end
    questionsToInsert.push({
      templateId: 'executive-protection',
      questionId: '4.1.1',
      category: 'Additional Observations',
      subcategory: 'Ad-Hoc Interview Notes',
      question: 'Document any additional observations, concerns, or topics discussed during the assessment that were not covered in the structured framework above.',
      bestPractice: 'Use this section to capture important details that emerged during the interview or site visit that don\'t fit into the standard assessment categories. This ensures comprehensive documentation.',
      rationale: 'Assessments often reveal unexpected findings or unique circumstances that require documentation. This catch-all section ensures nothing critical is missed.',
      importance: 'Medium',
      type: 'text',
      orderIndex: orderIndex++
    });
    
    // Insert all questions
    if (questionsToInsert.length > 0) {
      await db.insert(templateQuestions).values(questionsToInsert);
      console.log(`✅ Successfully inserted ${questionsToInsert.length} Executive Protection questions`);
      
      // Show breakdown by section
      const section1Count = questionsToInsert.filter(q => q.questionId.startsWith('1.')).length;
      const section2Count = questionsToInsert.filter(q => q.questionId.startsWith('2.')).length;
      const section3Count = questionsToInsert.filter(q => q.questionId.startsWith('3.')).length;
      
      console.log(`\n📊 Breakdown by section:`);
      console.log(`   Section 1 (OSINT & Digital): ${section1Count} questions`);
      console.log(`   Section 2 (Residential Security): ${section2Count} questions`);
      console.log(`   Section 3 (Executive Office): ${section3Count} questions`);
      
      // Show question type breakdown
      const typeBreakdown: { [key: string]: number } = {};
      questionsToInsert.forEach(q => {
        typeBreakdown[q.type] = (typeBreakdown[q.type] || 0) + 1;
      });
      
      console.log(`\n📋 Question type breakdown:`);
      Object.entries(typeBreakdown).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} questions`);
      });
    }
    
    console.log('\n✅ Executive Protection question seeding complete!');
    return { count: questionsToInsert.length, deletedFacilitySurveyData };
  } catch (error) {
    console.error('❌ Error seeding executive protection questions:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExecutiveSurveyQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedExecutiveSurveyQuestions };
