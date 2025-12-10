# RiskFixer: Architecture Alignment Implementation Instructions
## For Replit Agents / Claude Code / Software Developers

**Priority:** CRITICAL  
**Deadline:** Before January 1 Launch  
**Estimated Time:** 2-3 days  

---

## CONTEXT: What Problem Are We Solving?

The codebase currently has **two incompatible risk calculation systems**:

1. **Legacy Phase 1 Logic** (in mappers): Calculates T×V×I×E directly, generates scenarios
2. **6-Layer AI Framework** (in ai-risk-assessment): AI-powered scoring with evidence chains

If deployed as-is, RiskFixer will produce **inconsistent, conflicting results**.

**THE DECISION:** The 6-Layer AI Framework is the MVP. All legacy Phase 1 logic must be removed from mappers.

---

## TASK 1: Backup Current Files

Before making any changes, create backups:

```bash
# Create backup directory
mkdir -p server/services/backups

# Backup the files we're modifying
cp server/services/ep-interview-mapper.ts server/services/backups/ep-interview-mapper.ts.backup
cp server/routes.ts server/services/backups/routes.ts.backup
```

---

## TASK 2: Replace EP Interview Mapper

The current `ep-interview-mapper.ts` calculates T×V×I×E scores directly. This is WRONG.

**Replace it with a data-preparation-only version.**

### Step 2.1: Create the new mapper file

Create file: `server/services/ep-interview-mapper-v2.ts`

```typescript
/**
 * RiskFixer Executive Protection Interview Mapper v2.0
 * 
 * DATA PREPARATION ONLY — NO RISK SCORING
 * 
 * This mapper follows the 6-Layer AI Framework architecture where:
 * - Mapper prepares and normalizes interview data
 * - AI Engine performs ALL risk scoring, scenario generation, and narrative creation
 * 
 * The mapper's sole job: Convert structured human answers → structured AI input
 */

// ============================================================================
// INTERFACES — DATA STRUCTURES ONLY (NO SCORES)
// ============================================================================

export type InterviewResponses = Record<string, any>;

export interface ValidationResult {
  isComplete: boolean;
  completionPercentage: number;
  answeredQuestions: number;
  totalQuestions: number;
  missingRequired: string[];
  warnings: string[];
}

export interface PrincipalProfile {
  publicExposureLevel: 'minimal' | 'moderate' | 'significant' | 'extensive' | null;
  mediaPresence: string | null;
  industryCategory: string | null;
  netWorthRange: string | null;
  publicCompanyRole: boolean;
  philanthropicVisibility: boolean;
  hasKnownThreats: boolean;
  threatPerceptionSelfRated: number | null;
  hasActiveAdversary: boolean;
  adversaryType: string | null;
  familyComposition: string[];
  dependentsAtRisk: boolean;
  familyPublicExposure: boolean;
  travelFrequency: 'rare' | 'occasional' | 'frequent' | 'constant' | null;
  internationalTravel: boolean;
  highRiskDestinations: string[];
  currentSecurityMeasures: string[];
  hasProtectionDetail: boolean;
  hasSecureResidence: boolean;
  hasSecureTransportation: boolean;
}

export interface ContextTags {
  hasActiveThreat: boolean;
  hasKnownAdversary: boolean;
  hasPriorIncidents: boolean;
  hasOnlineHarassment: boolean;
  hasHighPublicProfile: boolean;
  hasDigitalExposure: boolean;
  hasPredictablePatterns: boolean;
  hasExposedFamily: boolean;
  hasInternationalTravel: boolean;
  hasTravelToHighRiskAreas: boolean;
  hasExistingProtection: boolean;
  hasSecureResidence: boolean;
  hasSecureTransportation: boolean;
  hasIncidentResponsePlan: boolean;
  requiresFamilyProtection: boolean;
  requiresDigitalProtection: boolean;
  requiresTravelSecurity: boolean;
}

export interface RiskSignal {
  category: 'threat' | 'vulnerability' | 'exposure' | 'impact_amplifier';
  signal: string;
  sourceQuestionId: string;
  sourceAnswer: string;
  severity: 'indicator' | 'concern' | 'critical_indicator';
  affectedThreats: string[];
}

export interface SectionSummary {
  sectionId: string;
  sectionName: string;
  questionCount: number;
  answeredCount: number;
  completionPercentage: number;
  riskSignals: RiskSignal[];
}

export interface Attachment {
  type: 'photo' | 'document' | 'floor_plan' | 'report';
  filename: string;
  url: string;
  analysisRequired: boolean;
  notes?: string;
}

export interface EPMapperOutput {
  assessmentId: number;
  templateType: 'executive_protection';
  preparedAt: string;
  mapperVersion: string;
  validation: ValidationResult;
  interviewData: {
    responses: InterviewResponses;
    completedAt: string;
    version: string;
  };
  principalProfile: PrincipalProfile;
  contextTags: ContextTags;
  sectionSummaries: SectionSummary[];
  riskSignals: RiskSignal[];
  attachments: Attachment[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EP_SECTIONS = [
  { id: 'public_profile', name: 'Public Profile Assessment', requiredQuestions: 6 },
  { id: 'threat_history', name: 'Threat History', requiredQuestions: 6 },
  { id: 'family_composition', name: 'Family Composition', requiredQuestions: 6 },
  { id: 'daily_patterns', name: 'Daily Patterns & Travel', requiredQuestions: 6 },
  { id: 'digital_footprint', name: 'Digital Footprint', requiredQuestions: 6 },
  { id: 'residential_security', name: 'Residential Security', requiredQuestions: 6 },
  { id: 'transportation_security', name: 'Transportation Security', requiredQuestions: 6 },
  { id: 'current_measures', name: 'Current Security Measures', requiredQuestions: 6 },
];

const REQUIRED_QUESTION_IDS = [
  'ep_public_profile_level',
  'ep_media_coverage',
  'ep_net_worth_range',
  'ep_known_threats',
  'ep_threat_perception',
  'ep_family_members',
  'ep_daily_routine_predictability',
  'ep_travel_frequency',
  'ep_social_media_presence',
  'ep_residence_type',
  'ep_transportation_method',
  'ep_current_security_level',
];

const SIGNAL_MAPPINGS = [
  {
    questionId: 'ep_public_profile_level',
    badAnswers: ['very_high', 'high', 'celebrity'],
    signal: 'High public visibility increases targeting likelihood',
    severity: 'concern' as const,
    category: 'exposure' as const,
    affectedThreats: ['stalking_surveillance', 'kidnapping_abduction', 'doxxing_privacy_breach'],
  },
  {
    questionId: 'ep_known_threats',
    badAnswers: ['yes', 'active', 'current', 'recent'],
    signal: 'Active or recent threat history present',
    severity: 'critical_indicator' as const,
    category: 'threat' as const,
    affectedThreats: ['all'],
  },
  {
    questionId: 'ep_daily_routine_predictability',
    badAnswers: ['very_predictable', 'predictable', 'regular'],
    signal: 'Daily patterns are predictable (surveillance advantage)',
    severity: 'concern' as const,
    category: 'vulnerability' as const,
    affectedThreats: ['stalking_surveillance', 'kidnapping_abduction', 'physical_assault'],
  },
  {
    questionId: 'ep_same_routes_daily',
    badAnswers: ['yes', 'always', 'usually'],
    signal: 'Uses same routes daily (ambush vulnerability)',
    severity: 'critical_indicator' as const,
    category: 'vulnerability' as const,
    affectedThreats: ['kidnapping_abduction', 'physical_assault', 'vehicle_attack'],
  },
  {
    questionId: 'ep_social_media_presence',
    badAnswers: ['active', 'very_active', 'public_profiles'],
    signal: 'Active public social media presence (OSINT vulnerability)',
    severity: 'concern' as const,
    category: 'exposure' as const,
    affectedThreats: ['doxxing_privacy_breach', 'stalking_surveillance', 'social_engineering'],
  },
  {
    questionId: 'ep_location_sharing',
    badAnswers: ['yes', 'often', 'real_time'],
    signal: 'Shares location on social media (tracking vulnerability)',
    severity: 'critical_indicator' as const,
    category: 'vulnerability' as const,
    affectedThreats: ['stalking_surveillance', 'kidnapping_abduction'],
  },
  {
    questionId: 'ep_international_high_risk',
    badAnswers: ['yes', 'frequently', 'sometimes'],
    signal: 'Travels to high-risk international destinations',
    severity: 'critical_indicator' as const,
    category: 'exposure' as const,
    affectedThreats: ['kidnapping_abduction', 'express_kidnapping', 'extortion'],
  },
  {
    questionId: 'ep_children_predictable_schedule',
    badAnswers: ['yes', 'very_predictable'],
    signal: 'Children have predictable schedules (vulnerability)',
    severity: 'critical_indicator' as const,
    category: 'vulnerability' as const,
    affectedThreats: ['kidnapping_abduction', 'stalking_surveillance'],
  },
];

// ============================================================================
// DATA PREPARATION FUNCTIONS
// ============================================================================

export function validateInterviewCompletion(responses: InterviewResponses): ValidationResult {
  const answeredQuestions = Object.keys(responses).filter(
    key => responses[key] !== null && responses[key] !== undefined && responses[key] !== ''
  );
  
  const missingRequired = REQUIRED_QUESTION_IDS.filter(
    id => !responses[id] || responses[id] === '' || responses[id] === null
  );
  
  const warnings: string[] = [];
  EP_SECTIONS.forEach(section => {
    const sectionQuestions = Object.keys(responses).filter(
      key => key.startsWith(`ep_${section.id}`) || key.includes(section.id)
    );
    if (sectionQuestions.length > 0 && sectionQuestions.length < section.requiredQuestions) {
      warnings.push(`Section "${section.name}" appears incomplete`);
    }
  });
  
  const totalExpected = 48;
  const completionPercentage = Math.round((answeredQuestions.length / totalExpected) * 100);
  
  return {
    isComplete: missingRequired.length === 0 && completionPercentage >= 90,
    completionPercentage,
    answeredQuestions: answeredQuestions.length,
    totalQuestions: totalExpected,
    missingRequired,
    warnings,
  };
}

export function extractPrincipalProfile(responses: InterviewResponses): PrincipalProfile {
  return {
    publicExposureLevel: mapPublicExposure(responses.ep_public_profile_level),
    mediaPresence: responses.ep_media_coverage || null,
    industryCategory: responses.ep_industry_sector || null,
    netWorthRange: responses.ep_net_worth_range || null,
    publicCompanyRole: responses.ep_public_company_exec === 'yes',
    philanthropicVisibility: responses.ep_philanthropic_visibility === 'yes' || responses.ep_philanthropic_visibility === 'high',
    hasKnownThreats: responses.ep_known_threats === 'yes' || responses.ep_known_threats === 'active',
    threatPerceptionSelfRated: responses.ep_threat_perception ? parseInt(responses.ep_threat_perception) : null,
    hasActiveAdversary: responses.ep_active_adversary === 'yes',
    adversaryType: responses.ep_adversary_type || null,
    familyComposition: extractFamilyComposition(responses),
    dependentsAtRisk: responses.ep_dependents_at_risk === 'yes' || responses.ep_minor_children === 'yes',
    familyPublicExposure: responses.ep_family_public_exposure === 'yes' || responses.ep_family_public_exposure === 'high',
    travelFrequency: mapTravelFrequency(responses.ep_travel_frequency),
    internationalTravel: responses.ep_international_travel === 'yes' || responses.ep_international_travel === 'frequent',
    highRiskDestinations: extractHighRiskDestinations(responses),
    currentSecurityMeasures: extractCurrentMeasures(responses),
    hasProtectionDetail: responses.ep_protection_detail === 'yes' || responses.ep_current_security_level === '24x7',
    hasSecureResidence: responses.ep_residence_security_level === 'high' || responses.ep_residence_security_level === 'comprehensive',
    hasSecureTransportation: responses.ep_vehicle_armored === 'yes' || responses.ep_secure_transportation === 'yes',
  };
}

export function buildContextTags(responses: InterviewResponses): ContextTags {
  return {
    hasActiveThreat: responses.ep_known_threats === 'yes' || responses.ep_known_threats === 'active' || responses.ep_active_adversary === 'yes',
    hasKnownAdversary: responses.ep_active_adversary === 'yes' || responses.ep_adversary_identified === 'yes',
    hasPriorIncidents: responses.ep_prior_incidents === 'yes' || responses.ep_prior_incidents === 'multiple',
    hasOnlineHarassment: responses.ep_online_harassment === 'yes' || responses.ep_cyber_threats === 'yes',
    hasHighPublicProfile: ['very_high', 'high', 'celebrity', 'extensive'].includes(responses.ep_public_profile_level),
    hasDigitalExposure: responses.ep_social_media_presence === 'active' || responses.ep_digital_footprint === 'significant',
    hasPredictablePatterns: responses.ep_daily_routine_predictability === 'predictable' || responses.ep_daily_routine_predictability === 'very_predictable',
    hasExposedFamily: responses.ep_family_public_exposure === 'yes' || responses.ep_family_public_exposure === 'high',
    hasInternationalTravel: responses.ep_international_travel === 'yes' || responses.ep_international_travel === 'frequent',
    hasTravelToHighRiskAreas: responses.ep_international_high_risk === 'yes' || responses.ep_high_risk_destinations === 'yes',
    hasExistingProtection: responses.ep_protection_detail === 'yes' || responses.ep_current_security_level !== 'none',
    hasSecureResidence: responses.ep_residence_security_level === 'high' || responses.ep_residence_security_level === 'comprehensive',
    hasSecureTransportation: responses.ep_vehicle_armored === 'yes' || responses.ep_secure_transportation === 'yes',
    hasIncidentResponsePlan: responses.ep_incident_response_plan === 'yes',
    requiresFamilyProtection: responses.ep_minor_children === 'yes' || responses.ep_family_at_risk === 'yes',
    requiresDigitalProtection: responses.ep_digital_footprint === 'significant' || responses.ep_doxxing_concern === 'yes',
    requiresTravelSecurity: responses.ep_international_high_risk === 'yes' || responses.ep_travel_frequency === 'frequent',
  };
}

export function extractRiskSignals(responses: InterviewResponses): RiskSignal[] {
  const signals: RiskSignal[] = [];
  
  SIGNAL_MAPPINGS.forEach(mapping => {
    const answer = responses[mapping.questionId];
    if (answer && mapping.badAnswers.some(bad => 
      typeof answer === 'string' && answer.toLowerCase().includes(bad.toLowerCase())
    )) {
      signals.push({
        category: mapping.category,
        signal: mapping.signal,
        sourceQuestionId: mapping.questionId,
        sourceAnswer: String(answer),
        severity: mapping.severity,
        affectedThreats: mapping.affectedThreats,
      });
    }
  });
  
  return signals;
}

export function buildSectionSummaries(responses: InterviewResponses, signals: RiskSignal[]): SectionSummary[] {
  return EP_SECTIONS.map(section => {
    const sectionQuestionKeys = Object.keys(responses).filter(
      key => key.startsWith(`ep_${section.id}`) || key.includes(section.id.replace('_', ''))
    );
    
    const answered = sectionQuestionKeys.filter(key => 
      responses[key] !== null && responses[key] !== undefined && responses[key] !== ''
    );
    
    const sectionSignals = signals.filter(signal =>
      signal.sourceQuestionId.includes(section.id.replace('_', ''))
    );
    
    return {
      sectionId: section.id,
      sectionName: section.name,
      questionCount: section.requiredQuestions,
      answeredCount: answered.length,
      completionPercentage: Math.round((answered.length / section.requiredQuestions) * 100),
      riskSignals: sectionSignals,
    };
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapPublicExposure(value: string | undefined): PrincipalProfile['publicExposureLevel'] {
  if (!value) return null;
  const mapping: Record<string, PrincipalProfile['publicExposureLevel']> = {
    'minimal': 'minimal', 'low': 'minimal',
    'moderate': 'moderate', 'medium': 'moderate',
    'significant': 'significant', 'high': 'significant',
    'extensive': 'extensive', 'very_high': 'extensive', 'celebrity': 'extensive',
  };
  return mapping[value.toLowerCase()] || null;
}

function mapTravelFrequency(value: string | undefined): PrincipalProfile['travelFrequency'] {
  if (!value) return null;
  const mapping: Record<string, PrincipalProfile['travelFrequency']> = {
    'rare': 'rare', 'rarely': 'rare',
    'occasional': 'occasional', 'sometimes': 'occasional',
    'frequent': 'frequent', 'often': 'frequent',
    'constant': 'constant', 'always': 'constant',
  };
  return mapping[value.toLowerCase()] || null;
}

function extractFamilyComposition(responses: InterviewResponses): string[] {
  const family: string[] = [];
  if (responses.ep_spouse === 'yes' || responses.ep_married === 'yes') family.push('spouse');
  if (responses.ep_minor_children === 'yes') family.push('minor_children');
  if (responses.ep_adult_children === 'yes') family.push('adult_children');
  if (responses.ep_elderly_parents === 'yes') family.push('elderly_parents');
  if (Array.isArray(responses.ep_family_members)) {
    return [...new Set([...family, ...responses.ep_family_members])];
  }
  return family;
}

function extractHighRiskDestinations(responses: InterviewResponses): string[] {
  if (responses.ep_high_risk_destinations) {
    if (Array.isArray(responses.ep_high_risk_destinations)) {
      return responses.ep_high_risk_destinations;
    }
    if (typeof responses.ep_high_risk_destinations === 'string') {
      return responses.ep_high_risk_destinations.split(',').map((d: string) => d.trim());
    }
  }
  return [];
}

function extractCurrentMeasures(responses: InterviewResponses): string[] {
  const measures: string[] = [];
  if (responses.ep_protection_detail === 'yes') measures.push('protection_detail');
  if (responses.ep_residential_cctv === 'yes') measures.push('residential_cctv');
  if (responses.ep_vehicle_armored === 'yes') measures.push('armored_vehicle');
  if (responses.ep_secure_communications === 'yes') measures.push('secure_communications');
  if (responses.ep_advance_team === 'yes') measures.push('advance_operations');
  if (responses.ep_counter_surveillance === 'yes') measures.push('counter_surveillance');
  if (responses.ep_safe_room === 'yes') measures.push('safe_room');
  if (Array.isArray(responses.ep_current_measures)) {
    return [...new Set([...measures, ...responses.ep_current_measures])];
  }
  return measures;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Prepares interview data for the AI Assessment Engine
 * 
 * THIS FUNCTION DOES NOT calculate scores or generate scenarios.
 * ALL scoring is done by the AI Engine.
 */
export function prepareForAIEngine(
  assessmentId: number,
  responses: InterviewResponses,
  attachments: Attachment[] = []
): EPMapperOutput {
  const validation = validateInterviewCompletion(responses);
  const principalProfile = extractPrincipalProfile(responses);
  const contextTags = buildContextTags(responses);
  const riskSignals = extractRiskSignals(responses);
  const sectionSummaries = buildSectionSummaries(responses, riskSignals);
  
  return {
    assessmentId,
    templateType: 'executive_protection',
    preparedAt: new Date().toISOString(),
    mapperVersion: '2.0',
    validation,
    interviewData: {
      responses,
      completedAt: new Date().toISOString(),
      version: '1.0',
    },
    principalProfile,
    contextTags,
    sectionSummaries,
    riskSignals,
    attachments,
  };
}

export { EP_SECTIONS, REQUIRED_QUESTION_IDS };
```

### Step 2.2: Update imports in routes.ts

Find the current EP imports and replace them:

```typescript
// ❌ OLD IMPORTS (REMOVE THESE)
import { 
  generateEPRiskScenarios,
  calculateExposureFactor,
  EP_THREATS,
  classifyRiskLevel
} from './services/ep-interview-mapper';

// ✅ NEW IMPORTS (ADD THESE)
import { 
  prepareForAIEngine,
  validateInterviewCompletion,
  EPMapperOutput,
} from './services/ep-interview-mapper-v2';

import {
  assessAllThreats,
  generateExecutiveSummary,
} from './services/ai/ai-risk-assessment-v2';
```

---

## TASK 3: Update the /generate-risks Endpoint

Find the EP generate-risks endpoint in `routes.ts` and replace it with the AI-first flow:

```typescript
/**
 * POST /api/assessments/:id/ep-interview/generate-risks
 * 
 * FLOW: Mapper (prep) → AI Engine (scoring) → Database (save)
 */
app.post('/api/assessments/:id/ep-interview/generate-risks', async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const { interviewResponses, attachments = [] } = req.body;

    // 1. Validate assessment exists and is EP type
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
    });

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    if (assessment.facilityType !== 'executive_protection') {
      return res.status(400).json({
        success: false,
        error: 'This endpoint is for Executive Protection assessments only.',
      });
    }

    // 2. Prepare data using mapper (NO SCORING)
    const mapperOutput: EPMapperOutput = prepareForAIEngine(
      assessmentId,
      interviewResponses,
      attachments
    );

    // Check completion
    if (mapperOutput.validation.completionPercentage < 50) {
      return res.status(400).json({
        success: false,
        error: 'Interview too incomplete for risk assessment',
        validation: mapperOutput.validation,
      });
    }

    // 3. Generate scenarios using AI Engine (ALL SCORING HERE)
    const aiResults = await assessAllThreats({
      assessmentId,
      templateType: 'executive_protection',
      interviewResponses,
      principalProfile: mapperOutput.principalProfile,
      contextTags: mapperOutput.contextTags,
      riskSignals: mapperOutput.riskSignals,
      attachments,
    });

    // 4. Save results to database
    const scenarioIds: number[] = [];
    let criticalCount = 0, highCount = 0, mediumCount = 0, lowCount = 0;

    for (const scenario of aiResults.scenarios) {
      const [inserted] = await db.insert(riskScenarios).values({
        assessmentId,
        threatId: scenario.threatId,
        threatLikelihood: scenario.threatLikelihood.score,
        vulnerability: scenario.vulnerability.score,
        impact: scenario.impact.score,
        exposure: scenario.exposure?.score || 1,
        inherentRisk: scenario.inherentRisk.score,
        residualRisk: scenario.residualRisk || scenario.inherentRisk.score,
        riskLevel: scenario.inherentRisk.classification,
        scenarioDescription: scenario.scenarioDescription,
        aiConfidence: scenario.confidence,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: riskScenarios.id });

      scenarioIds.push(inserted.id);

      switch (scenario.inherentRisk.classification) {
        case 'critical': criticalCount++; break;
        case 'high': highCount++; break;
        case 'medium': mediumCount++; break;
        case 'low': lowCount++; break;
      }
    }

    // 5. Generate executive summary
    let executiveSummary;
    try {
      executiveSummary = await generateExecutiveSummary({
        assessmentId,
        principalProfile: mapperOutput.principalProfile,
        scenarios: aiResults.scenarios,
        overallRiskLevel: aiResults.overallRiskLevel,
      });
    } catch (e) {
      console.error('Failed to generate executive summary:', e);
    }

    // 6. Update assessment
    await db.update(assessments)
      .set({
        status: 'complete',
        overallRiskLevel: aiResults.overallRiskLevel,
        executiveSummary,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, assessmentId));

    // 7. Return response
    return res.json({
      success: true,
      mode: aiResults.mode,
      assessmentId,
      results: {
        generatedScenarios: scenarioIds.length,
        criticalRisks: criticalCount,
        highRisks: highCount,
        mediumRisks: mediumCount,
        lowRisks: lowCount,
        scenarioIds,
      },
      aiConfidence: aiResults.confidence,
      executiveSummary,
    });

  } catch (error) {
    console.error('[EP-Generate] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate risk assessment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
```

---

## TASK 4: Remove or Deprecate Legacy Endpoints

Find and remove these endpoints from routes.ts:

```typescript
// ❌ REMOVE OR COMMENT OUT THESE ENDPOINTS

// This is legacy - exposure is now calculated by AI
// app.post('/api/assessments/:id/ep-interview/calculate-exposure', ...);

// This is legacy - AI generates threats dynamically
// app.get('/api/assessments/:id/ep-interview/threats', ...);
```

---

## TASK 5: Verify AI Assessment Service Supports EP

Check `server/services/ai/ai-risk-assessment-v2.ts` and ensure it:

1. Handles `templateType: 'executive_protection'`
2. Uses T×V×I×E formula for EP (with Exposure factor)
3. Has EP-specific system prompt

If the file doesn't exist or doesn't handle EP, you'll need to ensure it's properly integrated. The file should have:

```typescript
// Check that this type is defined
export type TemplateType = 
  | 'office_building'
  | 'retail_store'
  | 'warehouse'
  | 'datacenter'
  | 'manufacturing'
  | 'executive_protection';  // <-- Must include this

// Check that assessAllThreats accepts EP context
export async function assessAllThreats(context: {
  assessmentId: number;
  templateType: TemplateType;
  interviewResponses: Record<string, any>;
  principalProfile?: any;  // <-- EP-specific
  contextTags?: any;       // <-- EP-specific
  riskSignals?: any[];     // <-- EP-specific
  attachments?: any[];
}): Promise<AIAssessmentResult> {
  // ... implementation
}
```

---

## TASK 6: Database Schema Check

Ensure the `risk_scenarios` table has these columns for AI data:

```sql
-- Check if these columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'risk_scenarios';

-- If missing, add them:
ALTER TABLE risk_scenarios 
  ADD COLUMN IF NOT EXISTS exposure INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20),
  ADD COLUMN IF NOT EXISTS threat_likelihood_evidence TEXT,
  ADD COLUMN IF NOT EXISTS threat_likelihood_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS vulnerability_evidence TEXT,
  ADD COLUMN IF NOT EXISTS vulnerability_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS impact_evidence TEXT,
  ADD COLUMN IF NOT EXISTS impact_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS evidence_trail TEXT;

-- Also ensure assessments table has:
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20),
  ADD COLUMN IF NOT EXISTS overall_risk_level VARCHAR(20);
```

---

## TASK 7: Verification Steps

After making changes, verify:

### 7.1 No Legacy Calculations in Mapper

```bash
# These should return NO results
grep -n "threatLikelihood\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "vulnerability\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "impact\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "inherentRisk\s*=" server/services/ep-interview-mapper-v2.ts
grep -n "T\s*\*\s*V\s*\*\s*I" server/services/ep-interview-mapper-v2.ts
```

### 7.2 Build Succeeds

```bash
npm run build
# Should complete with no errors
```

### 7.3 TypeScript Compiles

```bash
npx tsc --noEmit
# Should complete with no errors
```

### 7.4 Test the Endpoint

```bash
# Create a test assessment first, then:
curl -X POST http://localhost:5000/api/assessments/1/ep-interview/generate-risks \
  -H "Content-Type: application/json" \
  -d '{
    "interviewResponses": {
      "ep_public_profile_level": "high",
      "ep_known_threats": "yes",
      "ep_net_worth_range": "10m_50m",
      "ep_daily_routine_predictability": "predictable"
    }
  }'
```

Should return:
```json
{
  "success": true,
  "mode": "ai",
  "results": {
    "generatedScenarios": 12,
    ...
  }
}
```

---

## SUMMARY: Files Changed

| File | Action |
|------|--------|
| `server/services/ep-interview-mapper-v2.ts` | CREATE (new file) |
| `server/services/ep-interview-mapper.ts` | BACKUP then DELETE or RENAME |
| `server/routes.ts` | UPDATE imports and /generate-risks endpoint |
| `server/services/ai/ai-risk-assessment-v2.ts` | VERIFY handles EP |
| Database schema | ADD columns if missing |

---

## CRITICAL REMINDERS

1. **The mapper DOES NOT calculate scores** — it only prepares data
2. **The AI engine does ALL scoring** — T, V, I, E, risk levels, scenarios
3. **Test thoroughly** before deploying
4. **Keep backups** of the original files

---

## Questions?

If anything is unclear or if you encounter errors, check:
1. `/mnt/project/RiskFixer-AI-Assessment-Framework-v1_0.md` — The authoritative AI framework
2. `/mnt/project/ep-ai-risk-assessment.ts` — EP-specific AI implementation
3. `/mnt/project/ai-risk-assessment-v2.ts` — Unified AI service

**END OF INSTRUCTIONS**
