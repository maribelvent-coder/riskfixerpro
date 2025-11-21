/**
 * AI Photo Analyzer Factory
 * 
 * Routes photo analysis requests to template-specific vision services
 * based on assessment.templateId
 */

import type { Assessment } from '@shared/schema';
import { 
  analyzeOfficePhoto, 
  type OfficePhotoContext,
  type PhotoAnalysisResult 
} from './office-photo-analysis';

/**
 * Analyze a security photo using template-specific vision AI
 * 
 * @param imagePath - Path to the uploaded security photo
 * @param assessment - The parent assessment to determine template context
 * @param context - Optional context hint (lobby, work-area, etc.)
 * @param caption - Optional user-provided caption
 * @returns Structured security analysis
 */
export async function analyzeSecurityPhoto(
  imagePath: string,
  assessment: Assessment,
  context?: string,
  caption?: string
): Promise<PhotoAnalysisResult> {
  
  const templateId = assessment.templateId;
  
  if (!templateId) {
    throw new Error("Assessment templateId is required for photo analysis");
  }
  
  // Route to template-specific photo analyzer
  switch (templateId) {
    case 'office-building':
      return analyzeOfficePhoto(
        imagePath,
        (context as OfficePhotoContext) || 'general',
        caption
      );
    
    case 'warehouse-distribution':
      // TODO: Implement warehouse photo analysis
      // return analyzeWarehousePhoto(imagePath, context || 'general', caption);
      throw new Error(`Photo analysis not yet implemented for template: ${templateId}`);
    
    case 'retail-store':
    case 'executive-protection':
    case 'manufacturing-facility':
    case 'data-center':
      // TODO: Implement template-specific photo analyzers
      throw new Error(`Photo analysis not yet implemented for template: ${templateId}`);
    
    default:
      throw new Error(`Unknown assessment template: ${templateId}`);
  }
}
