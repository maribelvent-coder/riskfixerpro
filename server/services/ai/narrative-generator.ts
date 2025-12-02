/**
 * AI Narrative Generator Factory
 * 
 * Routes narrative generation requests to template-specific services
 * based on assessment.templateId
 */

import type { RiskScenario, Assessment } from '@shared/schema';
import { generateWarehouseRiskNarrative } from './warehouse-narrative';
import { generateOfficeRiskNarrative } from './office-narrative';
import { generateManufacturingRiskNarrative } from './manufacturing-narrative';
import { generateDataCenterRiskNarrative } from './datacenter-narrative';
import { generateExecutiveProtectionRiskNarrative } from './executive-protection-narrative';
import { generateRetailRiskNarrative } from './retail-narrative';

/**
 * Generate AI-powered risk narrative for any assessment template
 * 
 * @param scenario - The risk scenario to analyze
 * @param assessment - The parent assessment containing template-specific profile data
 * @param surveyResponses - Facility survey responses for context
 * @returns Professional security narrative
 */
export async function generateRiskNarrative(
  scenario: RiskScenario,
  assessment: Assessment,
  surveyResponses: Record<string, any> | null = null
): Promise<string> {
  
  const templateId = assessment.templateId;
  
  if (!templateId) {
    throw new Error("Assessment templateId is required for narrative generation");
  }
  
  // Route to template-specific narrative generator
  switch (templateId) {
    case 'warehouse-distribution':
      return generateWarehouseRiskNarrative(scenario, assessment, surveyResponses);
    
    case 'office-building':
      return generateOfficeRiskNarrative(scenario, assessment, surveyResponses);
    
    case 'manufacturing-facility':
      return generateManufacturingRiskNarrative(scenario, assessment, surveyResponses);
    
    case 'data-center':
      return generateDataCenterRiskNarrative(scenario, assessment, surveyResponses);
    
    case 'executive-protection':
      return generateExecutiveProtectionRiskNarrative(scenario, assessment, surveyResponses);
    
    case 'retail-store':
      return generateRetailRiskNarrative(scenario, assessment, surveyResponses);
    
    default:
      throw new Error(`Unknown assessment template: ${templateId}`);
  }
}
