/**
 * Auto-Generate Risk Scenarios from Interview Responses
 * 
 * Orchestrates the complete workflow:
 * 1. Fetch assessment and validate it's office-building type
 * 2. Fetch interview responses (assessment questions)
 * 3. Convert to format expected by risk mapper
 * 4. Run risk analysis using interview-risk-mapping service
 * 5. Create identifiedThreats records from analysis results
 * 6. Update assessment status to advance workflow
 */

import type { IStorage } from '../storage';
import type { Assessment } from '../../shared/schema';
import { 
  analyzeInterviewRisksV3, 
  type InterviewResponseV3,
  type RiskAnalysisResultV3 
} from './interview-risk-mapping';

export interface AutoGenerationResult {
  success: boolean;
  threatsCreated: number;
  criticalThreats: number;
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  errors?: string[];
}

/**
 * Auto-generate risk scenarios from completed interview
 */
export async function autoGenerateScenariosFromInterview(
  assessmentId: string,
  storage: IStorage
): Promise<AutoGenerationResult> {
  
  const errors: string[] = [];
  
  try {
    // Step 1: Fetch assessment and validate
    const assessment = await storage.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    // Validate this is an office-building assessment
    if (assessment.templateId !== 'office-building') {
      throw new Error(`Auto-generation only supported for office-building assessments. This assessment uses template: ${assessment.templateId}`);
    }
    
    // Step 2: Fetch all interview responses
    const questions = await storage.getAssessmentQuestions(assessmentId);
    
    if (questions.length === 0) {
      throw new Error('No interview questions found. Cannot generate scenarios from empty interview.');
    }
    
    // Check completion threshold
    const answeredQuestions = questions.filter(q => 
      q.response !== null && q.response !== undefined && q.response !== ''
    );
    
    const completionRate = (answeredQuestions.length / questions.length) * 100;
    
    if (completionRate < 70) {
      errors.push(`Interview only ${Math.round(completionRate)}% complete. Recommend completing at least 70% before generating scenarios.`);
    }
    
    // Step 3: Convert to format expected by risk mapper
    const responses: InterviewResponseV3[] = questions
      .filter(q => q.response !== null && q.response !== undefined)
      .map(q => ({
        questionId: q.id,
        questionCode: q.questionId || 'unknown',
        answer: q.response as string | number | boolean | null,
        notes: q.notes || undefined
      }));
    
    if (responses.length === 0) {
      throw new Error('No answered questions found. Cannot generate scenarios from unanswered interview.');
    }
    
    console.log(`🔍 Analyzing ${responses.length} interview responses for assessment ${assessmentId}`);
    
    // Step 4: Run risk analysis
    const analysis: RiskAnalysisResultV3 = await analyzeInterviewRisksV3(
      assessment.templateId,
      responses
    );
    
    console.log(`📊 Risk analysis complete: ${analysis.totalThreats} threats identified, ${analysis.criticalThreats} critical`);
    
    // Step 5: Create identifiedThreats records from analysis
    const threatsToCreate = analysis.threatScores.map(score => ({
      assessmentId: assessmentId,
      threatType: mapCategoryToType(score.threatCategory),
      threatName: score.threatName,
      description: buildThreatDescription(score),
      affectedAssets: [], // Can be enhanced later to map to actual assets
      vulnerabilities: score.findings.length > 0 ? score.findings : ['Vulnerabilities identified through interview analysis']
    }));
    
    // Bulk create threats
    const createdThreats = await storage.bulkCreateIdentifiedThreats(threatsToCreate);
    
    console.log(`✅ Created ${createdThreats.length} identified threat records`);
    
    // Validate that at least one threat was created
    if (createdThreats.length === 0) {
      errors.push('No threats were identified from the interview responses. This may indicate incomplete or insufficient data.');
      return {
        success: false,
        threatsCreated: 0,
        criticalThreats: 0,
        overallRiskLevel: analysis.overallRiskLevel,
        summary: 'Failed to generate scenarios: No threats identified.',
        errors
      };
    }
    
    // Step 6: Update assessment status to advance to risk assessment phase
    // Only update if currently in executive-interview phase
    if (assessment.status === 'executive-interview' || assessment.status === 'draft') {
      await storage.updateAssessment(assessmentId, {
        status: 'risk-assessment'
      });
      console.log(`📝 Advanced assessment status to 'risk-assessment'`);
    }
    
    return {
      success: true,
      threatsCreated: createdThreats.length,
      criticalThreats: analysis.criticalThreats,
      overallRiskLevel: analysis.overallRiskLevel,
      summary: analysis.summary,
      errors: errors.length > 0 ? errors : undefined
    };
    
  } catch (error) {
    console.error('❌ Error auto-generating scenarios:', error);
    
    return {
      success: false,
      threatsCreated: 0,
      criticalThreats: 0,
      overallRiskLevel: 'low',
      summary: 'Failed to generate scenarios',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

/**
 * Map threat category to threat type enum
 */
function mapCategoryToType(category: string): string {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('human') || categoryLower.includes('crime') || categoryLower.includes('violence')) {
    return 'human';
  } else if (categoryLower.includes('technical') || categoryLower.includes('cyber')) {
    return 'technical';
  } else if (categoryLower.includes('environmental') || categoryLower.includes('natural')) {
    return 'environmental';
  } else if (categoryLower.includes('operational')) {
    return 'operational';
  }
  
  return 'human'; // Default
}

/**
 * Build threat description from risk score data
 */
function buildThreatDescription(score: any): string {
  const parts: string[] = [];
  
  // Add risk assessment
  parts.push(`Risk Level: ${score.isCritical ? 'CRITICAL' : 'Elevated'}`);
  parts.push(`Inherent Risk Score: ${score.inherentRisk} (L:${score.likelihood} × V:${score.vulnerability} × I:${score.impact})`);
  
  // Add findings if present
  if (score.findings && score.findings.length > 0) {
    parts.push('');
    parts.push('Key Findings:');
    score.findings.slice(0, 3).forEach((finding: string) => {
      parts.push(`• ${finding}`);
    });
  }
  
  // Add recommendations if present
  if (score.recommendations && score.recommendations.length > 0) {
    parts.push('');
    parts.push('Recommended Controls:');
    score.recommendations.slice(0, 3).forEach((rec: string) => {
      parts.push(`• ${rec}`);
    });
  }
  
  // Add control status summary
  const detectedCount = score.affectedControls?.filter((c: any) => c.detected).length || 0;
  const totalControls = score.affectedControls?.length || 0;
  
  if (totalControls > 0) {
    parts.push('');
    parts.push(`Controls Present: ${detectedCount} of ${totalControls} relevant controls detected`);
  }
  
  return parts.join('\n');
}
