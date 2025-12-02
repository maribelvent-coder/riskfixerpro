/**
 * AI Narrative Intelligence for Retail Store Risk Scenarios
 * 
 * Transforms technical risk data into professional security consultant narratives
 * using OpenAI GPT-4 to provide context-aware, retail-specific analysis
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
 * Retail Store Profile structure (stored in assessment.retail_profile as JSONB)
 */
interface RetailProfile {
  storeType?: string;
  squareFootage?: number;
  employeeCount?: number;
  annualRevenue?: number;
  shrinkageRate?: number;
  orcIncidents?: number;
  averageTransaction?: number;
  dailyCustomerVolume?: number;
}

/**
 * Generate professional narrative analysis for a retail store risk scenario
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment with retail profile and survey data
 * @param surveyResponses - Facility survey responses for context-specific vulnerability details
 * @returns Professional 3-paragraph security analysis
 */
export async function generateRetailRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  try {
    const client = getOpenAIClient();
    
    // Extract retail profile
    const retailProfile = assessment.retail_profile as RetailProfile | null;
    
    // Extract relevant survey findings to provide context-specific details
    const surveyFindings = extractRelevantFindings(scenario.scenario, surveyResponses);
    
    // Build context-rich prompt with survey findings
    const prompt = constructNarrativePrompt(scenario, assessment, retailProfile, surveyFindings);
    
    // Call OpenAI GPT-4 for narrative generation
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Senior Loss Prevention Consultant with 20+ years of experience in retail security. You specialize in shrinkage reduction, organized retail crime (ORC) prevention, employee theft mitigation, and point-of-sale security following National Retail Federation (NRF) and Loss Prevention Research Council (LPRC) standards.

Your primary goal is **Operational Risk Mitigation**. Prioritize control gaps (missing EAS, no CCTV, open docks) and threat intelligence. Use financial loss data as supporting evidence, not the primary headline.

Your writing style is:
- Professional and authoritative
- Data-driven with specific security metrics
- Focused on control vulnerabilities and ORC threat patterns
- Vulnerability gaps and protective measures come first
- Shrinkage/loss data is mentioned as context, not the primary driver
- Sensitive to customer experience and sales impact
- Concise yet comprehensive
- Uses retail security terminology appropriately`
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
    console.error("❌ Error generating retail risk narrative:", error);
    throw new Error(`Failed to generate AI narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct a detailed prompt for GPT-4 narrative generation
 */
function constructNarrativePrompt(
  scenario: RiskScenario,
  assessment: Assessment,
  retailProfile: RetailProfile | null,
  surveyFindings: string[]
): string {
  
  // Build facility context section with proper null handling
  let facilityContext = `**Facility Type:** Retail Store
**Assessment:** ${assessment.title || 'Security Assessment'}`;
  
  if (retailProfile) {
    if (retailProfile.storeType) {
      facilityContext += `\n**Store Type:** ${retailProfile.storeType}`;
    }
    if (retailProfile.squareFootage) {
      facilityContext += `\n**Store Size:** ${retailProfile.squareFootage.toLocaleString()} sq ft`;
    }
    if (retailProfile.employeeCount) {
      facilityContext += `\n**Employee Count:** ${retailProfile.employeeCount} employees`;
    }
    if (retailProfile.annualRevenue) {
      facilityContext += `\n**Annual Revenue:** $${retailProfile.annualRevenue.toLocaleString()}`;
    }
    if (retailProfile.shrinkageRate !== undefined && retailProfile.shrinkageRate !== null) {
      facilityContext += `\n**Shrinkage Rate:** ${retailProfile.shrinkageRate}% (Industry avg: 1.4-1.6%)`;
    }
    if (retailProfile.orcIncidents !== undefined && retailProfile.orcIncidents !== null) {
      facilityContext += `\n**ORC Incidents (Past Year):** ${retailProfile.orcIncidents}`;
    }
    if (retailProfile.averageTransaction) {
      facilityContext += `\n**Average Transaction:** $${retailProfile.averageTransaction.toFixed(2)}`;
    }
    if (retailProfile.dailyCustomerVolume) {
      facilityContext += `\n**Daily Customer Volume:** ${retailProfile.dailyCustomerVolume.toLocaleString()} customers/day`;
    }
  }
  
  // Build risk details section with proper null/undefined handling
  const riskDetails = `**Risk Scenario:** ${scenario.scenario || 'Unnamed Scenario'}
**Asset at Risk:** ${scenario.asset || 'Retail Inventory & Assets'}
**Threat Type:** ${scenario.threatType || 'Retail Security Threat'}
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
  return `Write a professional, 4-paragraph security risk analysis for this retail store security scenario using a Security-First approach.

${facilityContext}

${riskDetails}${vulnerabilityDetails}

**Instructions - Security Professional Perspective:**

**Paragraph 1 - Security Posture (3-4 sentences):**
State the risk level and identify the primary threats to this facility. Reference key facility characteristics to establish threat landscape. Emphasize operational vulnerabilities specific to retail stores (ORC patterns, shrinkage drivers, missing EAS tags, point-of-sale weaknesses).

**Paragraph 2 - Vulnerability Analysis (3-4 sentences):**
Identify the specific security gaps that create this risk level. Reference actual findings from the assessment (e.g., missing controls like EAS, CCTV, access control, perimeter security). Explain HOW these gaps enable the threat - this is the "Why" of the risk.

**Paragraph 3 - Recommendations (3-4 sentences):**
Provide actionable security measures to close the gaps. List specific controls appropriate to retail stores. Prioritize operational fixes over ROI calculations.

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
  if (lowerScenarioName.includes('shrinkage') || lowerScenarioName.includes('shoplifting') || lowerScenarioName.includes('theft')) {
    // Shrinkage prevention findings
    if (surveyResponses.eas_coverage) {
      findings.push(`EAS tag coverage: ${surveyResponses.eas_coverage}`);
    }
    if (surveyResponses.cctv_blind_spots) {
      findings.push(`CCTV blind spots: ${surveyResponses.cctv_blind_spots}`);
    }
    if (surveyResponses.fitting_room_monitoring) {
      findings.push(`Fitting room monitoring: ${surveyResponses.fitting_room_monitoring}`);
    }
    if (surveyResponses.receipt_checks) {
      findings.push(`Receipt checking procedures: ${surveyResponses.receipt_checks}`);
    }
  } else if (lowerScenarioName.includes('orc') || lowerScenarioName.includes('organized retail crime')) {
    // ORC prevention findings
    if (surveyResponses.high_value_locking) {
      findings.push(`High-value merchandise locking: ${surveyResponses.high_value_locking}`);
    }
    if (surveyResponses.incident_reporting) {
      findings.push(`ORC incident reporting to authorities: ${surveyResponses.incident_reporting}`);
    }
    if (surveyResponses.security_presence) {
      findings.push(`Security guard presence: ${surveyResponses.security_presence}`);
    }
    if (surveyResponses.parking_lot_surveillance) {
      findings.push(`Parking lot surveillance: ${surveyResponses.parking_lot_surveillance}`);
    }
  } else if (lowerScenarioName.includes('employee theft') || lowerScenarioName.includes('internal theft')) {
    // Employee theft findings
    if (surveyResponses.pos_exception_monitoring) {
      findings.push(`POS exception reporting: ${surveyResponses.pos_exception_monitoring}`);
    }
    if (surveyResponses.bag_check_policy) {
      findings.push(`Employee bag check policy: ${surveyResponses.bag_check_policy}`);
    }
    if (surveyResponses.inventory_audits) {
      findings.push(`Inventory audit frequency: ${surveyResponses.inventory_audits}`);
    }
    if (surveyResponses.register_accountability) {
      findings.push(`Cash register accountability: ${surveyResponses.register_accountability}`);
    }
  } else if (lowerScenarioName.includes('robbery') || lowerScenarioName.includes('violence')) {
    // Violence prevention findings
    if (surveyResponses.panic_buttons) {
      findings.push(`Panic button placement: ${surveyResponses.panic_buttons}`);
    }
    if (surveyResponses.cash_management) {
      findings.push(`Cash management procedures: ${surveyResponses.cash_management}`);
    }
    if (surveyResponses.closing_procedures) {
      findings.push(`Closing security procedures: ${surveyResponses.closing_procedures}`);
    }
  }
  
  return findings;
}
