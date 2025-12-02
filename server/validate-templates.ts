import { db } from './db';
import { threatLibrary, controlLibrary } from '../shared/schema';
import { ASSESSMENT_TEMPLATES } from '../shared/templates';
import { eq } from 'drizzle-orm';

async function validateTemplates() {
  console.log('🔍 Validating template alignment with threat_library and control_library...\n');
  
  // Fetch all threats and controls from database
  const threats = await db.select().from(threatLibrary);
  const controls = await db.select().from(controlLibrary);
  
  const threatNames = new Set(threats.map(t => t.name));
  const controlNames = new Set(controls.map(c => c.name));
  
  let issuesFound = 0;
  
  for (const template of ASSESSMENT_TEMPLATES) {
    console.log(`\n📋 Template: ${template.name} (${template.id})`);
    console.log('─'.repeat(60));
    
    // Check commonRisks
    console.log('\n  🎯 Validating commonRisks:');
    const missingThreats: string[] = [];
    const duplicateThreats = new Set<string>();
    const seenThreats = new Set<string>();
    
    for (const risk of template.commonRisks) {
      if (seenThreats.has(risk)) {
        duplicateThreats.add(risk);
        issuesFound++;
      }
      seenThreats.add(risk);
      
      if (!threatNames.has(risk)) {
        missingThreats.push(risk);
        issuesFound++;
      }
    }
    
    if (duplicateThreats.size > 0) {
      console.log(`    ⚠️  Duplicate threats found: ${Array.from(duplicateThreats).join(', ')}`);
    }
    
    if (missingThreats.length > 0) {
      console.log(`    ❌ Missing from threat_library (${missingThreats.length}):`);
      missingThreats.forEach(t => console.log(`       - "${t}"`));
    } else {
      console.log(`    ✅ All ${template.commonRisks.length} threats found in threat_library`);
    }
    
    // Check typicalControls
    console.log('\n  🛡️  Validating typicalControls:');
    const missingControls: string[] = [];
    const duplicateControls = new Set<string>();
    const seenControls = new Set<string>();
    
    for (const control of template.typicalControls) {
      if (seenControls.has(control)) {
        duplicateControls.add(control);
        issuesFound++;
      }
      seenControls.add(control);
      
      if (!controlNames.has(control)) {
        missingControls.push(control);
        issuesFound++;
      }
    }
    
    if (duplicateControls.size > 0) {
      console.log(`    ⚠️  Duplicate controls found: ${Array.from(duplicateControls).join(', ')}`);
    }
    
    if (missingControls.length > 0) {
      console.log(`    ❌ Missing from control_library (${missingControls.length}):`);
      missingControls.forEach(c => console.log(`       - "${c}"`));
    } else {
      console.log(`    ✅ All ${template.typicalControls.length} controls found in control_library`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  if (issuesFound === 0) {
    console.log('✅ All templates validated successfully! No issues found.\n');
    process.exit(0);
  } else {
    console.log(`❌ Validation failed: ${issuesFound} issue(s) found.\n`);
    process.exit(1);
  }
}

validateTemplates();
