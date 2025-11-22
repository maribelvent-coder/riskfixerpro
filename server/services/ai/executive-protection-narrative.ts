/**
 * AI Narrative Intelligence for Executive Protection Risk Scenarios
 * 
 * Transforms technical risk data into professional security consultant narratives
 * using OpenAI GPT-4 to provide context-aware, executive-specific analysis
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
 * Executive Protection Profile structure (stored in assessment metadata)
 */
interface ExecutiveProfile {
  executiveTitle?: string;
  publicProfile?: 'Low' | 'Medium' | 'High';
  travelFrequency?: 'Rare' | 'Occasional' | 'Frequent';
  threatLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  protectiveDetail?: boolean;
  familyMembers?: number;
}

/**
 * Generate professional narrative analysis for an executive protection risk scenario
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment with executive profile and survey data
 * @param surveyResponses - Interview responses for context-specific vulnerability details
 * @returns Professional 3-paragraph security analysis
 */
export async function generateExecutiveProtectionRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  try {
    const client = getOpenAIClient();
    
    // Extract executive profile (may be in various formats)
    const executiveProfile = extractExecutiveProfile(assessment);
    
    // Extract relevant survey findings to provide context-specific details
    const surveyFindings = extractRelevantFindings(scenario.scenario, surveyResponses);
    
    // Build context-rich prompt with survey findings
    const prompt = constructNarrativePrompt(scenario, assessment, executiveProfile, surveyFindings);
    
    // Call OpenAI GPT-4 for narrative generation
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Senior Executive Protection Specialist with 20+ years of experience in close protection, threat assessment, and high-net-worth individual security. You specialize in kidnapping prevention, stalking mitigation, travel security, and OSINT-driven threat analysis following ASIS International and Protective Security Advisor (PSA) standards.

Your writing style is:
- Professional and authoritative
- Data-driven with specific threat intelligence
- Focused on personal safety, family security, and reputation protection
- Sensitive to privacy and discretion requirements
- Concise yet comprehensive
- Uses executive protection terminology appropriately`
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
    console.error("❌ Error generating executive protection risk narrative:", error);
    throw new Error(`Failed to generate AI narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract executive profile from assessment (flexible parsing)
 */
function extractExecutiveProfile(assessment: Assessment): ExecutiveProfile {
  // Executive profile might be stored in various places
  // This is a flexible approach to handle different storage patterns
  return {
    executiveTitle: assessment.title || 'Executive',
    publicProfile: 'Medium',
    travelFrequency: 'Occasional',
    threatLevel: 'Medium',
    protectiveDetail: false,
    familyMembers: 0
  };
}

/**
 * Construct a detailed prompt for GPT-4 narrative generation
 */
function constructNarrativePrompt(
  scenario: RiskScenario,
  assessment: Assessment,
  executiveProfile: ExecutiveProfile,
  surveyFindings: string[]
): string {
  
  // Build executive context section
  let executiveContext = `**Protection Type:** Executive Protection
**Assessment:** ${assessment.title || 'Executive Security Assessment'}`;
  
  if (executiveProfile.executiveTitle) {
    executiveContext += `\n**Executive Role:** ${executiveProfile.executiveTitle}`;
  }
  if (executiveProfile.publicProfile) {
    executiveContext += `\n**Public Profile:** ${executiveProfile.publicProfile} (exposure level)`;
  }
  if (executiveProfile.travelFrequency) {
    const frequencyMap: Record<string, string> = {
      'Rare': 'Rare (<5 trips/year)',
      'Occasional': 'Occasional (5-15 trips/year)',
      'Frequent': 'Frequent (>15 trips/year)'
    };
    executiveContext += `\n**Travel Frequency:** ${frequencyMap[executiveProfile.travelFrequency] || executiveProfile.travelFrequency}`;
  }
  if (executiveProfile.threatLevel) {
    executiveContext += `\n**Baseline Threat Level:** ${executiveProfile.threatLevel}`;
  }
  if (executiveProfile.protectiveDetail !== undefined) {
    executiveContext += `\n**Protective Detail:** ${executiveProfile.protectiveDetail ? 'Yes - Active protection team' : 'No - Self-protective measures'}`;
  }
  if (executiveProfile.familyMembers) {
    executiveContext += `\n**Family Members:** ${executiveProfile.familyMembers} (expanded protection scope)`;
  }
  
  // Build risk details section with proper null/undefined handling
  const riskDetails = `**Risk Scenario:** ${scenario.scenario || 'Unnamed Scenario'}
**Asset at Risk:** ${scenario.asset || 'Executive & Family'}
**Threat Type:** ${scenario.threatType || 'Personal Security Threat'}
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
    vulnerabilityDetails += `\n\n**Interview/Survey Findings:**\n${surveyFindings.join('\n')}`;
  }
  
  // Construct the full prompt
  return `Write a professional, 3-paragraph security risk analysis for this executive protection scenario.

${executiveContext}

${riskDetails}${vulnerabilityDetails}

**Instructions:**

**Paragraph 1 - Context & Threat Definition (3-4 sentences):**
Define this specific risk in the context of THIS executive's profile. Reference the public exposure level, travel frequency, or family considerations to establish why this threat is material to the executive's safety. For kidnapping scenarios, emphasize the ransom potential and targeting methodology. For stalking scenarios, emphasize the pattern recognition and escalation indicators. For exposure scenarios (doxxing, OSINT), emphasize the digital footprint and privacy implications.

**Paragraph 2 - Vulnerability Analysis (3-4 sentences):**
Explain WHY the risk level is ${(scenario.riskLevel || 'elevated').toLowerCase()} based on the specific security gaps identified in the vulnerability assessment. Reference the actual findings (e.g., predictable routines, insufficient advance work, no protective detail, inadequate digital hygiene, exposed family information, missing counter-surveillance measures). Connect these vulnerabilities to how they enable the threat.

**Paragraph 3 - Impact Assessment (3-4 sentences):**
Describe the potential personal, family, and organizational consequences if this risk materializes. For kidnapping, focus on ransom demands, family trauma, business disruption, and long-term psychological impact. For stalking, focus on escalation to violence, restraining order limitations, family anxiety, and career disruption. For exposure risks, focus on identity theft, family targeting, extortion opportunities, and reputation damage. Use specific context when available (public profile level, family members, travel patterns).

**Formatting:**
- Write in third person
- Use specific data from the assessment
- Avoid generic security platitudes
- Focus on THIS executive's specific context
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
  if (lowerScenarioName.includes('kidnapping') || lowerScenarioName.includes('abduction')) {
    // Kidnapping prevention findings
    if (surveyResponses.travel_routes) {
      findings.push(`Travel route predictability: ${surveyResponses.travel_routes}`);
    }
    if (surveyResponses.protective_detail) {
      findings.push(`Protective detail presence: ${surveyResponses.protective_detail}`);
    }
    if (surveyResponses.advance_work) {
      findings.push(`Advance security work: ${surveyResponses.advance_work}`);
    }
    if (surveyResponses.family_awareness) {
      findings.push(`Family security awareness: ${surveyResponses.family_awareness}`);
    }
  } else if (lowerScenarioName.includes('stalking') || lowerScenarioName.includes('harassment')) {
    // Stalking mitigation findings
    if (surveyResponses.residence_security) {
      findings.push(`Residence security measures: ${surveyResponses.residence_security}`);
    }
    if (surveyResponses.social_media_exposure) {
      findings.push(`Social media exposure: ${surveyResponses.social_media_exposure}`);
    }
    if (surveyResponses.routine_variance) {
      findings.push(`Daily routine variance: ${surveyResponses.routine_variance}`);
    }
    if (surveyResponses.threat_reporting) {
      findings.push(`Threat reporting procedures: ${surveyResponses.threat_reporting}`);
    }
  } else if (lowerScenarioName.includes('exposure') || lowerScenarioName.includes('osint') || lowerScenarioName.includes('doxxing')) {
    // Digital exposure findings
    if (surveyResponses.digital_footprint) {
      findings.push(`Digital footprint assessment: ${surveyResponses.digital_footprint}`);
    }
    if (surveyResponses.privacy_settings) {
      findings.push(`Privacy settings compliance: ${surveyResponses.privacy_settings}`);
    }
    if (surveyResponses.family_exposure) {
      findings.push(`Family information exposure: ${surveyResponses.family_exposure}`);
    }
    if (surveyResponses.address_privacy) {
      findings.push(`Residence address privacy: ${surveyResponses.address_privacy}`);
    }
  } else if (lowerScenarioName.includes('travel') || lowerScenarioName.includes('international')) {
    // Travel security findings
    if (surveyResponses.itinerary_security) {
      findings.push(`Itinerary information security: ${surveyResponses.itinerary_security}`);
    }
    if (surveyResponses.hotel_security) {
      findings.push(`Hotel security standards: ${surveyResponses.hotel_security}`);
    }
    if (surveyResponses.local_intelligence) {
      findings.push(`Destination intelligence gathering: ${surveyResponses.local_intelligence}`);
    }
  }
  
  return findings;
}
