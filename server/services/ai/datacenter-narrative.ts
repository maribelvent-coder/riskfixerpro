/**
 * AI Narrative Intelligence for Data Center Risk Scenarios
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
 * Data Center Profile structure (stored in assessment.datacenter_profile as JSONB)
 */
interface DataCenterProfile {
  tierLevel?: string;
  squareFootage?: number;
  serverCount?: number;
  uptimeRequirement?: string;
  complianceFrameworks?: string[];
  annualRevenue?: number;
  customerCount?: number;
}

/**
 * Generate professional narrative analysis for a data center risk scenario
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment with data center profile and survey data
 * @param surveyResponses - Facility survey responses for context-specific vulnerability details
 * @returns Professional 3-paragraph security analysis
 */
export async function generateDataCenterRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  try {
    const client = getOpenAIClient();
    
    // Extract data center profile
    const datacenterProfile = assessment.datacenter_profile as DataCenterProfile | null;
    
    // Extract relevant survey findings to provide context-specific details
    const surveyFindings = extractRelevantFindings(scenario.scenario, surveyResponses);
    
    // Build context-rich prompt with survey findings
    const prompt = constructNarrativePrompt(scenario, assessment, datacenterProfile, surveyFindings);
    
    // Call OpenAI GPT-4 for narrative generation
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Senior Data Center Security Consultant with 20+ years of experience in mission-critical facility protection. You specialize in SLA breach prevention, compliance management (SOC 2, PCI-DSS, HIPAA, ISO 27001), physical security, and operational resilience following ASIS International and Uptime Institute standards.

Your primary goal is **Operational Risk Mitigation**. Prioritize compliance gaps, SLA risk, and control deficiencies. Use downtime cost data as supporting evidence, not the primary headline.

Your writing style is:
- Professional and authoritative
- Data-driven with specific security metrics
- Focused on compliance gaps, SLA exposure, and operational vulnerabilities
- Vulnerability gaps and control measures come first
- Downtime cost is mentioned as context, not the primary driver
- Sensitive to customer trust and regulatory scrutiny
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
    console.error("❌ Error generating data center risk narrative:", error);
    throw new Error(`Failed to generate AI narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct a detailed prompt for GPT-4 narrative generation
 */
function constructNarrativePrompt(
  scenario: RiskScenario,
  assessment: Assessment,
  datacenterProfile: DataCenterProfile | null,
  surveyFindings: string[]
): string {
  
  // Build facility context section with proper null handling
  let facilityContext = `**Facility Type:** Data Center
**Assessment:** ${assessment.title || 'Security Assessment'}`;
  
  if (datacenterProfile) {
    if (datacenterProfile.tierLevel) {
      facilityContext += `\n**Tier Level:** ${datacenterProfile.tierLevel} (Uptime Institute Classification)`;
    }
    if (datacenterProfile.squareFootage) {
      facilityContext += `\n**Facility Size:** ${datacenterProfile.squareFootage.toLocaleString()} sq ft`;
    }
    if (datacenterProfile.serverCount) {
      facilityContext += `\n**Server Count:** ${datacenterProfile.serverCount.toLocaleString()} servers`;
    }
    if (datacenterProfile.uptimeRequirement) {
      facilityContext += `\n**Uptime Requirement:** ${datacenterProfile.uptimeRequirement}`;
    }
    if (datacenterProfile.complianceFrameworks && datacenterProfile.complianceFrameworks.length > 0) {
      facilityContext += `\n**Compliance Frameworks:** ${datacenterProfile.complianceFrameworks.join(', ')}`;
    }
    if (datacenterProfile.annualRevenue) {
      facilityContext += `\n**Annual Revenue:** $${datacenterProfile.annualRevenue.toLocaleString()}`;
    }
    if (datacenterProfile.customerCount) {
      facilityContext += `\n**Customer Count:** ${datacenterProfile.customerCount.toLocaleString()} customers`;
    }
  }
  
  // Build risk details section with proper null/undefined handling
  const riskDetails = `**Risk Scenario:** ${scenario.scenario || 'Unnamed Scenario'}
**Asset at Risk:** ${scenario.asset || 'Data Center Infrastructure'}
**Threat Type:** ${scenario.threatType || 'Infrastructure Security Threat'}
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
  return `Write a professional, 3-paragraph security risk analysis for this data center security scenario.

${facilityContext}

${riskDetails}${vulnerabilityDetails}

**Instructions:**

**Paragraph 1 - Context & Threat Definition (3-4 sentences):**
Define this specific risk in the context of THIS data center facility. Reference the tier level, uptime requirement, or compliance frameworks to establish why this threat is material to operations. For SLA breach scenarios, emphasize the customer count affected and penalty costs. For compliance gap scenarios, emphasize the regulatory frameworks at risk (SOC 2, PCI-DSS, HIPAA, ISO 27001) and audit implications.

**Paragraph 2 - Vulnerability Analysis (3-4 sentences):**
Explain WHY the risk level is ${(scenario.riskLevel || 'elevated').toLowerCase()} based on the specific security gaps identified in the vulnerability assessment. Reference the actual findings (e.g., inadequate redundancy, missing environmental monitoring, insufficient physical access controls, backup power gaps, inadequate change management). Connect these vulnerabilities to how they enable the threat.

**Paragraph 3 - Impact Assessment (3-4 sentences):**
Describe the potential financial, operational, and regulatory consequences if this risk materializes. For SLA breach risks, quantify customer impact, revenue loss per hour of downtime, contractual penalties, and customer churn. For compliance gaps, focus on audit failures, certification loss (SOC 2 Type II, PCI-DSS), regulatory fines (GDPR, HIPAA), and customer trust erosion. Use specific metrics when available (uptime requirement, customer count, annual revenue).

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
  if (lowerScenarioName.includes('sla breach') || lowerScenarioName.includes('downtime') || lowerScenarioName.includes('power')) {
    // Uptime/reliability findings
    if (surveyResponses.power_redundancy) {
      findings.push(`Power redundancy: ${surveyResponses.power_redundancy}`);
    }
    if (surveyResponses.cooling_redundancy) {
      findings.push(`Cooling redundancy: ${surveyResponses.cooling_redundancy}`);
    }
    if (surveyResponses.network_redundancy) {
      findings.push(`Network redundancy: ${surveyResponses.network_redundancy}`);
    }
    if (surveyResponses.backup_generators) {
      findings.push(`Backup generators: ${surveyResponses.backup_generators}`);
    }
  } else if (lowerScenarioName.includes('compliance') || lowerScenarioName.includes('audit') || lowerScenarioName.includes('certification')) {
    // Compliance findings
    if (surveyResponses.access_logging) {
      findings.push(`Access logging and audit trails: ${surveyResponses.access_logging}`);
    }
    if (surveyResponses.change_management) {
      findings.push(`Change management procedures: ${surveyResponses.change_management}`);
    }
    if (surveyResponses.security_training) {
      findings.push(`Security awareness training: ${surveyResponses.security_training}`);
    }
    if (surveyResponses.incident_response) {
      findings.push(`Incident response plan: ${surveyResponses.incident_response}`);
    }
  } else if (lowerScenarioName.includes('unauthorized access') || lowerScenarioName.includes('physical security')) {
    // Physical security findings
    if (surveyResponses.biometric_access) {
      findings.push(`Biometric access controls: ${surveyResponses.biometric_access}`);
    }
    if (surveyResponses.mantrap_entry) {
      findings.push(`Mantrap/airlock entry: ${surveyResponses.mantrap_entry}`);
    }
    if (surveyResponses.cctv_coverage) {
      findings.push(`CCTV coverage: ${surveyResponses.cctv_coverage}`);
    }
    if (surveyResponses.security_staff) {
      findings.push(`Security staff presence: ${surveyResponses.security_staff}`);
    }
  } else if (lowerScenarioName.includes('environmental') || lowerScenarioName.includes('fire') || lowerScenarioName.includes('flood')) {
    // Environmental protection findings
    if (surveyResponses.fire_suppression) {
      findings.push(`Fire suppression system: ${surveyResponses.fire_suppression}`);
    }
    if (surveyResponses.leak_detection) {
      findings.push(`Water leak detection: ${surveyResponses.leak_detection}`);
    }
    if (surveyResponses.environmental_monitoring) {
      findings.push(`Environmental monitoring: ${surveyResponses.environmental_monitoring}`);
    }
  }
  
  return findings;
}
