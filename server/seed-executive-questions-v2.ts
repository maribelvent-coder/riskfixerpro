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
  
  if (lowerQuestion.includes('scale of 1-10') || 
      lowerQuestion.includes('on a scale')) {
    return 'rating';
  }
  
  if (lowerQuestion.includes('what') || 
      lowerQuestion.includes('describe') ||
      lowerQuestion.includes('how would you describe') ||
      lowerQuestion.includes('which')) {
    return 'text';
  }
  
  if (lowerQuestion.includes('visible') || 
      lowerQuestion.includes('imagery') ||
      lowerQuestion.includes('inspect') ||
      lowerQuestion.includes('photograph')) {
    return 'photo-text';
  }
  
  if (lowerQuestion.includes('do you') ||
      lowerQuestion.includes('have you') ||
      lowerQuestion.includes('is there') ||
      lowerQuestion.includes('does the') ||
      lowerQuestion.includes('are there') ||
      lowerQuestion.includes('are you') ||
      lowerQuestion.includes('has a')) {
    return 'yes-no';
  }
  
  if (importance === 'Critical') {
    return 'rating';
  }
  
  return 'yes-no';
}

// Part 1 Section mappings (P1.S1 - P1.S8)
const part1SectionCategories: { [key: string]: { category: string; subcategory: string } } = {
  'S1': { category: 'Threat Assessment & Personal Concerns', subcategory: 'Baseline Threat Perception' },
  'S2': { category: 'Public Profile & Media Exposure', subcategory: 'Digital Footprint Analysis' },
  'S3': { category: 'Daily Routines & Predictability', subcategory: 'Pattern of Life Analysis' },
  'S4': { category: 'Family Vulnerability Assessment', subcategory: 'Extended Attack Surface' },
  'S5': { category: 'Current Security Posture', subcategory: 'Personal Security Baseline' },
  'S6': { category: 'Travel Security', subcategory: 'Business Travel Patterns' },
  'S7': { category: 'Digital Security Hygiene', subcategory: 'Cyber Security Practices' },
  'S8': { category: 'Incident History & Response', subcategory: 'Historical Threat Analysis' },
};

// Part 2 Section mappings (P2.S9 - P2.S21)
const part2SectionCategories: { [key: string]: { category: string; subcategory: string } } = {
  'S9': { category: 'Residential Security - Perimeter', subcategory: 'Property Boundaries & Access Control' },
  'S10': { category: 'Residential Security - Exterior', subcategory: 'Building Envelope & Entry Points' },
  'S11': { category: 'Residential Security - Interior', subcategory: 'Interior Security Systems' },
  'S12': { category: 'Residential Security - Safe Room', subcategory: 'Emergency Refuge Planning' },
  'S13': { category: 'Residential Security - Lighting', subcategory: 'Security Lighting Assessment' },
  'S14': { category: 'Residential Security - Surveillance', subcategory: 'CCTV & Monitoring Systems' },
  'S15': { category: 'Residential Security - Alarms', subcategory: 'Intrusion Detection Systems' },
  'S16': { category: 'Residential Security - Staff', subcategory: 'Household Staff Vetting' },
  'S17': { category: 'Residential Security - Emergency', subcategory: 'Emergency Response Planning' },
  'S18': { category: 'Residential Security - Landscaping', subcategory: 'CPTED & Natural Surveillance' },
  'S19': { category: 'Residential Security - Vehicles', subcategory: 'Garage & Vehicle Security' },
  'S20': { category: 'Residential Security - Communications', subcategory: 'Secure Communications' },
  'S21': { category: 'Residential Security - Technical', subcategory: 'TSCM & Counter-Surveillance' },
};

function parseSection(questionId: string): { part: number; section: string; category: string; subcategory: string } {
  // Parse P#.S#.Q# format
  const match = questionId.match(/^P(\d+)\.S(\d+)\.Q(\d+)$/);
  if (!match) {
    return { part: 0, section: 'Unknown', category: 'Unknown', subcategory: '' };
  }
  
  const partNum = parseInt(match[1]);
  const sectionKey = `S${match[2]}`;
  
  if (partNum === 1 && part1SectionCategories[sectionKey]) {
    return {
      part: 1,
      section: sectionKey,
      ...part1SectionCategories[sectionKey]
    };
  }
  
  if (partNum === 2 && part2SectionCategories[sectionKey]) {
    return {
      part: 2,
      section: sectionKey,
      ...part2SectionCategories[sectionKey]
    };
  }
  
  return { 
    part: partNum, 
    section: sectionKey, 
    category: `Part ${partNum} - ${sectionKey}`, 
    subcategory: '' 
  };
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
      
      const { part, category, subcategory } = parseSection(questionId);
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
      questionId: 'P3.S1.Q1',
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
      
      const part1Count = questionsToInsert.filter(q => q.questionId.startsWith('P1.')).length;
      const part2Count = questionsToInsert.filter(q => q.questionId.startsWith('P2.')).length;
      const part3Count = questionsToInsert.filter(q => q.questionId.startsWith('P3.')).length;
      
      console.log(`\n📊 Breakdown by part:`);
      console.log(`   Part 1 (Executive Interview): ${part1Count} questions`);
      console.log(`   Part 2 (Residential Security): ${part2Count} questions`);
      console.log(`   Part 3 (Additional Observations): ${part3Count} questions`);
      
      // Show category breakdown
      const categoryBreakdown: { [key: string]: number } = {};
      questionsToInsert.forEach(q => {
        categoryBreakdown[q.category] = (categoryBreakdown[q.category] || 0) + 1;
      });
      
      console.log(`\n📋 Category breakdown:`);
      Object.entries(categoryBreakdown).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} questions`);
      });
      
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
