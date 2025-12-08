/**
 * Seed Manufacturing Facility Interview Questions
 * 
 * Seeds template_questions from the authoritative manufacturing-interview-questionnaire.ts source
 */

import { db } from './db';
import { templateQuestions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { MANUFACTURING_INTERVIEW_QUESTIONS, InterviewQuestion } from './services/manufacturing-interview-questionnaire';

const TEMPLATE_ID = 'manufacturing';

function mapQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'multiple_choice': 'multiple_choice',
    'yes_no': 'yes_no',
    'rating': 'rating',
    'text': 'text',
    'checklist': 'multiple_choice',
    'number': 'number',
  };
  return typeMap[type] || 'text';
}

async function seedManufacturingQuestions() {
  console.log('=== Seeding Manufacturing Facility Interview Questions ===');
  
  console.log('Clearing existing manufacturing questions...');
  await db.delete(templateQuestions).where(eq(templateQuestions.templateId, TEMPLATE_ID));
  console.log('Cleared existing questions');
  
  const allQuestions: Array<{
    question: InterviewQuestion;
    parentId?: string;
  }> = [];
  
  for (const q of MANUFACTURING_INTERVIEW_QUESTIONS) {
    allQuestions.push({ question: q });
    
    if (q.followUpQuestions) {
      for (const followUp of q.followUpQuestions) {
        allQuestions.push({ question: followUp, parentId: q.id });
      }
    }
  }
  
  console.log(`Processing ${allQuestions.length} questions (including follow-ups)...`);
  
  let successCount = 0;
  let withOptionsCount = 0;
  
  for (const { question, parentId } of allQuestions) {
    try {
      const hasOptions = question.options && question.options.length > 0;
      
      await db.insert(templateQuestions).values({
        templateId: TEMPLATE_ID,
        questionId: question.id,
        category: question.section,
        subcategory: null,
        question: question.questionText,
        type: mapQuestionType(question.questionType),
        options: hasOptions ? question.options : null,
        required: question.required,
        orderIndex: successCount + 1,
        riskWeight: question.riskWeight,
        polarity: question.polarity,
        badAnswers: question.badAnswers || null,
        riskIndicators: question.riskIndicators || null,
        informsThreat: question.informsThreat || null,
        showWhenQuestionId: parentId || null,
        showWhenAnswer: question.condition?.expectedValue 
          ? (Array.isArray(question.condition.expectedValue) 
              ? question.condition.expectedValue.join(',') 
              : question.condition.expectedValue)
          : null,
      });
      
      successCount++;
      if (hasOptions) withOptionsCount++;
      
    } catch (error) {
      console.error(`Failed to insert question ${question.id}:`, error);
    }
  }
  
  console.log(`\n=== Seeding Complete ===`);
  console.log(`Total questions seeded: ${successCount}`);
  console.log(`Questions with options: ${withOptionsCount}`);
  console.log(`Template ID: ${TEMPLATE_ID}`);
}

seedManufacturingQuestions()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
