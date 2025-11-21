/**
 * AI Narrative Intelligence for Office Building Risk Scenarios
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
 * Office Building Profile structure (stored in assessment.office_profile as JSONB)
 * CRITICAL: Matches shared/schema.ts officeProfileSchema
 */
interface OfficeProfile {
  employeeCount?: '1-50' | '51-200' | '201-1000' | '1000+';
  visitorVolume?: 'Low' | 'Medium' | 'High';
  dataSensitivity?: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  hasExecutivePresence?: boolean;
}

/**
 * Generate professional narrative analysis for an office building risk scenario
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment with office profile and survey data
 * @param surveyResponses - Facility survey responses for context-specific vulnerability details
 * @returns Professional 3-paragraph security analysis
 */
export async function generateOfficeRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  try {
    const client = getOpenAIClient();
    
    // Extract office profile
    const officeProfile = assessment.office_profile as OfficeProfile | null;
    
    // Extract relevant survey findings to provide context-specific details
    const surveyFindings = extractRelevantFindings(scenario.scenario, surveyResponses);
    
    // Build context-rich prompt with survey findings
    const prompt = constructNarrativePrompt(scenario, assessment, officeProfile, surveyFindings);
    
    // Call OpenAI GPT-4 for narrative generation
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Senior Corporate Security Consultant with 20+ years of experience in workplace violence prevention, data security, and office building physical security. You specialize in life safety programs, insider threat mitigation, and executive protection following ASIS International standards.

Your writing style is:
- Professional and authoritative
- Data-driven with specific metrics
- Focused on employee safety and business continuity
- Sensitive to workplace culture and employee wellbeing
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
    console.error("❌ Error generating office risk narrative:", error);
    throw new Error(`Failed to generate AI narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct a detailed prompt for GPT-4 narrative generation
 */
function constructNarrativePrompt(
  scenario: RiskScenario,
  assessment: Assessment,
  officeProfile: OfficeProfile | null,
  surveyFindings: string[]
): string {
  
  // Build facility context section with proper null handling
  let facilityContext = `**Facility Type:** Office Building
**Assessment:** ${assessment.title || 'Security Assessment'}`;
  
  // CRITICAL: These fields MUST be included for proper risk context
  const employeeCount = officeProfile?.employeeCount || '1-50';
  const dataSensitivity = officeProfile?.dataSensitivity || 'Internal';
  
  // Employee count categories with descriptions
  const employeeCountMap: Record<string, string> = {
    '1-50': '1-50 employees (small office)',
    '51-200': '51-200 employees (medium office)',
    '201-1000': '201-1000 employees (large corporate office)',
    '1000+': '1,000+ employees (enterprise campus)'
  };
  facilityContext += `\n**Employee Count:** ${employeeCountMap[employeeCount]}`;
  
  // Data sensitivity categories with full descriptions
  const sensitivityMap: Record<string, string> = {
    'Public': 'Public (General business data)',
    'Internal': 'Internal (Proprietary information)',
    'Confidential': 'Confidential (Trade secrets, financial data)',
    'Restricted': 'Restricted (Regulated/classified data)'
  };
  facilityContext += `\n**Data Sensitivity:** ${sensitivityMap[dataSensitivity]}`;
  
  if (officeProfile) {
    if (officeProfile.visitorVolume) {
      const volumeMap: Record<string, string> = {
        'Low': 'Low (<10/day)',
        'Medium': 'Medium (10-50/day)',
        'High': 'High (>50/day)'
      };
      facilityContext += `\n**Visitor Volume:** ${volumeMap[officeProfile.visitorVolume]}`;
    }
    if (officeProfile.hasExecutivePresence !== undefined) {
      facilityContext += `\n**Executive Presence:** ${officeProfile.hasExecutivePresence ? 'Yes - C-level executives on-site' : 'No'}`;
    }
  }
  
  // Build risk details section with proper null/undefined handling
  const riskDetails = `**Risk Scenario:** ${scenario.scenario || 'Unnamed Scenario'}
**Asset at Risk:** ${scenario.asset || 'Office Personnel & Assets'}
**Threat Type:** ${scenario.threatType || 'Workplace Security Threat'}
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
  return `Write a professional, 3-paragraph security risk analysis for this office building security scenario.

${facilityContext}

${riskDetails}${vulnerabilityDetails}

**Instructions:**

**Paragraph 1 - Context & Threat Definition (3-4 sentences):**
Define this specific risk in the context of THIS office facility. MUST reference the employee count range (${employeeCountMap[employeeCount]}) to establish life safety impact scale, and MUST reference data sensitivity level (${dataSensitivity}) to establish IP/compliance impact. For workplace violence scenarios, emphasize the life safety implications given the employee population. For data security scenarios, emphasize the IP/compliance impact given the sensitivity level.

**Paragraph 2 - Vulnerability Analysis (3-4 sentences):**
Explain WHY the risk level is ${(scenario.riskLevel || 'elevated').toLowerCase()} based on the specific security gaps identified in the vulnerability assessment. Reference the actual findings (e.g., lack of visitor management, no clean desk policy, missing panic buttons, inadequate access control, no threat assessment team). Connect these vulnerabilities to how they enable the threat.

**Paragraph 3 - Impact Assessment (3-4 sentences):**
Describe the potential consequences if this risk materializes. For workplace violence, focus on employee safety, business continuity, legal liability, and organizational reputation. For data security, focus on IP loss, regulatory penalties (GDPR, HIPAA, etc.), customer trust, and competitive advantage. Use specific metrics when available (employee count, data sensitivity level, executive presence).

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
  if (lowerScenarioName.includes('active shooter') || lowerScenarioName.includes('workplace violence')) {
    // Emergency response findings
    if (surveyResponses.emergency_1) {
      findings.push(`Panic buttons: ${surveyResponses.emergency_1}`);
    }
    if (surveyResponses.emergency_2) {
      findings.push(`Mass notification system: ${surveyResponses.emergency_2}`);
    }
    if (surveyResponses.emergency_3) {
      findings.push(`Active shooter training: ${surveyResponses.emergency_3}`);
    }
    if (surveyResponses.emergency_7) {
      findings.push(`Lockdown procedure: ${surveyResponses.emergency_7}`);
    }
  } else if (lowerScenarioName.includes('data') || lowerScenarioName.includes('theft') || lowerScenarioName.includes('document')) {
    // Data security findings
    if (surveyResponses.data_1) {
      findings.push(`Clean desk policy: ${surveyResponses.data_1}`);
    }
    if (surveyResponses.data_4) {
      findings.push(`USB port locks: ${surveyResponses.data_4}`);
    }
    if (surveyResponses.data_9) {
      findings.push(`Security awareness training: ${surveyResponses.data_9}`);
    }
  } else if (lowerScenarioName.includes('tailgating') || lowerScenarioName.includes('unauthorized') || lowerScenarioName.includes('visitor')) {
    // Access control findings
    if (surveyResponses.access_1) {
      findings.push(`Badge access system: ${surveyResponses.access_1}`);
    }
    if (surveyResponses.access_2) {
      findings.push(`Visitor management: ${surveyResponses.access_2}`);
    }
    if (surveyResponses.access_3) {
      findings.push(`Staffed reception: ${surveyResponses.access_3}`);
    }
    if (surveyResponses.access_6) {
      findings.push(`Turnstile gates: ${surveyResponses.access_6}`);
    }
  } else if (lowerScenarioName.includes('medical') || lowerScenarioName.includes('emergency')) {
    // Emergency preparedness findings
    if (surveyResponses.emergency_4) {
      findings.push(`AED availability: ${surveyResponses.emergency_4}`);
    }
    if (surveyResponses.emergency_6) {
      findings.push(`CPR trained staff: ${surveyResponses.emergency_6}`);
    }
  }
  
  return findings;
}
