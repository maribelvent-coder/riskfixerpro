/**
 * AI Narrative Generator Factory
 * 
 * Routes narrative generation requests to template-specific services
 * based on assessment.templateId
 */

import type { RiskScenario, Assessment } from '@shared/schema';
import { generateWarehouseRiskNarrative } from './warehouse-narrative';
import { generateOfficeRiskNarrative } from './office-narrative';

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
    
    case 'retail-store':
    case 'executive-protection':
    case 'manufacturing-facility':
    case 'data-center':
      // TODO: Implement template-specific narrative generators
      throw new Error(`Narrative generation not yet implemented for template: ${templateId}`);
    
    default:
      throw new Error(`Unknown assessment template: ${templateId}`);
  }
}
