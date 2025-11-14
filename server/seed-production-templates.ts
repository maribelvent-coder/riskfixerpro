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
  
  if (lowerQuestion.includes('what') || 
      lowerQuestion.includes('describe') ||
      lowerQuestion.includes('how are') ||
      lowerQuestion.includes('how is')) {
    return 'text';
  }
  
  if (lowerQuestion.includes('visible') || 
      lowerQuestion.includes('imagery') ||
      lowerQuestion.includes('inspect') ||
      lowerQuestion.includes('physical')) {
    return 'photo-text';
  }
  
  if (lowerQuestion.includes('is there') ||
      lowerQuestion.includes('does the') ||
      lowerQuestion.includes('are there') ||
      lowerQuestion.includes('has a')) {
    return 'yes-no';
  }
  
  if (importance === 'Critical') {
    return 'rating';
  }
  
  return 'yes-no';
}

// Parse section from question ID
function parseSection(questionId: string): { section: number; category: string } {
  const sectionNum = parseInt(questionId.charAt(0));
  
  if (questionId === '1.1.1' || questionId === '1.1.3' || questionId.startsWith('1.2')) {
    return {
      section: 1,
      category: 'Digital Footprint Analysis'
    };
  }
  
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
  if (questionId === '1.1.1' || questionId === '1.1.3') {
    return 'PII & Dark Web Exposure';
  }
  
  if (questionId.startsWith('1.2')) {
    return 'Social Media Review (Executive & Family)';
  }
  
  if (questionId === '1.1.2') {
    return 'Residential Physical Security';
  }
  
  if (questionId.startsWith('1.1')) return 'Open-Source Intelligence (OSINT)';
  if (questionId.startsWith('1.3')) return 'Personal Practices & Pattern of Life';
  if (questionId.startsWith('1.4')) return 'Travel Security & Advance Work';
  if (questionId.startsWith('1.5')) return 'Secure Transportation Protocols';
  if (questionId.startsWith('1.6')) return 'Travel Digital Security Hygiene';
  
  if (questionId.startsWith('2.1')) return 'Perimeter Security (CPTED & Landscaping)';
  if (questionId.startsWith('2.2')) return 'Perimeter Security (Physical Barriers & Lighting)';
  if (questionId.startsWith('2.3')) return 'Access Control & Physical Hardening';
  if (questionId.startsWith('2.4')) return 'Interior Security Systems (Alarm, CCTV, PIDS)';
  if (questionId.startsWith('2.5')) return 'Specialized Residential Protections';
  if (questionId.startsWith('2.6')) return 'Residential Emergency & Response Planning';
  
  if (questionId.startsWith('3.1')) return 'Executive Floor Physical Security & CPTED';
  if (questionId.startsWith('3.2')) return 'Executive Access Control (RBAC)';
  if (questionId.startsWith('3.3')) return 'Visitor Management & Control Protocols';
  if (questionId.startsWith('3.4')) return 'Secure Communications & Information Handling';
  if (questionId.startsWith('3.5')) return 'Executive Emergency Evacuation & Shelter-in-Place';
  
  return 'Additional Observations';
}

async function seedProductionTemplateQuestions() {
  console.log('🔒 PRODUCTION TEMPLATE SEEDING SCRIPT');
  console.log('=====================================');
  console.log('This script ONLY populates the template_questions table.');
  console.log('It will NOT touch users, organizations, assessments, or any user data.');
  console.log('');
  
  // Safety check
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  console.log('📋 Reading executive survey questions CSV...');
  const csvPath = path.join(__dirname, 'data', 'executive-survey-questions.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }
  
  let csvContent = fs.readFileSync(csvPath, 'utf-8');
  csvContent = csvContent.replace(/^\uFEFF/, ''); // Remove BOM
  
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as CSVRow[];
  
  console.log(`Found ${rows.length} total rows in CSV`);
  
  const questionsToInsert: any[] = [];
  let orderIndex = 1;
  
  for (const row of rows) {
    const checklistItem = row['Checklist Item']?.trim();
    if (!checklistItem) continue;
    
    // Only process actual questions (format: X.X.X: Question text)
    const questionMatch = checklistItem.match(/^(\d+\.\d+\.\d+):\s*(.+)$/);
    if (!questionMatch) continue;
    
    const questionId = questionMatch[1];
    const questionText = questionMatch[2].trim();
    const bestPractice = row['Best Practice for Conducting the Review']?.trim() || '';
    const rationale = row['Rationale (Risk Mitigated)']?.trim() || '';
    const importance = row['Importance']?.trim() || 'Medium';
    
    const { section, category } = parseSection(questionId);
    const subcategory = getSubcategory(questionId, questionText);
    const type = inferQuestionType(questionText, importance);
    
    questionsToInsert.push({
      templateId: 'executive-protection',
      questionId,
      category,
      subcategory,
      question: questionText,
      bestPractice,
      rationale,
      importance,
      type,
      orderIndex: orderIndex++,
    });
    
    console.log(`  ✓ ${questionId}: ${questionText.substring(0, 60)}...`);
  }
  
  console.log(`\n📊 Parsed ${questionsToInsert.length} questions from CSV`);
  
  // Check current state
  console.log('\n🔍 Checking current template_questions table...');
  const existing = await db.select().from(templateQuestions).where(eq(templateQuestions.templateId, 'executive-protection'));
  console.log(`Found ${existing.length} existing executive-protection questions`);
  
  if (existing.length > 0) {
    console.log('⚠️  Template questions already exist. Deleting old questions...');
    await db.delete(templateQuestions).where(eq(templateQuestions.templateId, 'executive-protection'));
    console.log('✓ Old questions deleted');
  }
  
  // Insert questions
  console.log('\n💾 Inserting new template questions...');
  if (questionsToInsert.length > 0) {
    await db.insert(templateQuestions).values(questionsToInsert);
    console.log(`✅ Successfully inserted ${questionsToInsert.length} template questions`);
  }
  
  // Verify
  const final = await db.select().from(templateQuestions).where(eq(templateQuestions.templateId, 'executive-protection'));
  console.log(`\n✅ Verification: template_questions now has ${final.length} rows for executive-protection`);
  
  console.log('\n🎉 PRODUCTION TEMPLATE SEEDING COMPLETE');
  console.log('Next step: Test creating an executive assessment in production');
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductionTemplateQuestions()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error during seeding:', error);
      process.exit(1);
    });
}

export { seedProductionTemplateQuestions };
