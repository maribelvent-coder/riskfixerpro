/**
 * Test Script for Report Generation Pipeline (Phase 3)
 * 
 * This script tests the report generation system by:
 * 1. Checking Anthropic API configuration
 * 2. Verifying recipes and prompts are in the database
 * 3. Testing the data assembler with a real or mock assessment
 * 4. Testing narrative generation with the Anthropic API
 */

import { db } from "../db";
import { assessments, reportRecipes, narrativePrompts } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isAnthropicConfigured } from "../services/anthropic-service";
import { assembleReportData } from "../services/reporting/report-data-assembler";
import { generateSectionNarrative } from "../services/reporting/narrative-generator";
import { generateReport } from "../services/reporting/report-generator";

async function runTests() {
  console.log("===========================================");
  console.log("  Report Generation Pipeline Test");
  console.log("===========================================\n");

  // Test 1: Check Anthropic API Configuration
  console.log("Test 1: Checking Anthropic API configuration...");
  const anthropicConfigured = isAnthropicConfigured();
  console.log(`  ✓ Anthropic API configured: ${anthropicConfigured}`);
  if (!anthropicConfigured) {
    console.log("  ⚠ WARNING: ANTHROPIC_API_KEY not set. Narrative generation will fail.\n");
  }
  console.log("");

  // Test 2: Check Report Recipes in Database
  console.log("Test 2: Checking report recipes in database...");
  const recipes = await db.select().from(reportRecipes);
  console.log(`  ✓ Found ${recipes.length} recipe(s) in database`);
  for (const recipe of recipes) {
    console.log(`    - ${recipe.id}: ${recipe.name} (${recipe.reportType})`);
  }
  console.log("");

  // Test 3: Check Narrative Prompts in Database
  console.log("Test 3: Checking narrative prompts in database...");
  const prompts = await db.select().from(narrativePrompts);
  console.log(`  ✓ Found ${prompts.length} prompt(s) in database`);
  for (const prompt of prompts) {
    console.log(`    - ${prompt.id}: section=${prompt.sectionId}`);
  }
  console.log("");

  // Test 4: Get a Test Assessment
  console.log("Test 4: Looking for an assessment to test with...");
  const allAssessments = await db.select().from(assessments).limit(5);
  console.log(`  ✓ Found ${allAssessments.length} assessment(s) in database`);
  
  if (allAssessments.length === 0) {
    console.log("  ⚠ No assessments found. Creating a test data package...");
    console.log("  Note: Full report generation requires an existing assessment.\n");
    return;
  }

  const testAssessment = allAssessments[0];
  console.log(`  Using assessment: ${testAssessment.id} (${testAssessment.title})`);
  console.log("");

  // Test 5: Test Data Assembler
  console.log("Test 5: Testing data assembler...");
  try {
    const dataPackage = await assembleReportData(testAssessment.id);
    console.log("  ✓ Data package assembled successfully");
    console.log(`    - Assessment Type: ${dataPackage.assessmentType}`);
    console.log(`    - Threat Domains: ${dataPackage.threatDomains.length}`);
    console.log(`    - Interview Findings: ${dataPackage.interviewFindings.length}`);
    console.log(`    - Documented Incidents: ${dataPackage.documentedIncidents.length}`);
    console.log(`    - Recommendations: ${dataPackage.recommendations.length}`);
    console.log(`    - Risk Level: ${dataPackage.riskScores.riskLevel}`);
    console.log(`    - Overall Score: ${dataPackage.riskScores.overallScore.toFixed(2)}`);
  } catch (error) {
    console.log(`  ✗ Data assembler error: ${error instanceof Error ? error.message : error}`);
  }
  console.log("");

  // Test 6: Test Narrative Generation (if Anthropic is configured)
  if (anthropicConfigured && prompts.length > 0) {
    console.log("Test 6: Testing narrative generation with Anthropic...");
    try {
      const testPromptId = prompts[0].id;
      const dataPackage = await assembleReportData(testAssessment.id);
      
      console.log(`  Generating narrative for prompt: ${testPromptId}...`);
      const result = await generateSectionNarrative(testPromptId, dataPackage);
      
      console.log("  ✓ Narrative generated successfully");
      console.log(`    - Word count: ${result.wordCount}`);
      console.log(`    - Model: ${result.model}`);
      console.log(`    - Input tokens: ${result.usage.inputTokens}`);
      console.log(`    - Output tokens: ${result.usage.outputTokens}`);
      console.log(`    - Preview (first 200 chars): ${result.content.substring(0, 200)}...`);
    } catch (error) {
      console.log(`  ✗ Narrative generation error: ${error instanceof Error ? error.message : error}`);
    }
  } else {
    console.log("Test 6: Skipping narrative generation test (Anthropic not configured or no prompts)");
  }
  console.log("");

  // Test 7: Test Full Report Generation (if Anthropic is configured and recipe exists)
  if (anthropicConfigured && recipes.length > 0) {
    console.log("Test 7: Testing full report generation...");
    try {
      const testRecipeId = recipes[0].id;
      console.log(`  Generating report with recipe: ${testRecipeId}...`);
      console.log("  (This may take a minute as it calls the Anthropic API for each narrative section)");
      
      const result = await generateReport(testAssessment.id, testRecipeId);
      
      console.log("  ✓ Report generated successfully");
      console.log(`    - Recipe ID: ${result.recipeId}`);
      console.log(`    - Sections generated: ${result.sections.length}`);
      console.log(`    - Total tokens used: ${result.totalTokensUsed}`);
      console.log(`    - Total narrative words: ${result.totalNarrativeWords}`);
      console.log("    - Section breakdown:");
      for (const section of result.sections) {
        console.log(`      • ${section.title}: narrative=${!!section.narrativeContent}, table=${!!section.tableContent}`);
      }
    } catch (error) {
      console.log(`  ✗ Full report generation error: ${error instanceof Error ? error.message : error}`);
    }
  } else {
    console.log("Test 7: Skipping full report generation (Anthropic not configured or no recipes)");
  }
  console.log("");

  console.log("===========================================");
  console.log("  Test Suite Complete");
  console.log("===========================================");
}

// Run the tests
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test suite failed:", error);
    process.exit(1);
  });
