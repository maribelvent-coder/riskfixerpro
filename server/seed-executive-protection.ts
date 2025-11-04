import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from './db';
import { templateQuestions } from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

interface CSVRow {
  'Checklist Item': string;
  'Best Practice for Conducting the Review': string;
  'Rationale (Risk Mitigated)': string;
  'Importance': string;
}

async function seedExecutiveProtectionQuestions() {
  console.log('📋 Parsing Executive Protection Survey CSV...');
  
  // Read CSV and remove BOM if present
  let csvContent = fs.readFileSync('attached_assets/Executive Survey_1762263855489.csv', 'utf-8');
  csvContent = csvContent.replace(/^\uFEFF/, ''); // Remove BOM
  
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as CSVRow[];
  
  console.log(`Found ${rows.length} total rows in CSV`);

  const questionsToInsert: any[] = [];
  let currentCategory = '';
  let currentSubcategory = '';
  let orderIndex = 1;

  for (const row of rows) {
    const checklistItem = row['Checklist Item']?.trim();
    if (!checklistItem) {
      continue;
    }

    // Check if this is a section header (X.X: format)
    const sectionMatch = checklistItem.match(/^(\d+\.\d+):\s*(.+)$/);
    if (sectionMatch) {
      currentCategory = sectionMatch[2].trim();
      currentSubcategory = '';
      console.log(`  📂 Section: ${currentCategory}`);
      continue;
    }

    // Check if this is a subsection (X.X.X: format with question)
    const questionMatch = checklistItem.match(/^(\d+\.\d+\.\d+):\s*(.+)$/);
    if (questionMatch) {
      const questionId = questionMatch[1];
      const questionText = questionMatch[2].trim();
      const bestPractice = row['Best Practice for Conducting the Review']?.trim() || '';
      const rationale = row['Rationale (Risk Mitigated)']?.trim() || '';
      const importance = row['Importance']?.trim() || 'Medium';

      questionsToInsert.push({
        templateId: 'executive-protection',
        questionId,
        category: currentCategory,
        subcategory: currentSubcategory,
        question: questionText,
        bestPractice,
        rationale,
        importance,
        type: 'yes-no',
        orderIndex: orderIndex++,
      });

      console.log(`    ✓ ${questionId}: ${questionText.substring(0, 60)}...`);
    }
  }

  console.log(`\n📊 Found ${questionsToInsert.length} questions to insert`);

  // Delete existing executive-protection questions
  console.log('\n🗑️  Removing existing executive-protection questions...');
  await db.delete(templateQuestions).where(
    sql`template_id = 'executive-protection'`
  );

  // Insert new questions
  console.log('💾 Inserting questions into database...');
  if (questionsToInsert.length > 0) {
    await db.insert(templateQuestions).values(questionsToInsert);
  }

  console.log(`✅ Successfully seeded ${questionsToInsert.length} Executive Protection questions!`);
}

seedExecutiveProtectionQuestions()
  .then(() => {
    console.log('✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  });
