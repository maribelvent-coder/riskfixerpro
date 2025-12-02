import { NarrativePrompt } from '../types/report-recipe';

export const narrativePrompts: NarrativePrompt[] = [
  {
    id: 'assessment-intro',
    sectionId: 'the-assessment',
    systemPrompt: `You are a senior physical security consultant writing an executive protection assessment. Your tone is professional, authoritative, and direct. You avoid jargon but maintain precision. You always cite specific methodologies and data sources to establish credibility.`,
    userPromptTemplate: `Write the opening Assessment section for an executive protection report.

Assessment Details:
- Principal: {{principalName}}, {{principalTitle}}
- Organization: {{organizationName}}
- Site Walk Dates: {{siteWalkDates}}
- Methodology: ASIS International Security Risk Assessment (SRA) Standard ASIS SRA-2024

Data Sources Used:
{{#each dataSources}}
- {{this.type}}: {{this.description}} ({{this.date}})
{{/each}}

Requirements:
1. Open with a single sentence stating what type of assessment this is
2. Mention the methodology (ASIS SRA-2024 adapted for executive protection)
3. List the data sources that were integrated
4. Keep it factual and brief - this sets context, not conclusions
5. Do NOT include findings or recommendations yet

Output only the narrative text, no headers or labels.`,
    outputConstraints: {
      maxWords: 150,
      minWords: 80,
      prohibitedPhrases: ['in conclusion', 'to summarize', 'importantly'],
      requiredElements: ['ASIS', 'site walk', 'interview']
    }
  },
  {
    id: 'risk-landscape',
    sectionId: 'risk-landscape',
    systemPrompt: `You are writing the threat environment section of an executive protection assessment. Your goal is to weave together career context, documented incidents, and threat domains into a cohesive narrative. You MUST attribute all incident information to specific sources (interview, document, etc.). Never speculate - only include what is documented.`,
    userPromptTemplate: `Write the Risk Landscape section for {{principalName}}.

Principal Profile:
{{principalProfile}}

Threat Domains Analysis (TorchStone Framework):
{{#each threatDomains}}
Domain {{this.number}}: {{this.name}}
- Applicable: {{this.applicable}}
- Findings: {{this.findings}}
{{/each}}

Documented Incidents:
{{#each documentedIncidents}}
- {{this.description}} (Source: {{this.source}}, Date: {{this.date}})
{{/each}}

{{#if activistGroups}}
Activist/Opposition Groups:
{{#each activistGroups}}
- {{this.name}}: {{this.description}}
{{/each}}
{{/if}}

{{#if laborTensions}}
Labor/Insider Context: {{laborTensions}}
{{/if}}

Requirements:
1. Open with a paragraph establishing the principal's career trajectory and how it creates the threat profile
2. Reference documented incidents with explicit source attribution ("Interview with [Name] confirmed...")
3. Organize threats using the TorchStone 8 Domains framework where applicable
4. For each relevant domain, explain WHY it applies to this specific principal
5. End with a transition to the vulnerability section - what this threat landscape means for security posture
6. Use phrases like "documented," "confirmed," "per interview" - never "allegedly" or "reportedly"

Output only the narrative text. Do not include section headers.`,
    outputConstraints: {
      maxWords: 800,
      minWords: 400,
      requiredElements: ['career', 'documented', 'interview'],
      prohibitedPhrases: ['allegedly', 'reportedly', 'it is believed that']
    }
  },
  {
    id: 'vulnerability-reality',
    sectionId: 'vulnerability-reality',
    systemPrompt: `You are writing the vulnerability findings section. Your job is to connect site walk observations with interview insights. Always attribute findings to their source. Present workplace and residential findings separately but comparatively.`,
    userPromptTemplate: `Write the Vulnerability Reality section based on assessment findings.

Site Walk Findings:
{{#each siteWalkFindings}}
{{this.location}} (Walked {{this.date}}):
{{#each this.findings}}
- {{this.finding}}{{#if this.quote}} "{{this.quote}}"{{/if}}
{{/each}}
{{/each}}

Interview Findings:
{{#each interviewFindings}}
{{this.source}} ({{this.role}}, {{this.date}}):
{{#each this.findings}}
- {{this.finding}}
{{/each}}
Key Quote: "{{this.keyQuote}}"
{{/each}}

Geographic Context:
- Workplace CAP Score: {{workplaceCAP}}, BE: {{workplaceBE}}
- Residence CAP Score: {{residenceCAP}}, Violent Crime: {{residenceVC}}

Requirements:
1. Open with the highest-concern finding from the workplace
2. Use direct quotes from interviews where available
3. Present the geographic data as validation/context for findings
4. Create the "asymmetric vulnerability" narrative if applicable - More probable risks at X, but Y offers no protection against focused attack
5. End with any gap between threat awareness and protective measures
6. Avoid listing - weave findings into flowing prose

Output only the narrative text. Do not include section headers.`,
    outputConstraints: {
      maxWords: 600,
      minWords: 300,
      requiredElements: ['site walk', 'interview'],
      preferredStructure: 'workplace-first-then-residential'
    }
  },
  {
    id: 'geographic-summary',
    sectionId: 'geographic-intelligence',
    systemPrompt: `You are summarizing geographic intelligence data for an executive protection assessment. Present CAP Index scores and crime data in accessible language while maintaining analytical precision.`,
    userPromptTemplate: `Write a brief Geographic Intelligence summary.

CAP Index Data:
{{capIndexData}}

Location Summaries:
{{#each locations}}
- {{this.name}}: CAP {{this.capScore}}, Violent Crime {{this.violentCrime}}/1000
{{/each}}

Requirements:
1. Explain what CAP Index measures (crime risk relative to national average of 100)
2. Present key findings for each assessed location
3. Highlight any significant disparities between locations
4. Keep technical but accessible

Output only the narrative text. Do not include section headers.`,
    outputConstraints: {
      maxWords: 200,
      requiredElements: ['CAP', 'crime']
    }
  },
  {
    id: 'risk-calculation-explanation',
    sectionId: 'mathematical-reality',
    systemPrompt: `You are explaining the TVI risk calculation methodology. Your goal is to make the math accessible while maintaining rigor. Each score component must be justified with specific evidence.`,
    userPromptTemplate: `Write the Mathematical Reality section explaining the risk calculation.

Risk Scores:
- Threat: {{threatScore}}/5
- Vulnerability: {{vulnerabilityScore}}/5
- Impact: {{impactScore}}/5
- Overall: {{overallRiskScore}}/125
- Risk Level: {{riskLevel}}

Threat Score Justification: {{threatJustification}}
Vulnerability Score Justification: {{vulnerabilityJustification}}
Impact Score Justification: {{impactJustification}}

Requirements:
1. Open with the formula: Risk = Threat × Vulnerability × Impact
2. Present the calculation: {{threatScore}} × {{vulnerabilityScore}} × {{impactScore}} = {{overallRiskScore}}/125
3. State the risk level determination
4. Explain each component score in a separate paragraph:
   - What drove the Threat score (list specific factors)
   - What drove the Vulnerability score (list specific gaps)
   - What drove the Impact score (list consequences)
5. Use **bold** for the final score and risk level
6. Keep explanations evidence-based, not theoretical

Output only the narrative text. Do not include section headers.`,
    outputConstraints: {
      maxWords: 400,
      requiredElements: ['TVI', 'score', 'documented']
    }
  },
  {
    id: 'recommendations-narrative',
    sectionId: 'path-forward',
    systemPrompt: `You are writing prioritized security recommendations. Each recommendation must tie back to a specific finding. Present recommendations as proportionate responses, not wish lists.`,
    userPromptTemplate: `Write the Path Forward section with prioritized recommendations.

Recommendations (in priority order):
{{#each prioritizedRecommendations}}
Priority {{this.priority}}: {{this.title}}
- Rationale: {{this.rationale}}
- Evidence Basis: {{this.evidenceBasis}}
- Linked Findings: {{this.linkedFindings}}
{{/each}}

Requirements:
1. Brief intro stating these are targeted measures addressing documented vulnerabilities
2. Present each priority as a short paragraph (not bullets) with:
   - What to do
   - Why (evidence link)
   - Expected risk reduction if available
3. End with implementation guidance: start with priorities 1-3
4. Emphasize that recommendations are proportionate and integrate with existing capabilities

Output only the narrative text. Do not include section headers.`,
    outputConstraints: {
      maxWords: 500,
      preferredStructure: 'paragraph-per-priority'
    }
  },
  {
    id: 'conclusion',
    sectionId: 'bottom-line',
    systemPrompt: `You are writing the closing summary. Reinforce key points without repeating details. End with a clear call to action.`,
    userPromptTemplate: `Write the Bottom Line conclusion.

Key Summary Points:
- Overall Risk: {{riskLevel}} ({{overallRiskScore}}/125)
- Primary Risk Environment: {{primaryRiskEnvironment}}
- Top 3 Priorities: {{topPriorities}}
- Key Insight: {{keyInsight}}

Requirements:
1. One paragraph summarizing the risk profile drivers
2. One paragraph on the prioritization insight (e.g., workplace vs. residence)
3. One paragraph on implementation guidance
4. Final sentence on how these recommendations integrate with existing capabilities
5. NO new information - synthesis only

Output only the narrative text. Do not include section headers.`,
    outputConstraints: {
      maxWords: 300,
      prohibitedPhrases: ['in conclusion', 'to summarize', 'in summary']
    }
  }
];
