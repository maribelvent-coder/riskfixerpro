/**
 * Risk Engine - Main Entry Point
 * Routes risk calculations to appropriate framework-specific adapter
 * 
 * Supported Frameworks:
 * - Executive Protection (EP): Uses Risk_EP = (T × V × E) × I × (1 - C_e)
 * - Office Building: Standard T×V×I with interview-based vulnerability
 * - Retail Store: T×V×I with shrinkage rate adjustments
 * - Warehouse: T×V×I with cargo theft focus
 */

import { ExecutiveProtectionAdapter } from './adapters/executive-protection';
import { OfficeBuildingAdapter } from './adapters/office-building';
import { RetailStoreAdapter } from './adapters/retail-store';
import { WarehouseAdapter } from './adapters/warehouse';
import { RiskEngineAdapter, InterviewResponse, ThreatData, RiskCalculationResult } from './types';

/**
 * Template types supported by the risk engine
 */
export type TemplateType = 
  | 'executive-protection'
  | 'office-building'
  | 'retail-store'
  | 'warehouse'
  | 'data-center'
  | 'manufacturing';

/**
 * Get the appropriate risk engine adapter for a template type
 * @param templateType - The assessment template type
 * @returns Risk engine adapter instance
 */
export function getRiskEngineAdapter(templateType: string): RiskEngineAdapter {
  const normalizedType = templateType.toLowerCase().trim();
  
  switch (normalizedType) {
    case 'executive-protection':
    case 'executive protection':
    case 'ep':
      return new ExecutiveProtectionAdapter();
    
    case 'office-building':
    case 'office building':
    case 'office':
      return new OfficeBuildingAdapter();
    
    case 'retail-store':
    case 'retail store':
    case 'retail':
      return new RetailStoreAdapter();
    
    case 'warehouse':
    case 'distribution-center':
    case 'distribution center':
      return new WarehouseAdapter();
    
    case 'data-center':
    case 'data center':
      // TODO: Implement data center adapter
      // For now, use office building as fallback
      return new OfficeBuildingAdapter();
    
    case 'manufacturing':
    case 'manufacturing-facility':
      // TODO: Implement manufacturing adapter
      // For now, use warehouse as fallback (similar security concerns)
      return new WarehouseAdapter();
    
    default:
      // Default fallback to office building for unknown types
      console.warn(`Unknown template type: ${templateType}, using office building adapter as fallback`);
      return new OfficeBuildingAdapter();
  }
}

/**
 * Calculate comprehensive risk assessment for a specific threat
 * @param templateType - Assessment template type
 * @param responses - Interview responses map
 * @param threat - Threat data from library
 * @param controls - Array of controls (existing and proposed)
 * @returns Comprehensive risk calculation result
 */
export async function calculateThreatRisk(
  templateType: string,
  responses: Map<string, InterviewResponse>,
  threat: ThreatData,
  controls: Array<{
    id: string;
    name?: string;
    controlType: 'existing' | 'proposed';
    effectiveness?: number | null;
    primaryEffect?: string | null;
  }>
): Promise<RiskCalculationResult> {
  // Get the appropriate adapter
  const adapter = getRiskEngineAdapter(templateType);
  
  // Calculate base risk components
  const likelihood = await adapter.calculateLikelihood(responses, threat.id);
  const vulnerability = await adapter.calculateVulnerability(responses, threat.id);
  const impact = await adapter.calculateImpact(responses, threat.id, threat);
  
  // Calculate exposure for EP threats (optional)
  let exposure: number | undefined;
  if (templateType.toLowerCase().includes('executive') && 'calculateExposure' in adapter) {
    exposure = await (adapter as ExecutiveProtectionAdapter).calculateExposure(responses);
  }
  
  // Calculate control effectiveness
  const existingControls = controls.filter(c => c.controlType === 'existing');
  const controlEffectiveness = calculateControlEffectiveness(existingControls);
  
  // Calculate inherent and current risk
  const inherentRisk = adapter.calculateRisk(likelihood, vulnerability, impact, exposure, 0);
  const currentRisk = adapter.calculateRisk(likelihood, vulnerability, impact, exposure, controlEffectiveness);
  
  // Calculate residual risk with proposed controls
  const proposedControls = controls.filter(c => c.controlType === 'proposed');
  const proposedEffectiveness = calculateControlEffectiveness(proposedControls);
  const totalEffectiveness = Math.min(1, controlEffectiveness + proposedEffectiveness);
  const residualRisk = adapter.calculateRisk(likelihood, vulnerability, impact, exposure, totalEffectiveness);
  
  // Generate recommendations
  const recommendations = await adapter.generateRecommendations(responses, threat.id, currentRisk);
  
  // Generate findings based on vulnerability and controls
  const findings = generateFindings(vulnerability, controlEffectiveness, existingControls);
  
  return {
    threatId: threat.id,
    threatName: threat.name,
    likelihood,
    vulnerability,
    exposure,
    impact,
    inherentRisk,
    currentRisk,
    residualRisk,
    controlEffectiveness,
    recommendations,
    findings,
  };
}

/**
 * Calculate control effectiveness from array of controls
 * Uses compound reduction model: each control reduces remaining risk
 * @param controls - Array of controls with effectiveness ratings
 * @returns Control effectiveness value (0-1)
 */
function calculateControlEffectiveness(
  controls: Array<{
    effectiveness?: number | null;
    primaryEffect?: string | null;
  }>
): number {
  const reductionPerIteration = 0.10; // 10% per effectiveness point
  let remainingRisk = 1.0; // Start at 100%
  
  for (const control of controls) {
    const effectiveness = control.effectiveness || 0;
    
    // Apply 10% reduction 'effectiveness' times (1-5)
    for (let i = 0; i < effectiveness; i++) {
      remainingRisk = remainingRisk * (1 - reductionPerIteration);
    }
  }
  
  // Return effectiveness as reduction from original (0-1)
  return 1 - remainingRisk;
}

/**
 * Generate findings based on vulnerability and control analysis
 * @param vulnerability - Vulnerability score (1-5)
 * @param controlEffectiveness - Control effectiveness (0-1)
 * @param controls - Existing controls
 * @returns Array of findings
 */
function generateFindings(
  vulnerability: number,
  controlEffectiveness: number,
  controls: Array<{ id: string; name?: string; effectiveness?: number | null }>
): string[] {
  const findings: string[] = [];
  
  // Vulnerability-based findings
  if (vulnerability >= 4) {
    findings.push('High vulnerability detected due to missing or ineffective controls');
  } else if (vulnerability >= 3) {
    findings.push('Moderate vulnerability identified - security improvements recommended');
  }
  
  // Control effectiveness findings
  if (controlEffectiveness < 0.3) {
    findings.push('Existing controls provide minimal risk reduction');
  } else if (controlEffectiveness < 0.5) {
    findings.push('Current controls provide moderate protection - enhancement needed');
  } else if (controlEffectiveness >= 0.7) {
    findings.push('Strong control environment with effective risk mitigation');
  }
  
  // Control-specific findings
  const ineffectiveControls = controls.filter(c => (c.effectiveness || 0) <= 2);
  if (ineffectiveControls.length > 0) {
    findings.push(`${ineffectiveControls.length} control(s) rated as ineffective - require attention`);
  }
  
  const effectiveControls = controls.filter(c => (c.effectiveness || 0) >= 4);
  if (effectiveControls.length > 0) {
    findings.push(`${effectiveControls.length} control(s) performing well - maintain effectiveness`);
  }
  
  return findings;
}

// Export types and utilities
export * from './types';
export { ExecutiveProtectionAdapter, OfficeBuildingAdapter, RetailStoreAdapter, WarehouseAdapter };
