import { db } from './db';
import { controlLibrary } from '../shared/schema';
import { RETAIL_STORE_QUESTIONS } from './question-configs/retail-store-questions';
import { WAREHOUSE_QUESTIONS } from './question-configs/warehouse-questions';
import { DATA_CENTER_QUESTIONS } from './question-configs/data-center-questions';
import { MANUFACTURING_QUESTIONS } from './question-configs/manufacturing-questions';
import type { QuestionConfig } from './question-configs/retail-store-questions';

async function validateQuestionConfigs() {
  console.log('🔍 Validating question configs against control_library...\n');
  
  // Fetch all controls from database
  const controls = await db.select().from(controlLibrary);
  const controlNames = new Set(controls.map(c => c.name));
  
  let totalIssuesFound = 0;
  
  const templates = [
    { name: 'Retail Store', questions: RETAIL_STORE_QUESTIONS },
    { name: 'Warehouse & Distribution', questions: WAREHOUSE_QUESTIONS },
    { name: 'Data Center', questions: DATA_CENTER_QUESTIONS },
    { name: 'Manufacturing Facility', questions: MANUFACTURING_QUESTIONS }
  ];
  
  for (const template of templates) {
    console.log(`📋 Validating: ${template.name} Questions`);
    console.log('─'.repeat(60));
    
    const missingControls: string[] = [];
    const validControls: string[] = [];
    
    for (const question of template.questions) {
      if (!controlNames.has(question.controlLibraryName)) {
        if (!missingControls.includes(question.controlLibraryName)) {
          missingControls.push(question.controlLibraryName);
        }
        console.log(`  ❌ Question ${question.orderIndex}: Control "${question.controlLibraryName}" not found in control_library`);
        totalIssuesFound++;
      } else {
        if (!validControls.includes(question.controlLibraryName)) {
          validControls.push(question.controlLibraryName);
        }
      }
    }
    
    console.log(`\n  ✅ Valid controls: ${validControls.length} unique`);
    console.log(`  📊 Total questions: ${template.questions.length}`);
    
    if (missingControls.length > 0) {
      console.log(`  ❌ Missing controls: ${missingControls.length}`);
      console.log('\n  Missing control names:');
      missingControls.forEach(c => console.log(`    - "${c}"`));
    }
    console.log('');
  }
  
  console.log('═'.repeat(60));
  if (totalIssuesFound === 0) {
    console.log('✅ All question configs validated successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`  - Retail Store: ${RETAIL_STORE_QUESTIONS.length} questions`);
    console.log(`  - Warehouse: ${WAREHOUSE_QUESTIONS.length} questions`);
    console.log(`  - Data Center: ${DATA_CENTER_QUESTIONS.length} questions`);
    console.log(`  - Manufacturing: ${MANUFACTURING_QUESTIONS.length} questions`);
    console.log(`  - Total: ${RETAIL_STORE_QUESTIONS.length + WAREHOUSE_QUESTIONS.length + DATA_CENTER_QUESTIONS.length + MANUFACTURING_QUESTIONS.length} questions\n`);
    process.exit(0);
  } else {
    console.log(`❌ Validation failed: ${totalIssuesFound} issue(s) found.\n`);
    process.exit(1);
  }
}

validateQuestionConfigs();
