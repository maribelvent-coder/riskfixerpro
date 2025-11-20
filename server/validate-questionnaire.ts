/**
 * Validation script for office building interview questionnaire
 * Ensures all threat/control mappings reference valid library entries
 */
import { db } from './db';
import { threatLibrary, controlLibrary } from '../shared/schema';
import { OFFICE_BUILDING_INTERVIEW_QUESTIONS } from './data/office-building-interview-questionnaire';

async function validateQuestionnaire() {
  console.log('🔍 Validating Office Building Interview Questionnaire...\n');
  
  // Load threat and control libraries from database
  const threats = await db.select().from(threatLibrary);
  const controls = await db.select().from(controlLibrary);
  
  const threatNames = new Set(threats.map(t => t.name));
  const controlNames = new Set(controls.map(c => c.name));
  
  console.log(`📚 Loaded ${threats.length} threats and ${controls.length} controls from database\n`);
  
  let issuesFound = 0;
  const allThreatMappings = new Set<string>();
  const allControlMappings = new Set<string>();
  
  // Validate each question
  for (const question of OFFICE_BUILDING_INTERVIEW_QUESTIONS) {
    const questionIssues: string[] = [];
    
    // Check threat mappings
    for (const threat of question.threatMappings) {
      allThreatMappings.add(threat);
      if (!threatNames.has(threat)) {
        questionIssues.push(`❌ Threat not found: "${threat}"`);
        issuesFound++;
      }
    }
    
    // Check control mappings
    for (const control of question.controlMappings) {
      allControlMappings.add(control);
      if (!controlNames.has(control)) {
        questionIssues.push(`❌ Control not found: "${control}"`);
        issuesFound++;
      }
    }
    
    // Report issues for this question
    if (questionIssues.length > 0) {
      console.log(`Question ${question.id}: ${question.question.substring(0, 60)}...`);
      questionIssues.forEach(issue => console.log(`  ${issue}`));
      console.log('');
    }
  }
  
  // Summary
  console.log('═'.repeat(70));
  console.log(`\n📊 Summary:`);
  console.log(`  Total questions: ${OFFICE_BUILDING_INTERVIEW_QUESTIONS.length}`);
  console.log(`  Unique threats referenced: ${allThreatMappings.size}`);
  console.log(`  Unique controls referenced: ${allControlMappings.size}`);
  
  if (issuesFound === 0) {
    console.log('\n✅ All questionnaire mappings validated successfully!');
    console.log('   Every threat and control reference exists in the database.\n');
    process.exit(0);
  } else {
    console.log(`\n❌ Validation failed: ${issuesFound} issue(s) found.\n`);
    process.exit(1);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateQuestionnaire()
    .catch((error) => {
      console.error('❌ Error during validation:', error);
      process.exit(1);
    });
}

export { validateQuestionnaire };
