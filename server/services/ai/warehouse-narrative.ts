/**
 * AI Narrative Intelligence for Warehouse Risk Scenarios
 * 
 * Transforms technical risk data into professional security consultant narratives
 * using OpenAI GPT-4 to provide context-aware, facility-specific analysis
 */

import OpenAI from 'openai';
import type { RiskScenario, Assessment } from '@shared/schema';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.");
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Warehouse Profile structure (stored in assessment.warehouse_profile as JSONB)
 */
interface WarehouseProfile {
  warehouseType?: string;
  squareFootage?: number;
  inventoryValue?: number;
  highValueProducts?: string[];
  loadingDockCount?: number;
  dailyTruckVolume?: number;
  shrinkageRate?: number;
  cargoTheftIncidents?: number;
}

/**
 * Generate professional narrative analysis for a warehouse risk scenario
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment with warehouse profile and survey data
 * @param surveyResponses - Facility survey responses for context-specific vulnerability details
 * @returns Professional 3-paragraph security analysis
 */
export async function generateWarehouseRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  try {
    const client = getOpenAIClient();
    
    // Extract warehouse profile
    const warehouseProfile = assessment.warehouse_profile as WarehouseProfile | null;
    
    // Extract relevant survey findings to provide context-specific details
    const surveyFindings = extractRelevantFindings(scenario.scenario, surveyResponses);
    
    // Build context-rich prompt with survey findings
    const prompt = constructNarrativePrompt(scenario, assessment, warehouseProfile, surveyFindings);
    
    // Call OpenAI GPT-4 for narrative generation
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Senior Security Consultant with 20+ years of experience in warehouse and distribution center security. You specialize in cargo theft prevention, supply chain security, and physical security assessments following ASIS International standards.

Your primary goal is **Operational Risk Mitigation**. Prioritize control gaps (unsecured docks, inadequate perimeter, missing CCTV) and threat intelligence. Use cargo loss data as supporting evidence, not the primary headline.

Your writing style is:
- Professional and authoritative
- Data-driven with specific security metrics
- Focused on cargo vulnerability and control deficiencies
- Vulnerability gaps and protective measures come first
- Inventory loss is mentioned as context, not the primary driver
- Concise yet comprehensive
- Uses security industry terminology appropriately`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    });
    
    const narrative = response.choices[0].message.content || "Failed to generate narrative.";
    
    console.log(`✅ Generated AI narrative for scenario: ${scenario.scenario}`);
    
    return narrative;
    
  } catch (error) {
    console.error("❌ Error generating warehouse risk narrative:", error);
    throw new Error(`Failed to generate AI narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct a detailed prompt for GPT-4 narrative generation
 */
function constructNarrativePrompt(
  scenario: RiskScenario,
  assessment: Assessment,
  warehouseProfile: WarehouseProfile | null,
  surveyFindings: string[]
): string {
  
  // Build facility context section with proper null handling
  let facilityContext = `**Facility Type:** ${assessment.templateId?.replace(/-/g, ' ') || 'Warehouse'}
**Assessment:** ${assessment.title || 'Security Assessment'}`;
  
  if (warehouseProfile) {
    if (warehouseProfile.warehouseType) {
      facilityContext += `\n**Warehouse Type:** ${warehouseProfile.warehouseType}`;
    }
    if (warehouseProfile.squareFootage) {
      facilityContext += `\n**Facility Size:** ${warehouseProfile.squareFootage.toLocaleString()} sq ft`;
    }
    if (warehouseProfile.inventoryValue) {
      facilityContext += `\n**Inventory Value:** $${warehouseProfile.inventoryValue.toLocaleString()}`;
    }
    if (warehouseProfile.highValueProducts && warehouseProfile.highValueProducts.length > 0) {
      facilityContext += `\n**High-Value Products:** ${warehouseProfile.highValueProducts.join(', ')}`;
    }
    if (warehouseProfile.loadingDockCount) {
      facilityContext += `\n**Loading Docks:** ${warehouseProfile.loadingDockCount}`;
    }
    if (warehouseProfile.dailyTruckVolume) {
      facilityContext += `\n**Daily Truck Volume:** ${warehouseProfile.dailyTruckVolume} trucks/day`;
    }
    if (warehouseProfile.shrinkageRate !== undefined && warehouseProfile.shrinkageRate !== null) {
      facilityContext += `\n**Shrinkage Rate:** ${warehouseProfile.shrinkageRate}% (Industry avg: 1.4-1.6%)`;
    }
    if (warehouseProfile.cargoTheftIncidents) {
      facilityContext += `\n**Prior Cargo Theft Incidents:** ${warehouseProfile.cargoTheftIncidents}`;
    }
  }
  
  // Build risk details section with proper null/undefined handling
  const riskDetails = `**Risk Scenario:** ${scenario.scenario || 'Unnamed Scenario'}
**Asset at Risk:** ${scenario.asset || 'Warehouse Assets'}
**Threat Type:** ${scenario.threatType || 'Physical Security Threat'}
**Inherent Risk Score:** ${scenario.inherentRisk ?? 'Not calculated'} / 125 (T×V×I formula)
**Risk Level:** ${scenario.riskLevel || 'Not specified'}
**Likelihood:** ${scenario.likelihood || 'Not specified'} (Score: ${scenario.likelihoodScore ?? 'N/A'}/5)
**Impact:** ${scenario.impact || 'Not specified'} (Score: ${scenario.impactScore ?? 'N/A'}/5)`;
  
  // Build vulnerability details with null handling and survey findings
  let vulnerabilityDetails = '';
  if (scenario.vulnerabilityDescription && scenario.vulnerabilityDescription.trim() !== '') {
    vulnerabilityDetails = `\n\n**Key Vulnerabilities Identified:**
${scenario.vulnerabilityDescription}`;
  }
  
  // Add survey-specific findings if available
  if (surveyFindings.length > 0) {
    vulnerabilityDetails += `\n\n**Survey Findings:**\n${surveyFindings.join('\n')}`;
  }
  
  // Construct the full prompt
  return `Write a professional, 4-paragraph security risk analysis for this warehouse security scenario using a Security-First approach.

${facilityContext}

${riskDetails}${vulnerabilityDetails}

**Instructions - Security Professional Perspective:**

**Paragraph 1 - Security Posture (3-4 sentences):**
State the risk level and identify the primary threats to this facility. Reference key facility characteristics to establish threat landscape. Emphasize operational vulnerabilities specific to warehouses (cargo theft patterns, loading dock security gaps, perimeter weaknesses, seal verification gaps).

**Paragraph 2 - Vulnerability Analysis (3-4 sentences):**
Identify the specific security gaps that create this risk level. Reference actual findings from the assessment (e.g., missing controls like seal verification, CCTV, access control, perimeter security). Explain HOW these gaps enable the threat - this is the "Why" of the risk.

**Paragraph 3 - Recommendations (3-4 sentences):**
Provide actionable security measures to close the gaps. List specific controls appropriate to warehouse facilities. Prioritize operational fixes over ROI calculations.

**Paragraph 4 - Business Impact (2-3 sentences, BRIEF):**
Briefly mention consequences if risk materializes. Keep this section concise - security professionals understand the stakes.

**Formatting:**
- Write in third person
- Use specific data from the assessment
- Avoid generic security platitudes
- Focus on THIS specific facility's context
- Be concise but authoritative
- Do NOT use bullet points or lists
- Write in flowing paragraph format`;
}

/**
 * Extract relevant survey findings for a specific scenario type
 * This helps provide context-specific vulnerability details
 */
function extractRelevantFindings(
  scenarioName: string | null,
  surveyResponses: Record<string, any> | null
): string[] {
  
  if (!surveyResponses || !scenarioName) return [];
  
  const findings: string[] = [];
  
  const lowerScenarioName = scenarioName.toLowerCase();
  
  // Map scenario types to relevant survey questions
  if (lowerScenarioName.includes('cargo theft')) {
    // Look for dock-related findings
    if (surveyResponses.dock_4) {
      findings.push(`Trailer seal verification: ${surveyResponses.dock_4}`);
    }
    if (surveyResponses.dock_security) {
      findings.push(`Dock security measures: ${surveyResponses.dock_security}`);
    }
  } else if (scenarioName.toLowerCase().includes('loading dock')) {
    if (surveyResponses.dock_9) {
      findings.push(`Driver access controls: ${surveyResponses.dock_9}`);
    }
    if (surveyResponses.dock_cctv) {
      findings.push(`CCTV coverage: ${surveyResponses.dock_cctv}`);
    }
  } else if (scenarioName.toLowerCase().includes('insider')) {
    if (surveyResponses.personnel_1) {
      findings.push(`Background check procedures: ${surveyResponses.personnel_1}`);
    }
  } else if (scenarioName.toLowerCase().includes('perimeter')) {
    if (surveyResponses.perimeter_1) {
      findings.push(`Perimeter fence condition: ${surveyResponses.perimeter_1}`);
    }
  }
  
  return findings;
}
