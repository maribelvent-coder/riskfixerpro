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
  
  if (sectionNum === 1) {
    return {
      section: 1,
      category: 'OSINT & Digital Footprint Analysis'
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
  // Section 1 subcategories
  if (questionId.startsWith('1.1')) return 'Open-Source Intelligence (OSINT) & Digital Footprint';
  if (questionId.startsWith('1.2')) return 'Social Media Review (Executive & Family)';
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

async function seedExecutiveProtectionQuestions() {
  console.log('🔄 Starting Executive Protection question seeding...');
  
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
      
      console.log('✅ Removed dependent facility survey questions');
    }
    
    // Step 3: Now remove existing executive protection template questions
    console.log('🗑️  Removing existing executive protection template questions...');
    await db.delete(templateQuestions)
      .where(eq(templateQuestions.templateId, 'executive-protection'));
    
    // Step 2: Read and parse CSV
    const csvPath = path.join(__dirname, '../attached_assets/Executive Survey_1762263855489.csv');
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
  } catch (error) {
    console.error('❌ Error seeding executive protection questions:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExecutiveProtectionQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedExecutiveProtectionQuestions };
