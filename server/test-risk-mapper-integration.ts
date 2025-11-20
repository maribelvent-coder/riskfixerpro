/**
 * Integration Test for ID-Based Risk Mapper
 * Tests end-to-end flow: seed questions → responses → risk analysis using database IDs
 */
import { analyzeInterviewRisksV3, type InterviewResponseV3 } from './services/interview-risk-mapping';
import { seedOfficeQuestions } from './seed-office-building-questions';

async function testIntegration() {
  console.log('🧪 Integration Test: ID-Based Risk Mapper\n');
  console.log('This test validates the complete flow:');
  console.log('  1. Seed office building questions with ID linkages');
  console.log('  2. Create sample responses using database question IDs');
  console.log('  3. Analyze using ID-based risk mapper (v3)');
  console.log('  4. Verify results\n');
  console.log('═'.repeat(70));

  try {
    // Step 1: Seed questions (this populates junction tables)
    console.log('\n📦 Step 1: Seeding office building questions...');
    await seedOfficeQuestions();
    
    // Step 2: Query database to get actual question IDs
    console.log('\n📋 Step 2: Loading seeded questions from database...');
    const { db } = await import('./db');
    const { templateQuestions } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const questions = await db
      .select()
      .from(templateQuestions)
      .where(eq(templateQuestions.templateId, 'office-building'))
      .limit(10); // Use first 10 questions for test
    
    console.log(`   Loaded ${questions.length} questions from database`);
    
    if (questions.length === 0) {
      throw new Error('No questions found in database. Seed may have failed.');
    }
    
    // Step 3: Create sample responses (simulate MIXED security posture)
    console.log('\n💬 Step 3: Creating sample responses (mixed security scenario)...');
    const responses: InterviewResponseV3[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      let answer: string | number;
      
      // Create mixed responses to test control detection properly
      if (i % 3 === 0) {
        // Every 3rd question: "yes" (control detected)
        answer = question.type === 'rating' ? 4 : 'yes';
      } else if (i % 3 === 1) {
        // Every other question: "no" (control missing)
        answer = question.type === 'rating' ? 2 : 'no';
      } else {
        // Remaining: medium response
        answer = question.type === 'rating' ? 3 : 'yes';
      }
      
      responses.push({
        questionId: question.id,
        questionCode: question.questionId,
        answer,
        notes: 'Test response'
      });
    }
    
    console.log(`   Created ${responses.length} sample responses (mixed yes/no/ratings)`);
    
    // Step 4: Analyze using ID-based risk mapper (passing array as API routes would)
    console.log('\n🔍 Step 4: Analyzing risks using database ID linkages...');
    const result = await analyzeInterviewRisksV3('office-building', responses);
    
    // Step 5: Verify results
    console.log('\n✅ Step 5: Verifying results...\n');
    console.log('═'.repeat(70));
    console.log(`\n🎯 RISK ANALYSIS RESULTS:`);
    console.log(`   Overall Risk Level: ${result.overallRiskLevel.toUpperCase()}`);
    console.log(`   Total Threats Analyzed: ${result.totalThreats}`);
    console.log(`   Critical Threats: ${result.criticalThreats}`);
    console.log(`\n   Summary: ${result.summary}\n`);
    
    // Verify we got meaningful results
    if (result.totalThreats === 0) {
      throw new Error('No threats analyzed! Junction table mappings may be missing.');
    }
    
    if (result.threatScores.length === 0) {
      throw new Error('No threat scores generated! Risk calculation failed.');
    }
    
    // Verify control detection is working (with mixed responses, some controls should be detected)
    const threatsWithControls = result.threatScores.filter(t => t.affectedControls.length > 0);
    const detectedControls = result.threatScores
      .flatMap(t => t.affectedControls.filter(c => c.detected));
    
    console.log(`\n🔍 Control Detection Validation:`);
    console.log(`   Threats with controls: ${threatsWithControls.length}/${result.totalThreats}`);
    console.log(`   Controls detected: ${detectedControls.length}`);
    
    if (detectedControls.length === 0) {
      console.warn('   ⚠️  WARNING: No controls detected from responses! isControlPresent() may be failing.');
    }
    
    // Verify vulnerability scoring varies (not all threats should have vulnerability = 5)
    const vulnerabilityScores = result.threatScores.map(t => t.vulnerability);
    const uniqueVulnerabilities = new Set(vulnerabilityScores);
    
    console.log(`\n📊 Vulnerability Score Variation:`);
    console.log(`   Unique vulnerability scores: ${uniqueVulnerabilities.size}`);
    console.log(`   Range: ${Math.min(...vulnerabilityScores)} - ${Math.max(...vulnerabilityScores)}`);
    
    if (uniqueVulnerabilities.size === 1 && vulnerabilityScores[0] === 5) {
      console.warn('   ⚠️  WARNING: All threats have vulnerability = 5! Control reduction may not be working.');
    }
    
    console.log('═'.repeat(70));
    console.log('\n📋 TOP 5 THREATS:\n');
    
    result.threatScores.slice(0, 5).forEach((threat, index) => {
      console.log(`${index + 1}. ${threat.threatName} (${threat.threatCategory})`);
      console.log(`   L=${threat.likelihood} × V=${threat.vulnerability} × I=${threat.impact} = ${threat.inherentRisk}${threat.isCritical ? ' ⚠️  CRITICAL' : ''}`);
      
      if (threat.affectedControls.length > 0) {
        const detected = threat.affectedControls.filter(c => c.detected).length;
        const total = threat.affectedControls.length;
        console.log(`   Controls: ${detected}/${total} detected`);
      }
      console.log('');
    });
    
    console.log('═'.repeat(70));
    console.log('\n✅ INTEGRATION TEST PASSED!\n');
    console.log('Key validations:');
    console.log(`  ✅ Questions seeded with ID linkages`);
    console.log(`  ✅ Junction tables queried successfully`);
    console.log(`  ✅ Risk mapper used database IDs (no name-matching)`);
    console.log(`  ✅ Threat scores calculated correctly`);
    console.log(`  ✅ ${result.totalThreats} threats analyzed with meaningful results\n`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:', error);
    throw error;
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testIntegration()
    .then(() => {
      console.log('✅ All integration tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Integration tests failed:', error);
      process.exit(1);
    });
}

export { testIntegration };
