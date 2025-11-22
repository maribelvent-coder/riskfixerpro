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
import { 
  analyzeManufacturingPhoto,
  type ManufacturingPhotoContext
} from './manufacturing-photo-analysis';
import { 
  analyzeDataCenterPhoto,
  type DataCenterPhotoContext
} from './datacenter-photo-analysis';
import { 
  analyzeExecutiveProtectionPhoto,
  type ExecutiveProtectionPhotoContext
} from './executive-protection-photo-analysis';

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
    
    case 'manufacturing-facility':
      return analyzeManufacturingPhoto(
        imagePath,
        (context as ManufacturingPhotoContext) || 'general',
        caption
      );
    
    case 'data-center':
      return analyzeDataCenterPhoto(
        imagePath,
        (context as DataCenterPhotoContext) || 'general',
        caption
      );
    
    case 'executive-protection':
      return analyzeExecutiveProtectionPhoto(
        imagePath,
        (context as ExecutiveProtectionPhotoContext) || 'general',
        caption
      );
    
    case 'warehouse-distribution':
    case 'retail-store':
      // TODO: Implement warehouse and retail photo analysis
      throw new Error(`Photo analysis not yet implemented for template: ${templateId}`);
    
    default:
      throw new Error(`Unknown assessment template: ${templateId}`);
  }
}
