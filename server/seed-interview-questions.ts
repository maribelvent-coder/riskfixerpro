import { db } from './db';
import { executiveInterviewQuestions } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface InterviewQuestion {
  questionNumber: number;
  category: string;
  question: string;
  responseType: 'text' | 'yes-no-text';
  orderIndex: number;
}

const questions: InterviewQuestion[] = [
  // Incident History & Threats (4 questions)
  {
    questionNumber: 1,
    category: 'Incident History & Threats',
    question: 'Have you personally received many irate calls, e-mails, letters, etc., (customers, employees, investors, etc.)? Do you screen or answer your own calls and emails? If so, please state the nature of this communication.',
    responseType: 'yes-no-text',
    orderIndex: 1
  },
  {
    questionNumber: 2,
    category: 'Incident History & Threats',
    question: 'What is the source and nature of the complaints? Any internal complaints from employees?',
    responseType: 'text',
    orderIndex: 2
  },
  {
    questionNumber: 3,
    category: 'Incident History & Threats',
    question: 'Have you received any training on how to handle an irate or unusual call, etc.? If not, how have you handled these types of calls?',
    responseType: 'yes-no-text',
    orderIndex: 3
  },
  {
    questionNumber: 4,
    category: 'Incident History & Threats',
    question: 'If no training, how do you handle these kinds of calls, e-mails, or other correspondence?',
    responseType: 'text',
    orderIndex: 4
  },

  // Executive Protection (3 questions)
  {
    questionNumber: 5,
    category: 'Executive Protection',
    question: 'Do you receive any type of security close protection? If so, under what condition?',
    responseType: 'yes-no-text',
    orderIndex: 5
  },
  {
    questionNumber: 6,
    category: 'Executive Protection',
    question: 'If protection is provided, is it only during work-related hours or does it include personal time (overnight, weekends, holidays, vacations)?',
    responseType: 'text',
    orderIndex: 6
  },
  {
    questionNumber: 7,
    category: 'Executive Protection',
    question: 'What are your feelings and thoughts about the protection you are currently receiving? Any changes you recommend?',
    responseType: 'text',
    orderIndex: 7
  },

  // Public Profile (2 questions)
  {
    questionNumber: 8,
    category: 'Public Profile',
    question: 'Do you notify anyone in Corporate Security if a public speaking engagement is scheduled?',
    responseType: 'yes-no-text',
    orderIndex: 8
  },
  {
    questionNumber: 9,
    category: 'Public Profile',
    question: 'Have you felt the need for close protection at any public events? Please explain.',
    responseType: 'yes-no-text',
    orderIndex: 9
  },

  // Routines & Predictability (2 questions)
  {
    questionNumber: 10,
    category: 'Routines & Predictability',
    question: 'Do you have predictable routines or appointments? (e.g., Workouts in the morning)',
    responseType: 'yes-no-text',
    orderIndex: 10
  },
  {
    questionNumber: 11,
    category: 'Routines & Predictability',
    question: 'Do you frequent any specific restaurants, clubs, or other venues during the work week, or during your personal time?',
    responseType: 'yes-no-text',
    orderIndex: 11
  },

  // Residences (3 questions)
  {
    questionNumber: 12,
    category: 'Residences',
    question: 'What type of security, if any, do you have in place at your residences?',
    responseType: 'text',
    orderIndex: 12
  },
  {
    questionNumber: 13,
    category: 'Residences',
    question: 'If you have security, are you familiar and comfortable with all aspects? Spouse? Family members?',
    responseType: 'yes-no-text',
    orderIndex: 13
  },
  {
    questionNumber: 14,
    category: 'Residences',
    question: 'Do you employ domestic staff? If so, please explain. What type, if any, vetting processes were used prior to their hire. Do you employ any type of persistent screening of these individuals?',
    responseType: 'yes-no-text',
    orderIndex: 14
  },

  // Family (3 questions)
  {
    questionNumber: 15,
    category: 'Family',
    question: 'Has your family received any type of disturbing communication? If so, please explain.',
    responseType: 'yes-no-text',
    orderIndex: 15
  },
  {
    questionNumber: 16,
    category: 'Family',
    question: 'Are there any health issues with family members that require special attention and planning? If so, please describe.',
    responseType: 'yes-no-text',
    orderIndex: 16
  },
  {
    questionNumber: 17,
    category: 'Family',
    question: 'Please describe routine(s) for any school-aged children (i.e., pick up and drop off; activities, day care, etc.)',
    responseType: 'text',
    orderIndex: 17
  },

  // Office Security (7 questions)
  {
    questionNumber: 18,
    category: 'Office Security',
    question: 'What, if any, concerns do you have about safety and security in your office building and the Executive area?',
    responseType: 'text',
    orderIndex: 18
  },
  {
    questionNumber: 19,
    category: 'Office Security',
    question: 'Is your office locked at night? Desk?',
    responseType: 'yes-no-text',
    orderIndex: 19
  },
  {
    questionNumber: 20,
    category: 'Office Security',
    question: 'Do you typically arrive before or after your EA?',
    responseType: 'text',
    orderIndex: 20
  },
  {
    questionNumber: 21,
    category: 'Office Security',
    question: 'What kind of office access does the cleaning staff have to your office and area? Do you know if the cleaning staff is escorted by Security when in or around your office? Do you see Security staff in and around your office area?',
    responseType: 'text',
    orderIndex: 21
  },
  {
    questionNumber: 22,
    category: 'Office Security',
    question: 'If you leave late at night or arrive very early in the morning, do you feel comfortable in and around the building (including the parking lots)?',
    responseType: 'yes-no-text',
    orderIndex: 22
  },
  {
    questionNumber: 23,
    category: 'Office Security',
    question: 'Do you participate in emergency evacuation drills and know your primary and secondary exits?',
    responseType: 'yes-no-text',
    orderIndex: 23
  },
  {
    questionNumber: 24,
    category: 'Office Security',
    question: 'Do you have a panic button at your desk?',
    responseType: 'yes-no-text',
    orderIndex: 24
  },

  // Mail & Package Security (1 question)
  {
    questionNumber: 25,
    category: 'Mail & Package Security',
    question: 'Do you know what to do if you receive a letter, package that looks unusual, or if its contents look suspicious?',
    responseType: 'yes-no-text',
    orderIndex: 25
  },

  // Ground Transportation (3 questions)
  {
    questionNumber: 26,
    category: 'Ground Transportation',
    question: 'Do you utilize a driving service or security drivers? If so, under what circumstances?',
    responseType: 'yes-no-text',
    orderIndex: 26
  },
  {
    questionNumber: 27,
    category: 'Ground Transportation',
    question: 'Do you feel comfortable with your outside car service companies or service?',
    responseType: 'yes-no-text',
    orderIndex: 27
  },
  {
    questionNumber: 28,
    category: 'Ground Transportation',
    question: 'Do you utilize car services when traveling internationally? Please describe.',
    responseType: 'yes-no-text',
    orderIndex: 28
  },

  // Itinerary Management (2 questions)
  {
    questionNumber: 29,
    category: 'Itinerary Management',
    question: 'Who has access to your daily calendar? Do you make your own appointments or does your EA? Please describe.',
    responseType: 'text',
    orderIndex: 29
  },
  {
    questionNumber: 30,
    category: 'Itinerary Management',
    question: 'Are you comfortable with this arrangement? Please explain.',
    responseType: 'yes-no-text',
    orderIndex: 30
  },

  // Travel Security (4 questions)
  {
    questionNumber: 31,
    category: 'Travel Security',
    question: 'Do you make your own travel arrangements? Business and personal?',
    responseType: 'yes-no-text',
    orderIndex: 31
  },
  {
    questionNumber: 32,
    category: 'Travel Security',
    question: 'Who helps you with any needed security on trips?',
    responseType: 'text',
    orderIndex: 32
  },
  {
    questionNumber: 33,
    category: 'Travel Security',
    question: 'If security is provided, do you have good contact with the security team throughout the trip?',
    responseType: 'yes-no-text',
    orderIndex: 33
  },
  {
    questionNumber: 34,
    category: 'Travel Security',
    question: 'Are you pleased with the level and quality of security you have received while traveling?',
    responseType: 'yes-no-text',
    orderIndex: 34
  },
];

async function seedInterviewQuestions() {
  try {
    console.log('🔄 Starting Executive Interview question seeding...');

    // Check if questions already exist
    const existing = await db.select().from(executiveInterviewQuestions).limit(1);
    
    if (existing.length > 0) {
      console.log('🔍 Questions already exist. Removing existing questions...');
      await db.delete(executiveInterviewQuestions);
    }

    // Insert new questions
    await db.insert(executiveInterviewQuestions).values(questions);
    
    console.log(`✅ Successfully inserted ${questions.length} Executive Interview questions`);
    
    // Breakdown by category
    const categoryCounts: Record<string, number> = {};
    questions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });

    console.log('\n📊 Breakdown by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });

    // Type breakdown
    const textCount = questions.filter(q => q.responseType === 'text').length;
    const yesNoTextCount = questions.filter(q => q.responseType === 'yes-no-text').length;
    
    console.log('\n📋 Question type breakdown:');
    console.log(`   Text: ${textCount} questions`);
    console.log(`   Yes/No + Text: ${yesNoTextCount} questions`);

    console.log('\n✅ Executive Interview question seeding complete!');
    return questions.length;
  } catch (error) {
    console.error('❌ Error seeding interview questions:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedInterviewQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedInterviewQuestions };
