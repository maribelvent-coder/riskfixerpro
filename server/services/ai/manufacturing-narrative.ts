/**
 * AI Narrative Intelligence for Manufacturing Facility Risk Scenarios
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
 * Manufacturing Profile structure (stored in assessment.manufacturing_profile as JSONB)
 */
interface ManufacturingProfile {
  facilityType?: string;
  squareFootage?: number;
  employeeCount?: number;
  shiftOperations?: string;
  productionValue?: number;
  hasIPSensitivity?: boolean;
  regulatoryCompliance?: string[];
}

/**
 * Generate professional narrative analysis for a manufacturing facility risk scenario
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment with manufacturing profile and survey data
 * @param surveyResponses - Facility survey responses for context-specific vulnerability details
 * @returns Professional 3-paragraph security analysis
 */
export async function generateManufacturingRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  try {
    const client = getOpenAIClient();
    
    // Extract manufacturing profile
    const manufacturingProfile = assessment.manufacturing_profile as ManufacturingProfile | null;
    
    // Extract relevant survey findings to provide context-specific details
    const surveyFindings = extractRelevantFindings(scenario.scenario, surveyResponses);
    
    // Build context-rich prompt with survey findings
    const prompt = constructNarrativePrompt(scenario, assessment, manufacturingProfile, surveyFindings);
    
    // Call OpenAI GPT-4 for narrative generation
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Senior Industrial Security Consultant with 20+ years of experience in manufacturing facility security. You specialize in IP theft prevention, industrial sabotage mitigation, production continuity, and operational security following ASIS International and NIST standards.

Your primary goal is **Operational Risk Mitigation**. Prioritize IP exposure, production risks, and control deficiencies. Use downtime cost data as supporting evidence, not the primary headline.

Your writing style is:
- Professional and authoritative
- Data-driven with specific security metrics
- Focused on IP vulnerability, production risks, and operational gaps
- Vulnerability gaps and protective measures come first
- Downtime cost is mentioned as context, not the primary driver
- Sensitive to production continuity and safety
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
    console.error("❌ Error generating manufacturing risk narrative:", error);
    throw new Error(`Failed to generate AI narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct a detailed prompt for GPT-4 narrative generation
 */
function constructNarrativePrompt(
  scenario: RiskScenario,
  assessment: Assessment,
  manufacturingProfile: ManufacturingProfile | null,
  surveyFindings: string[]
): string {
  
  // Build facility context section with proper null handling
  let facilityContext = `**Facility Type:** Manufacturing Facility
**Assessment:** ${assessment.title || 'Security Assessment'}`;
  
  if (manufacturingProfile) {
    if (manufacturingProfile.facilityType) {
      facilityContext += `\n**Manufacturing Type:** ${manufacturingProfile.facilityType}`;
    }
    if (manufacturingProfile.squareFootage) {
      facilityContext += `\n**Facility Size:** ${manufacturingProfile.squareFootage.toLocaleString()} sq ft`;
    }
    if (manufacturingProfile.employeeCount) {
      facilityContext += `\n**Employee Count:** ${manufacturingProfile.employeeCount.toLocaleString()} employees`;
    }
    if (manufacturingProfile.shiftOperations) {
      facilityContext += `\n**Operations:** ${manufacturingProfile.shiftOperations}`;
    }
    if (manufacturingProfile.productionValue) {
      facilityContext += `\n**Annual Production Value:** $${manufacturingProfile.productionValue.toLocaleString()}`;
    }
    if (manufacturingProfile.hasIPSensitivity !== undefined) {
      facilityContext += `\n**IP Sensitivity:** ${manufacturingProfile.hasIPSensitivity ? 'Yes - Proprietary processes/trade secrets' : 'No - Standard manufacturing'}`;
    }
    if (manufacturingProfile.regulatoryCompliance && manufacturingProfile.regulatoryCompliance.length > 0) {
      facilityContext += `\n**Regulatory Compliance:** ${manufacturingProfile.regulatoryCompliance.join(', ')}`;
    }
  }
  
  // Build risk details section with proper null/undefined handling
  const riskDetails = `**Risk Scenario:** ${scenario.scenario || 'Unnamed Scenario'}
**Asset at Risk:** ${scenario.asset || 'Manufacturing Assets'}
**Threat Type:** ${scenario.threatType || 'Industrial Security Threat'}
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
  return `Write a professional, 3-paragraph security risk analysis for this manufacturing facility security scenario.

${facilityContext}

${riskDetails}${vulnerabilityDetails}

**Instructions:**

**Paragraph 1 - Context & Threat Definition (3-4 sentences):**
Define this specific risk in the context of THIS manufacturing facility. Reference the facility type, production value, or IP sensitivity to establish why this threat is material to operations. For downtime scenarios, emphasize the cost per hour of production stoppage. For IP theft scenarios, emphasize the competitive advantage at risk and R&D investment loss.

**Paragraph 2 - Vulnerability Analysis (3-4 sentences):**
Explain WHY the risk level is ${(scenario.riskLevel || 'elevated').toLowerCase()} based on the specific security gaps identified in the vulnerability assessment. Reference the actual findings (e.g., inadequate visitor escort, unsecured production floor, missing clean room controls, insufficient background checks, poor document control). Connect these vulnerabilities to how they enable the threat.

**Paragraph 3 - Impact Assessment (3-4 sentences):**
Describe the potential financial, operational, and competitive consequences if this risk materializes. For downtime risks, quantify lost production hours, contract penalties, and customer relationship damage. For IP theft, focus on competitive advantage loss, years of R&D compromised, regulatory violations (ITAR, EAR), and market position erosion. Use specific metrics when available (production value, employee count, shift operations).

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
  if (lowerScenarioName.includes('ip theft') || lowerScenarioName.includes('intellectual property') || lowerScenarioName.includes('espionage')) {
    // IP protection findings
    if (surveyResponses.visitor_management) {
      findings.push(`Visitor escort procedures: ${surveyResponses.visitor_management}`);
    }
    if (surveyResponses.document_control) {
      findings.push(`Document control measures: ${surveyResponses.document_control}`);
    }
    if (surveyResponses.clean_room_access) {
      findings.push(`Clean room access controls: ${surveyResponses.clean_room_access}`);
    }
  } else if (lowerScenarioName.includes('downtime') || lowerScenarioName.includes('sabotage') || lowerScenarioName.includes('equipment')) {
    // Production continuity findings
    if (surveyResponses.equipment_security) {
      findings.push(`Equipment security measures: ${surveyResponses.equipment_security}`);
    }
    if (surveyResponses.backup_power) {
      findings.push(`Backup power systems: ${surveyResponses.backup_power}`);
    }
    if (surveyResponses.production_monitoring) {
      findings.push(`Production monitoring: ${surveyResponses.production_monitoring}`);
    }
  } else if (lowerScenarioName.includes('insider') || lowerScenarioName.includes('employee')) {
    // Insider threat findings
    if (surveyResponses.background_checks) {
      findings.push(`Background screening: ${surveyResponses.background_checks}`);
    }
    if (surveyResponses.access_termination) {
      findings.push(`Access termination procedures: ${surveyResponses.access_termination}`);
    }
  } else if (lowerScenarioName.includes('perimeter') || lowerScenarioName.includes('unauthorized entry')) {
    // Perimeter security findings
    if (surveyResponses.perimeter_fence) {
      findings.push(`Perimeter fence condition: ${surveyResponses.perimeter_fence}`);
    }
    if (surveyResponses.loading_dock_security) {
      findings.push(`Loading dock security: ${surveyResponses.loading_dock_security}`);
    }
  }
  
  return findings;
}
