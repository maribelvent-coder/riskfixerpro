import { db } from './db';
import { templateQuestions } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRowV2 {
  'Question ID': string;
  'Question Text': string;
  'Best Practice': string;
  'Rationale': string;
  'Importance': string;
}

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

function getSubcategory(questionId: string): string {
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
  
  return '';
}

async function seedExecutiveSurveyQuestionsV2() {
  console.log('🔄 Starting Executive Protection V2 question seeding...');
  
  let deletedFacilitySurveyData = false;
  
  try {
    console.log('🔍 Finding existing executive protection template questions...');
    const existingQuestions = await db.select({ id: templateQuestions.id })
      .from(templateQuestions)
      .where(eq(templateQuestions.templateId, 'executive-protection'));
    
    const templateQuestionIds = existingQuestions.map((q: { id: string }) => q.id);
    console.log(`📋 Found ${templateQuestionIds.length} existing template questions`);
    
    if (templateQuestionIds.length > 0) {
      console.log('🗑️  Removing facility survey questions that reference template...');
      const { facilitySurveyQuestions } = await import('../shared/schema');
      const { inArray } = await import('drizzle-orm');
      
      await db.delete(facilitySurveyQuestions)
        .where(inArray(facilitySurveyQuestions.templateQuestionId, templateQuestionIds));
      
      deletedFacilitySurveyData = true;
      console.log('✅ Removed dependent facility survey questions');
    }
    
    console.log('🗑️  Removing existing executive protection template questions...');
    await db.delete(templateQuestions)
      .where(eq(templateQuestions.templateId, 'executive-protection'));
    
    const csvPath = path.join(__dirname, 'data/executive-survey-questions-v2.csv');
    console.log(`📖 Reading CSV from: ${csvPath}`);
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as CSVRowV2[];
    
    console.log(`📊 Parsed ${records.length} rows from CSV`);
    
    const questionsToInsert = [];
    let orderIndex = 0;
    
    for (const record of records) {
      const questionId = record['Question ID'];
      const questionText = record['Question Text'];
      const bestPractice = record['Best Practice'];
      const rationale = record['Rationale'];
      const importance = record['Importance'] || 'Medium';
      
      if (!questionId || !questionText) {
        continue;
      }
      
      const { category } = parseSection(questionId);
      const subcategory = getSubcategory(questionId);
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
    
    if (questionsToInsert.length > 0) {
      await db.insert(templateQuestions).values(questionsToInsert);
      console.log(`✅ Successfully inserted ${questionsToInsert.length} Executive Protection questions`);
      
      const section1Count = questionsToInsert.filter(q => q.questionId.startsWith('1.')).length;
      const section2Count = questionsToInsert.filter(q => q.questionId.startsWith('2.')).length;
      const section3Count = questionsToInsert.filter(q => q.questionId.startsWith('3.')).length;
      const section4Count = questionsToInsert.filter(q => q.questionId.startsWith('4.')).length;
      
      console.log(`\n📊 Breakdown by section:`);
      console.log(`   Section 1 (OSINT & Digital/Travel): ${section1Count} questions`);
      console.log(`   Section 2 (Residential Security): ${section2Count} questions`);
      console.log(`   Section 3 (Executive Office): ${section3Count} questions`);
      console.log(`   Section 4 (Additional Observations): ${section4Count} questions`);
      
      const typeBreakdown: { [key: string]: number } = {};
      questionsToInsert.forEach(q => {
        typeBreakdown[q.type] = (typeBreakdown[q.type] || 0) + 1;
      });
      
      console.log(`\n📋 Question type breakdown:`);
      Object.entries(typeBreakdown).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} questions`);
      });
    }
    
    console.log('\n✅ Executive Protection V2 question seeding complete!');
    return { count: questionsToInsert.length, deletedFacilitySurveyData };
  } catch (error) {
    console.error('❌ Error seeding executive protection questions:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedExecutiveSurveyQuestionsV2()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedExecutiveSurveyQuestionsV2 };
