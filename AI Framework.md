┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI ASSESSMENT CONTEXT LIBRARY                        │
│                    (Everything the AI receives in its prompt)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: FACILITY-SPECIFIC DATA (From This Assessment)             │   │
│  │                                                                     │   │
│  │  • Interview responses (80+ questions)                              │   │
│  │  • Photo analysis results (GPT-4 Vision observations)               │   │
│  │  • Incident history (client-provided)                               │   │
│  │  • Current control inventory (what's implemented)                   │   │
│  │  • Geographic data (address, CAP Index scores)                      │   │
│  │  • Operational profile (hours, employees, assets)                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: METHODOLOGY FRAMEWORKS (How to Calculate)                 │   │
│  │                                                                     │   │
│  │  • ASIS GDL-RA (General Security Risk Assessment Guideline)         │   │
│  │  • ASIS/ANSI PSC.1-2012 (Physical Security Controls)                │   │
│  │  • ASIS SRA Standard (Security Risk Assessment)                     │   │
│  │  • T×V×I calculation rules and scoring criteria                     │   │
│  │  • Risk classification thresholds (1-125 scale)                     │   │
│  │  • Control effectiveness measurement standards                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: INDUSTRY-SPECIFIC STANDARDS (Template-Dependent)          │   │
│  │                                                                     │   │
│  │  RETAIL:                                                            │   │
│  │  • NRF Loss Prevention Standards                                    │   │
│  │  • ASIS Retail Security Council guidelines                          │   │
│  │  • ORC (Organized Retail Crime) threat indicators                   │   │
│  │  • Shrinkage benchmarks by retail category                          │   │
│  │                                                                     │   │
│  │  WAREHOUSE:                                                         │   │
│  │  • TAPA FSR (Facility Security Requirements)                        │   │
│  │  • TAPA TSR (Trucking Security Requirements)                        │   │
│  │  • C-TPAT (Customs-Trade Partnership Against Terrorism)             │   │
│  │  • CargoNet threat intelligence categories                          │   │
│  │                                                                     │   │
│  │  DATACENTER:                                                        │   │
│  │  • SOC 2 Type II physical security requirements                     │   │
│  │  • ISO 27001 Annex A physical controls                              │   │
│  │  • PCI-DSS physical security requirements                           │   │
│  │  • TIA-942 datacenter tier standards                                │   │
│  │                                                                     │   │
│  │  MANUFACTURING:                                                     │   │
│  │  • NIST SP 800-82 (Industrial Control Systems)                      │   │
│  │  • CFATS (Chemical Facility Anti-Terrorism Standards)               │   │
│  │  • ITAR physical security requirements                              │   │
│  │  • Trade secret protection frameworks                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: THREAT INTELLIGENCE (External Data)                       │   │
│  │                                                                     │   │
│  │  • CAP Index crime scores (location-specific)                       │   │
│  │  • FBI UCR data (regional crime statistics)                         │   │
│  │  • CargoNet cargo theft statistics (warehouse)                      │   │
│  │  • NRF shrinkage survey data (retail)                               │   │
│  │  • Industry incident reports (anonymized)                           │   │
│  │  • OSINT threat actor profiles (where relevant)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: CONTROL EFFECTIVENESS DATA (What Actually Works)          │   │
│  │                                                                     │   │
│  │  • ASIS research on control effectiveness                           │   │
│  │  • Academic security studies (peer-reviewed)                        │   │
│  │  • Insurance loss data correlations                                 │   │
│  │  • RiskFixer historical assessment outcomes                         │   │
│  │  • Control ROI benchmarks by industry                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 6: SCORING RUBRICS (Eliminates Subjectivity)                 │   │
│  │                                                                     │   │
│  │  THREAT LIKELIHOOD RUBRIC:                                          │   │
│  │  1 = Rare: No incidents in 5+ years, no known threat actors         │   │
│  │  2 = Unlikely: Isolated incidents in region, low attractiveness     │   │
│  │  3 = Possible: Periodic incidents, moderate target profile          │   │
│  │  4 = Likely: Regular incidents, known threat actor interest         │   │
│  │  5 = Almost Certain: Recent incidents, active targeting             │   │
│  │                                                                     │   │
│  │  VULNERABILITY RUBRIC:                                              │   │
│  │  1 = Minimal: Controls exceed standards, tested effective           │   │
│  │  2 = Low: Controls meet standards, minor gaps identified            │   │
│  │  3 = Moderate: Some controls present, notable gaps                  │   │
│  │  4 = High: Significant gaps, controls below standards               │   │
│  │  5 = Critical: Absent/ineffective controls, easily exploited        │   │
│  │                                                                     │   │
│  │  IMPACT RUBRIC:                                                     │   │
│  │  1 = Negligible: <$10K loss, no injuries, local news only           │   │
│  │  2 = Minor: $10-50K loss, minor injuries, minimal disruption        │   │
│  │  3 = Moderate: $50-250K loss, medical treatment, days disruption    │   │
│  │  4 = Significant: $250K-1M loss, serious injury, weeks disruption   │   │
│  │  5 = Severe: >$1M loss, fatalities possible, existential threat     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

How This Becomes an AI Prompt
The AI doesn't get a vague "assess this threat" instruction. It gets a structured prompt with all context embedded:
typescript// server/services/ai-risk-assessment.ts

export async function generateAIEnhancedAssessment(
  threat: ThreatDefinition,
  facilityContext: FacilityContext,
  templateType: string
): Promise<AIAssessmentResult> {
  
  // Build the grounded prompt
  const prompt = buildGroundedAssessmentPrompt(threat, facilityContext, templateType);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: getSystemPrompt(templateType) },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Low temperature = more deterministic
  });
  
  return parseAssessmentResponse(response);
}

The Actual System Prompt (What Grounds the AI)
typescriptfunction getSystemPrompt(templateType: string): string {
  return `
You are a certified physical security professional (CPP) conducting a formal 
risk assessment following ASIS International standards. Your assessments must be:

1. EVIDENCE-BASED: Every score must cite specific findings from the interview 
   data, photos, or threat intelligence provided. Never assume facts not in evidence.

2. METHODOLOGY-COMPLIANT: Follow the ASIS GDL-RA (General Security Risk Assessment 
   Guideline) framework using the T×V×I formula where:
   - T (Threat) = Likelihood of threat actor attempting attack (1-5)
   - V (Vulnerability) = Degree to which controls fail to prevent/detect (1-5)
   - I (Impact) = Consequence severity if attack succeeds (1-5)
   - Inherent Risk = T × V × I (range 1-125)

3. RUBRIC-ANCHORED: Use these exact scoring criteria:

   THREAT LIKELIHOOD:
   1 (Rare): No incidents at this location or similar facilities in region 
      in past 5 years. No known threat actor interest. Threat requires 
      specialized capability not commonly available.
   2 (Unlikely): Isolated incidents at similar facilities in region. Low 
      target attractiveness. Threat actors present but not focused on this sector.
   3 (Possible): Periodic incidents at similar facilities (1-2 per year regionally).
      Moderate target profile. General threat actor interest in sector.
   4 (Likely): Regular incidents at similar facilities (quarterly+). Known 
      threat actor interest in this specific target profile. Recent attempts.
   5 (Almost Certain): Recent incidents at this specific location or immediate 
      area. Active threat actor targeting. Multiple incidents annually.

   VULNERABILITY:
   1 (Minimal): Controls exceed industry standards (ASIS/TAPA/ISO). Multiple 
      layers of defense. Recent testing confirmed effectiveness. No gaps identified.
   2 (Low): Controls meet industry standards. Minor gaps that don't create 
      exploitable attack paths. Compensating controls in place.
   3 (Moderate): Some controls present but notable gaps exist. Single points 
      of failure identified. Controls not recently tested.
   4 (High): Significant control gaps. Multiple exploitable weaknesses. Controls 
      below industry standards. Easy reconnaissance possible.
   5 (Critical): Controls absent or demonstrably ineffective. Attack path 
      requires minimal effort. No detection capability.

   IMPACT:
   1 (Negligible): Financial loss <$10K. No injuries. No operational disruption 
      beyond hours. No regulatory/legal exposure. Local news only.
   2 (Minor): Financial loss $10-50K. Minor injuries (first aid). Disruption 
      <1 day. Minor regulatory findings. Brief media mention.
   3 (Moderate): Financial loss $50-250K. Injuries requiring medical treatment. 
      Disruption 1-7 days. Regulatory investigation. Regional media coverage.
   4 (Significant): Financial loss $250K-1M. Serious injuries/hospitalization. 
      Disruption 1-4 weeks. Regulatory fines/sanctions. National media.
   5 (Severe): Financial loss >$1M. Fatalities/permanent disability. Disruption 
      >1 month. License revocation possible. Existential business threat.

4. STANDARD-REFERENCED: Cite specific standards when recommending controls:
${getTemplateStandards(templateType)}

5. CONSERVATIVE: When evidence is ambiguous, score toward higher risk. 
   Security assessments should err on the side of caution.

6. AUDITABLE: Your reasoning must be clear enough that another CPP reviewing 
   your assessment would reach the same conclusion given the same evidence.

CRITICAL: If the interview data doesn't provide enough information to assess 
a factor, state "INSUFFICIENT DATA" rather than guessing. Never hallucinate 
facts about the facility.
`;
}

function getTemplateStandards(templateType: string): string {
  switch (templateType) {
    case 'retail_store':
      return `
   - ASIS Retail Security Council Guidelines
   - NRF Loss Prevention Standards
   - PCI-DSS (if handling payment cards)
   - ASIS GDL-RA-2012 (Risk Assessment)
   - ASIS PSC.1-2012 (Physical Security)
   - Reference ORC indicators from RLPSA data`;
      
    case 'warehouse':
      return `
   - TAPA FSR (Facility Security Requirements) Level A/B/C
   - TAPA TSR (Trucking Security Requirements)
   - C-TPAT Security Criteria
   - ASIS GDL-RA-2012 (Risk Assessment)
   - ASIS PSC.1-2012 (Physical Security)
   - Reference CargoNet threat categories`;
      
    case 'datacenter':
      return `
   - SOC 2 Type II Trust Services Criteria (Physical Security)
   - ISO 27001:2022 Annex A.11 (Physical Security)
   - PCI-DSS v4.0 Section 9 (Physical Access)
   - TIA-942 Datacenter Standards
   - ASIS GDL-RA-2012 (Risk Assessment)
   - NIST SP 800-53 PE Family Controls`;
      
    case 'manufacturing':
      return `
   - NIST SP 800-82 (Industrial Control Systems Security)
   - CFATS (if applicable chemicals present)
   - ITAR 22 CFR 120-130 (if defense articles)
   - ASIS GDL-RA-2012 (Risk Assessment)
   - ASIS PSC.1-2012 (Physical Security)
   - Trade Secret Protection (DTSA framework)`;
      
    default:
      return `
   - ASIS GDL-RA-2012 (Risk Assessment)
   - ASIS PSC.1-2012 (Physical Security)`;
  }
}

The User Prompt (Facility-Specific Data)
typescriptfunction buildGroundedAssessmentPrompt(
  threat: ThreatDefinition,
  ctx: FacilityContext,
  templateType: string
): string {
  return `
## ASSESSMENT REQUEST

Assess the following threat for this ${templateType} facility:

**THREAT:** ${threat.name}
**CATEGORY:** ${threat.category}
**ASIS CODE:** ${threat.asisCode}

---

## FACILITY PROFILE (From Interview)

**Basic Information:**
- Facility Type: ${ctx.facilityType}
- Address: ${ctx.address}
- Square Footage: ${ctx.squareFootage}
- Employee Count: ${ctx.employeeCount}
- Operating Hours: ${ctx.operatingHours}
- Years at Location: ${ctx.yearsAtLocation}

**Asset Profile:**
- Primary Assets: ${ctx.primaryAssets}
- Estimated Asset Value: ${ctx.assetValue}
- High-Value Items Present: ${ctx.highValueItems}
- Sensitive Data Handled: ${ctx.sensitiveData}
- Cash Handling: ${ctx.cashHandling}

---

## GEOGRAPHIC THREAT DATA

**CAP Index Scores (100 = National Average):**
- Overall Crime: ${ctx.capIndex.overall}
- Robbery: ${ctx.capIndex.robbery}
- Burglary: ${ctx.capIndex.burglary}
- Theft: ${ctx.capIndex.theft}
- Assault: ${ctx.capIndex.assault}

**Location Factors:**
- Neighborhood Type: ${ctx.neighborhoodType}
- Adjacent Land Use: ${ctx.adjacentLandUse}
- Police Response Time: ${ctx.policeResponseTime}
- Nearest Police Station: ${ctx.nearestPoliceStation}

---

## INCIDENT HISTORY (Client-Reported)

${ctx.incidentHistory.length > 0 
  ? ctx.incidentHistory.map(i => `- ${i.date}: ${i.type} - ${i.description}`).join('\n')
  : '- No incidents reported in past 3 years'}

---

## CURRENT SECURITY CONTROLS

**Perimeter:**
${formatControlStatus(ctx.controls.perimeter)}

**Access Control:**
${formatControlStatus(ctx.controls.accessControl)}

**Surveillance:**
${formatControlStatus(ctx.controls.surveillance)}

**Intrusion Detection:**
${formatControlStatus(ctx.controls.intrusionDetection)}

**Security Personnel:**
${formatControlStatus(ctx.controls.personnel)}

**Policies & Procedures:**
${formatControlStatus(ctx.controls.policies)}

---

## PHOTO ANALYSIS FINDINGS (GPT-4 Vision)

${ctx.photoAnalysis.length > 0
  ? ctx.photoAnalysis.map(p => `
**${p.photoLocation}:**
- Observations: ${p.observations}
- Security Gaps Noted: ${p.gaps}
- Positive Controls Visible: ${p.positives}
`).join('\n')
  : 'No photos analyzed for this assessment.'}

---

## INTERVIEW RESPONSES (Relevant to This Threat)

${getRelevantInterviewResponses(ctx.interviewResponses, threat.id)}

---

## REQUIRED OUTPUT

Provide your assessment as JSON:

{
  "threat_likelihood": {
    "score": <1-5>,
    "evidence": ["specific finding 1", "specific finding 2"],
    "reasoning": "explanation citing evidence and rubric criteria",
    "standard_reference": "ASIS/TAPA/ISO standard if applicable"
  },
  "vulnerability": {
    "score": <1-5>,
    "control_gaps": ["gap 1", "gap 2"],
    "existing_controls": ["control 1", "control 2"],
    "reasoning": "explanation citing evidence and rubric criteria",
    "standard_reference": "ASIS/TAPA/ISO standard if applicable"
  },
  "impact": {
    "score": <1-5>,
    "financial_estimate": "$X-Y range",
    "operational_impact": "description",
    "safety_impact": "description",
    "regulatory_impact": "description", 
    "reputational_impact": "description",
    "reasoning": "explanation citing evidence and rubric criteria"
  },
  "inherent_risk": {
    "score": <T×V×I>,
    "classification": "Critical|High|Medium|Low",
    "confidence": "High|Medium|Low"
  },
  "scenario_description": "2-3 paragraph narrative specific to THIS facility describing how this threat could materialize given the specific conditions observed",
  "priority_controls": [
    {
      "control": "control name",
      "standard": "ASIS PSC.1-2012-XXX or TAPA FSR X.X.X",
      "addresses": "which vulnerability this mitigates",
      "effectiveness": "expected risk reduction %",
      "implementation_priority": "Immediate|Short-term|Medium-term"
    }
  ],
  "data_gaps": ["any missing information that would improve assessment accuracy"]
}
`;
}

Complete Context Source Table
LayerSourceHow It's UsedUpdate FrequencyFacility DataInterview responsesDirect input to promptPer assessmentPhoto analysisVisual evidence of gapsPer assessmentClient incident reportsThreat likelihood evidencePer assessmentAsset inventoryImpact calculationPer assessmentGeographicCAP IndexThreat likelihood baselineQuarterly refreshFBI UCRRegional crime contextAnnualGoogle MapsCPTED analysisPer assessmentMethodologyASIS GDL-RAT×V×I frameworkStatic (embedded)ASIS PSC.1-2012Control standardsStatic (embedded)Scoring rubricsEliminates subjectivityStatic (embedded)Industry StandardsTAPA FSR/TSRWarehouse requirementsVersion updatesSOC 2 / ISO 27001Datacenter requirementsVersion updatesNRF/RLPSARetail benchmarksAnnualPCI-DSSPayment securityVersion updatesThreat IntelCargoNetCargo theft patternsQuarterlyNRF surveysShrinkage dataAnnualOSINT feedsActive threatsContinuousEffectiveness DataASIS researchControl ROIAs publishedRiskFixer outcomesHistorical resultsContinuousInsurance dataLoss correlationsAnnual

What This Prevents
ProblemHow Grounding Prevents ItHallucinated threatsAI can only reference threats in the catalogMade-up scoresRubric anchors force evidence-based justificationGeneric adviceFacility-specific data makes recommendations contextualInconsistent methodologyASIS framework embedded in system promptUnverifiable claimsEvery score must cite specific evidenceOver-confident AIMust flag "INSUFFICIENT DATA" when uncertain

Implementation Files Needed
FilePurposeLines Est.ai-risk-assessment.tsMain AI service300assessment-context-builder.tsBuilds facility context from interview400system-prompts/retail.tsRetail-specific standards200system-prompts/warehouse.tsWarehouse-specific standards (TAPA)200system-prompts/datacenter.tsDatacenter-specific standards (SOC2/ISO)200system-prompts/manufacturing.tsManufacturing-specific standards200scoring-rubrics.tsStandardized T/V/I criteria150threat-intel-integration.tsCAP Index / CargoNet data200
Total: ~1,850 lines for a properly grounded AI assessment system.

