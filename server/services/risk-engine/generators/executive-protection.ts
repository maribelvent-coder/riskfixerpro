/**
 * Executive Protection Risk Scenario Generator
 * 
 * Generates risk scenarios for EP assessments by analyzing:
 * 1. Executive Profile - High-value target indicators (net worth, public profile)
 * 2. Interview Responses - Vulnerability and exposure factors
 * 
 * Based on Executive Protection Framework with T×V×E×I formula
 */

import type { IStorage } from '../../../storage';
import type { 
  Assessment, 
  ExecutiveProfile,
  InsertRiskScenario 
} from '@shared/schema';

/**
 * Structured result from scenario generation
 */
export interface EPScenarioGenerationResult {
  success: boolean;
  scenariosCreated: number;
  criticalScenarios: number;
  summary: string;
  errors?: string[];
}

/**
 * Calculate overall risk level from inherent risk score
 */
function classifyRiskLevel(inherentRisk: number): string {
  if (inherentRisk >= 75) return 'Critical';
  if (inherentRisk >= 50) return 'High';
  if (inherentRisk >= 25) return 'Medium';
  return 'Low';
}

/**
 * Map numeric score to text descriptor for likelihood
 */
function mapLikelihoodToText(score: number): string {
  if (score >= 4.5) return 'very-high';
  if (score >= 3.5) return 'high';
  if (score >= 2.5) return 'medium';
  if (score >= 1.5) return 'low';
  return 'very-low';
}

/**
 * Map numeric score to text descriptor for impact
 */
function mapImpactToText(score: number): string {
  if (score >= 4.5) return 'catastrophic';
  if (score >= 3.5) return 'major';
  if (score >= 2.5) return 'moderate';
  if (score >= 1.5) return 'minor';
  return 'negligible';
}

/**
 * Generate Kidnapping for Ransom scenario (High Net Worth targets)
 */
function generateKidnappingScenario(
  assessmentId: string,
  profile: ExecutiveProfile | null
): InsertRiskScenario | null {
  
  // Only generate for high net worth individuals (>$50M)
  if (!profile || !profile.netWorthRange) {
    return null;
  }
  
  const netWorth = profile.netWorthRange;
  const isHighValue = netWorth.includes('50-100M') || netWorth.includes('100M+');
  
  if (!isHighValue) {
    console.log('  ⏭️  Skipping Kidnapping scenario (net worth < $50M)');
    return null;
  }
  
  // High net worth targets have elevated kidnapping risk
  const threat = 5; // Maximum threat (professional criminal targeting)
  const vulnerability = profile.hasPersonalProtection ? 2 : 4;
  const impact = 5; // Catastrophic (life-threatening + financial loss)
  const exposure = profile.publicProfile === 'very_high' ? 4 : 3;
  
  const inherentRisk = threat * vulnerability * impact * exposure;
  const riskLevel = classifyRiskLevel(inherentRisk);
  
  console.log(`  ✅ Generated Kidnapping scenario (Net Worth: ${netWorth}, Risk: ${riskLevel})`);
  
  return {
    assessmentId,
    scenario: 'Kidnapping for Ransom',
    asset: 'Executive Principal',
    threatType: 'human',
    description: `High-value target for organized criminal groups due to significant net worth (${netWorth}). Kidnapping risk is elevated due to wealth visibility and potential lack of adequate protection detail.`,
    likelihood: mapLikelihoodToText(threat),
    impact: mapImpactToText(impact),
    inherentRisk,
    currentRisk: inherentRisk,
    residualRisk: inherentRisk,
    riskLevel,
    treatmentStrategy: 'mitigate',
    justification: `Principal's net worth (${netWorth}) makes them a high-value target. ${profile.hasPersonalProtection ? 'Current personal protection reduces vulnerability.' : 'No personal protection detail increases vulnerability.'}`,
    consequences: 'Life-threatening situation, significant ransom demands, psychological trauma, business disruption, reputational damage',
    threatActors: 'Organized crime groups, professional kidnappers, foreign terrorist organizations',
    attackVectors: 'Ambush during routine travel, home invasion, false emergency scenarios'
  };
}

/**
 * Generate Stalking/Doxxing scenario (High public profile targets)
 */
function generateStalkingScenario(
  assessmentId: string,
  profile: ExecutiveProfile | null
): InsertRiskScenario | null {
  
  if (!profile) {
    return null;
  }
  
  // Only generate for publicly visible individuals
  const isPublic = profile.publicProfile === 'very_high' || 
                   profile.publicProfile === 'high' ||
                   profile.mediaExposure === 'frequent';
  
  if (!isPublic) {
    console.log('  ⏭️  Skipping Stalking scenario (low public profile)');
    return null;
  }
  
  const threat = 4; // High threat (accessible targets attract stalkers)
  const vulnerability = 4; // High (public visibility creates exposure)
  const impact = 3; // Moderate to Major (psychological harm, potential escalation)
  const exposure = profile.publicProfile === 'very_high' ? 5 : 4;
  
  const inherentRisk = threat * vulnerability * impact * exposure;
  const riskLevel = classifyRiskLevel(inherentRisk);
  
  console.log(`  ✅ Generated Stalking scenario (Public Profile: ${profile.publicProfile}, Risk: ${riskLevel})`);
  
  return {
    assessmentId,
    scenario: 'Stalking / Doxxing',
    asset: 'Executive Principal',
    threatType: 'human',
    description: `High public visibility (${profile.publicProfile} profile with ${profile.mediaExposure} media exposure) creates stalking and doxxing vulnerability. Personal information may be accessible online, enabling harassment and physical surveillance.`,
    likelihood: mapLikelihoodToText(threat),
    impact: mapImpactToText(impact),
    inherentRisk,
    currentRisk: inherentRisk,
    residualRisk: inherentRisk,
    riskLevel,
    treatmentStrategy: 'mitigate',
    justification: `Public profile (${profile.publicProfile}) and media exposure (${profile.mediaExposure}) increase stalking risk. Online footprint enables doxxing and targeted harassment.`,
    consequences: 'Psychological distress, privacy invasion, home address exposure, family harassment, potential escalation to violence',
    threatActors: 'Obsessed individuals, disgruntled employees, activist groups, online trolls',
    attackVectors: 'Social media tracking, property records search, surveillance at known locations, family targeting'
  };
}

/**
 * Generate Vehicular Ambush scenario (Predictable commute patterns)
 */
function generateVehicularAmbushScenario(
  assessmentId: string,
  profile: ExecutiveProfile | null,
  hasArmoredVehicle: boolean,
  routePredictability: string = 'medium'
): InsertRiskScenario | null {
  
  if (!profile) {
    return null;
  }
  
  // Only generate for high-value targets with predictable patterns
  const isHighValue = profile.netWorthRange?.includes('50M') || profile.netWorthRange?.includes('100M+');
  const isPredictable = routePredictability === 'high' || routePredictability === 'very_high';
  
  if (!isHighValue || !isPredictable) {
    console.log('  ⏭️  Skipping Vehicular Ambush scenario (not high-value or unpredictable routes)');
    return null;
  }
  
  const threat = 4; // High threat (predictable patterns enable planning)
  const vulnerability = hasArmoredVehicle ? 2 : 5;
  const impact = 5; // Catastrophic (life-threatening)
  const exposure = 4; // High (commute patterns observable)
  
  const inherentRisk = threat * vulnerability * impact * exposure;
  const riskLevel = classifyRiskLevel(inherentRisk);
  
  console.log(`  ✅ Generated Vehicular Ambush scenario (Armored Vehicle: ${hasArmoredVehicle}, Risk: ${riskLevel})`);
  
  return {
    assessmentId,
    scenario: 'Vehicular Ambush',
    asset: 'Executive Principal',
    threatType: 'human',
    description: `Predictable commute patterns combined with high-value status create vulnerability to vehicular ambush attacks. ${hasArmoredVehicle ? 'Armored vehicle provides significant protection but route variation is still recommended.' : 'Lack of armored vehicle and route variation creates critical vulnerability.'}`,
    likelihood: mapLikelihoodToText(threat),
    impact: mapImpactToText(impact),
    inherentRisk,
    currentRisk: inherentRisk,
    residualRisk: inherentRisk,
    riskLevel,
    treatmentStrategy: 'mitigate',
    justification: `Fixed commute patterns (${routePredictability} predictability) enable threat actors to plan ambush. ${hasArmoredVehicle ? 'Current armored vehicle mitigates some risk.' : 'No armored vehicle protection increases vulnerability.'}`,
    consequences: 'Injury or death, kidnapping attempt, vehicle damage, psychological trauma, business disruption',
    threatActors: 'Organized crime, terrorist groups, professional kidnappers, hostile competitors',
    attackVectors: 'Roadblock ambush, PIT maneuver, vehicle ramming, chokepoint attacks at traffic signals'
  };
}

/**
 * Generate comprehensive risk scenarios for Executive Protection assessments
 */
export async function generateExecutiveProtectionRiskScenarios(
  assessmentId: string,
  storage: IStorage
): Promise<EPScenarioGenerationResult> {
  
  const errors: string[] = [];
  const scenarios: InsertRiskScenario[] = [];
  
  try {
    // Step 1: Retrieve assessment
    const assessment = await storage.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    // Validate this is an EP assessment
    if (assessment.templateId !== 'executive-protection') {
      throw new Error(`This generator is for executive protection assessments. Current template: ${assessment.templateId}`);
    }
    
    // Step 2: Retrieve executive profile
    const profile = await storage.getExecutiveProfileByAssessment(assessmentId);
    
    if (!profile) {
      errors.push('Executive profile not configured. Complete the Principal Profile first.');
      return {
        success: false,
        scenariosCreated: 0,
        criticalScenarios: 0,
        summary: 'Executive profile not found',
        errors
      };
    }
    
    console.log(`📊 EP Data Retrieved:
      - Profile: ${profile.fullName}
      - Net Worth: ${profile.netWorthRange || 'not specified'}
      - Public Profile: ${profile.publicProfile}
      - Protection: ${profile.hasPersonalProtection ? 'Yes' : 'No'}
    `);
    
    // Step 3: Generate scenario candidates (validate before persisting)
    
    // Scenario 1: Kidnapping for Ransom (high net worth only)
    const kidnappingScenario = generateKidnappingScenario(assessmentId, profile);
    if (kidnappingScenario) {
      scenarios.push(kidnappingScenario);
    }
    
    // Scenario 2: Stalking/Doxxing (high public profile only)
    const stalkingScenario = generateStalkingScenario(assessmentId, profile);
    if (stalkingScenario) {
      scenarios.push(stalkingScenario);
    }
    
    // Scenario 3: Vehicular Ambush (high value + predictable patterns)
    // TODO: Get route predictability from interview responses when available
    const vehicularScenario = generateVehicularAmbushScenario(
      assessmentId,
      profile,
      profile.hasArmoredVehicle || false,
      'high' // Default to high for now
    );
    if (vehicularScenario) {
      scenarios.push(vehicularScenario);
    }
    
    // Step 4: Validate scenarios were generated
    if (scenarios.length === 0) {
      errors.push('No risk scenarios generated. Profile may not meet thresholds for automatic scenario creation.');
      return {
        success: false,
        scenariosCreated: 0,
        criticalScenarios: 0,
        summary: 'No scenarios met generation criteria',
        errors
      };
    }
    
    // Step 5: Persist new scenarios FIRST (with atomic rollback on failure)
    // Only delete old scenarios if new ones are successfully created
    const createdScenarios: any[] = [];
    try {
      // Create all new scenarios first
      for (const scenario of scenarios) {
        const created = await storage.createRiskScenario(scenario);
        createdScenarios.push(created);
      }
      
      console.log(`✅ Created ${createdScenarios.length} new EP risk scenarios`);
      
      // Step 6: Only now delete old scenarios (creation succeeded)
      const existingScenarios = await storage.getRiskScenarios(assessmentId);
      const epScenarioNames = [
        'Kidnapping for Ransom',
        'Stalking / Doxxing',
        'Vehicular Ambush'
      ];
      
      // Don't delete the scenarios we just created
      const createdIds = new Set(createdScenarios.map(s => s.id));
      const scenariosToDelete = existingScenarios.filter(s => 
        epScenarioNames.includes(s.scenario) && !createdIds.has(s.id)
      );
      
      for (const scenario of scenariosToDelete) {
        await storage.deleteRiskScenario(scenario.id);
      }
      
      console.log(`🗑️  Cleared ${scenariosToDelete.length} old EP scenarios`);
      
      // Count critical scenarios
      const criticalCount = createdScenarios.filter((s: any) => 
        s.inherentRisk && s.inherentRisk >= 75
      ).length;
      
      return {
        success: true,
        scenariosCreated: createdScenarios.length,
        criticalScenarios: criticalCount,
        summary: `Generated ${createdScenarios.length} executive protection risk scenarios based on principal profile and threat intelligence.`,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (createError) {
      // Rollback: Delete any new scenarios that were created before the error
      // This preserves the original scenarios
      console.error(`❌ Error creating scenarios, rolling back ${createdScenarios.length} new scenarios (preserving originals)`);
      for (const created of createdScenarios) {
        try {
          await storage.deleteRiskScenario(created.id);
        } catch (deleteError) {
          console.error(`⚠️ Failed to rollback scenario ${created.id}:`, deleteError);
        }
      }
      
      throw createError; // Re-throw to propagate error to caller
    }
    
  } catch (error) {
    console.error('❌ Error generating EP risk scenarios:', error);
    
    return {
      success: false,
      scenariosCreated: 0,
      criticalScenarios: 0,
      summary: 'Failed to generate scenarios',
      errors: [
        ...(errors),
        (error as Error).message
      ]
    };
  }
}
