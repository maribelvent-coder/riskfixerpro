import { db } from './db';
import { templateQuestions } from '../shared/schema';
import { eq } from 'drizzle-orm';

// ASIS International facility security questions for office buildings
const OFFICE_BUILDING_QUESTIONS = [
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
    console.log('Starting facility template questions seed...');
    
    // Delete existing questions for office-building template
    await db.delete(templateQuestions)
      .where(eq(templateQuestions.templateId, 'office-building'));
    
    console.log('Cleared existing office-building template questions');
    
    // Insert new questions
    const inserted = await db.insert(templateQuestions)
      .values(OFFICE_BUILDING_QUESTIONS)
      .returning();
    
    console.log(`✓ Seeded ${inserted.length} facility survey questions for office-building template`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding facility questions:', error);
    process.exit(1);
  }
}

seedFacilityQuestions();
