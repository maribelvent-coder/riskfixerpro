/**
 * Seed EP Part 2 - Residential Security Assessment Questions
 * Seeds 72 questions across 12 sections to template_questions
 */

import { db } from './db';
import { templateQuestions } from '@shared/schema';
import { eq, and, like } from 'drizzle-orm';
import RESIDENTIAL_QUESTIONNAIRE, { 
  ResidentialInterviewQuestion,
  getAllQuestionsFlattened 
} from './data/ep-residential-assessment-questionnaire';

async function seedEPPart2Questions() {
  console.log('Seeding EP Part 2 - Residential Security Assessment questions...');
  
  // Clear existing EP Part 2 questions (res_ prefix)
  await db.delete(templateQuestions).where(
    and(
      eq(templateQuestions.templateId, 'executive-protection'),
      like(templateQuestions.questionId, 'res_%')
    )
  );
  console.log('Cleared existing EP Part 2 questions');
  
  // Get all questions including follow-ups
  const allQuestions = getAllQuestionsFlattened();
  
  // Get max order_index from existing EP questions (Part 1)
  const existingQuestions = await db.select()
    .from(templateQuestions)
    .where(eq(templateQuestions.templateId, 'executive-protection'));
  
  const maxOrderIndex = existingQuestions.length > 0 
    ? Math.max(...existingQuestions.map(q => q.orderIndex || 0))
    : 0;
  
  console.log(`Starting Part 2 at orderIndex ${maxOrderIndex + 1}`);
  
  // Map section names to Part 2 categories for frontend
  const sectionMapping: Record<string, string> = {
    'Property Profile & Environment': 'Residential Security - Property Profile',
    'Perimeter Security & Boundaries': 'Residential Security - Perimeter',
    'Exterior Lighting': 'Residential Security - Lighting',
    'Landscaping & Natural Surveillance': 'Residential Security - Landscaping',
    'Entry Points - Doors': 'Residential Security - Doors',
    'Entry Points - Windows': 'Residential Security - Windows',
    'Garage & Vehicle Security': 'Residential Security - Vehicles',
    'Alarm & Intrusion Detection': 'Residential Security - Alarms',
    'CCTV & Video Surveillance': 'Residential Security - Surveillance',
    'Interior Security': 'Residential Security - Interior',
    'Safe Room & Emergency Preparedness': 'Residential Security - Safe Room',
    'Monitoring & Response': 'Residential Security - Monitoring',
  };
  
  // Insert questions
  let orderIndex = maxOrderIndex + 1;
  let insertedCount = 0;
  
  for (const q of allQuestions) {
    const category = sectionMapping[q.section] || q.section;
    
    // Format options array for database storage
    const optionsArray = q.options?.map(opt => opt.label) || null;
    
    await db.insert(templateQuestions).values({
      templateId: 'executive-protection',
      questionId: q.id,
      question: q.questionText,
      category: category,
      type: q.questionType,
      options: optionsArray,
      orderIndex: orderIndex++,
      importance: q.riskWeight >= 4 ? 'Critical' : 
                  q.riskWeight >= 3 ? 'High' : 
                  q.riskWeight >= 2 ? 'Medium' : 'Low',
      rationale: q.helpText || null,
    });
    insertedCount++;
  }
  
  console.log(`Seeded ${insertedCount} EP Part 2 questions`);
  
  // Verify
  const count = await db.select().from(templateQuestions)
    .where(
      and(
        eq(templateQuestions.templateId, 'executive-protection'),
        like(templateQuestions.questionId, 'res_%')
      )
    );
  
  const withOptions = count.filter(q => q.options !== null);
  console.log(`Verified: ${count.length} Part 2 questions, ${withOptions.length} with options`);
  
  // Show section breakdown
  const bySection: Record<string, number> = {};
  for (const q of count) {
    bySection[q.category || 'Unknown'] = (bySection[q.category || 'Unknown'] || 0) + 1;
  }
  console.log('Questions by section:');
  for (const [section, cnt] of Object.entries(bySection)) {
    console.log(`  ${section}: ${cnt}`);
  }
}

seedEPPart2Questions()
  .then(() => {
    console.log('EP Part 2 questions seeded successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding EP Part 2 questions:', err);
    process.exit(1);
  });
