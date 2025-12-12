import { db } from "../../db";
import { reportRecipes, generatedReports } from "@shared/schema";
import { eq } from "drizzle-orm";
import { assembleReportData } from "./report-data-assembler";
import { generateSectionNarrative, type NarrativeGenerationResult } from "./narrative-generator";
import { renderTable, type RenderedTable } from "./table-renderer";
import type { ReportDataPackage } from "../../types/report-data";
import type { 
  ReportRecipe, 
  SectionDefinition, 
  TableConfiguration,
  DisplayCondition
} from "../../types/report-recipe";

export interface GeneratedSection {
  id: string;
  title: string;
  order: number;
  narrativeContent?: string;
  tableContent?: RenderedTable;
  pageBreakBefore: boolean;
  generationMetadata?: {
    wordCount?: number;
    model?: string;
    tokensUsed?: number;
  };
}

export interface GeneratedReportResult {
  recipeId: string;
  assessmentId: string;
  generatedAt: Date;
  sections: GeneratedSection[];
  dataSnapshot: ReportDataPackage;
  generationLog: GenerationLogEntry[];
  totalTokensUsed: number;
  totalNarrativeWords: number;
}

export interface GenerationLogEntry {
  sectionId: string;
  timestamp: Date;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration?: number;
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  return value;
}

function checkDisplayCondition(condition: DisplayCondition, data: ReportDataPackage): boolean {
  const fieldValue = getNestedValue(data, condition.field);
  
  switch (condition.operator) {
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    case 'equals':
      return fieldValue === condition.value;
    case 'greaterThan':
      return typeof fieldValue === 'number' && fieldValue > condition.value;
    case 'lessThan':
      return typeof fieldValue === 'number' && fieldValue < condition.value;
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(condition.value);
      }
      return false;
    default:
      return true;
  }
}

function validateRequiredData(section: SectionDefinition, data: ReportDataPackage): string[] {
  const missingFields: string[] = [];
  
  for (const field of section.requiredData) {
    const value = getNestedValue(data, field);
    if (value === undefined || value === null) {
      missingFields.push(field);
    }
    if (Array.isArray(value) && value.length === 0) {
      missingFields.push(`${field} (empty array)`);
    }
  }
  
  return missingFields;
}

async function generateSectionContent(
  section: SectionDefinition,
  data: ReportDataPackage,
  log: GenerationLogEntry[]
): Promise<GeneratedSection> {
  const startTime = Date.now();
  
  const generatedSection: GeneratedSection = {
    id: section.id,
    title: section.title,
    order: section.order,
    pageBreakBefore: section.pageBreakBefore
  };

  try {
    if (section.contentType === 'narrative' || section.contentType === 'mixed') {
      if (section.narrativePromptId) {
        console.log(`[ReportGenerator] Generating narrative for section: ${section.id}`);
        const narrativeResult = await generateSectionNarrative(section.narrativePromptId, data);
        generatedSection.narrativeContent = narrativeResult.content;
        generatedSection.generationMetadata = {
          wordCount: narrativeResult.wordCount,
          model: narrativeResult.model,
          tokensUsed: narrativeResult.usage.inputTokens + narrativeResult.usage.outputTokens
        };
      }
    }

    if (section.contentType === 'table' || section.contentType === 'mixed') {
      if (section.tableConfig) {
        console.log(`[ReportGenerator] Rendering table for section: ${section.id}`);
        const tableResult = renderTable(section.tableConfig, data);
        generatedSection.tableContent = tableResult;
      }
    }

    log.push({
      sectionId: section.id,
      timestamp: new Date(),
      status: 'success',
      message: `Successfully generated section: ${section.title}`,
      duration: Date.now() - startTime
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ReportGenerator] Error generating section ${section.id}:`, errorMessage);
    
    log.push({
      sectionId: section.id,
      timestamp: new Date(),
      status: 'error',
      message: `Failed to generate section: ${errorMessage}`,
      duration: Date.now() - startTime
    });
  }

  return generatedSection;
}

export async function generateReport(
  assessmentId: string, 
  recipeId: string
): Promise<GeneratedReportResult> {
  console.log(`[ReportGenerator] Starting report generation`);
  console.log(`[ReportGenerator] Assessment ID: ${assessmentId}`);
  console.log(`[ReportGenerator] Recipe ID: ${recipeId}`);
  
  const [recipeRecord] = await db
    .select()
    .from(reportRecipes)
    .where(eq(reportRecipes.id, recipeId));
  
  if (!recipeRecord) {
    throw new Error(`Report recipe not found: ${recipeId}`);
  }

  const recipe = recipeRecord as unknown as { 
    id: string;
    sections: SectionDefinition[];
    toneSetting: string;
    branding?: any;
    pageLayout?: any;
  };

  console.log(`[ReportGenerator] Recipe loaded: ${recipeRecord.name}`);
  console.log(`[ReportGenerator] Total sections: ${recipe.sections?.length || 0}`);

  const dataPackage = await assembleReportData(assessmentId);
  console.log(`[ReportGenerator] Data package assembled successfully`);

  // EP Field Mapping: Translate epReportData fields to template-expected field names
  // The recipe expects flat fields like 'threatScore', 'principalProfile', 'threatDomains'
  // but epReportData has nested structures like componentSummaries.threat.overallScore
  if (dataPackage.epReportData) {
    const ep = dataPackage.epReportData;
    
    // Map component scores to flat fields expected by mathematical-reality section
    (dataPackage as any).threatScore = ep.componentSummaries?.threat?.overallScore || 0;
    (dataPackage as any).vulnerabilityScore = ep.componentSummaries?.vulnerability?.overallScore || 0;
    (dataPackage as any).impactScore = ep.componentSummaries?.impact?.overallScore || 0;
    (dataPackage as any).exposureScore = ep.componentSummaries?.exposure?.overallScore || 0;
    (dataPackage as any).overallRiskScore = ep.overallRiskScore;
    (dataPackage as any).riskLevel = ep.riskClassification;
    
    // Map threatAssessments to threatDomains format expected by risk-landscape section
    (dataPackage as any).threatDomains = ep.threatAssessments.map(t => ({
      id: t.threatId,
      name: t.threatName,
      category: t.category,
      number: ep.threatAssessments.indexOf(t) + 1,
      findings: t.scenarioDescription || t.threatLikelihood?.reasoning || '',
      riskScore: t.riskScore?.normalized || 0,
      priority: t.riskScore?.classification || 'medium',
      likelihood: t.threatLikelihood?.score || 0,
      vulnerability: t.vulnerability?.score || 0,
      impact: t.impact?.score || 0
    }));
    
    // Construct principalProfile object from EP fields
    (dataPackage as any).principalProfile = {
      name: ep.principalName || 'Principal',
      title: ep.principalTitle || 'Executive',
      company: ep.principalCompany || '',
      exposureFactor: ep.exposureFactor,
      riskClassification: ep.riskClassification
    };
    
    // Also set principalName at top level for cover section
    (dataPackage as any).principalName = ep.principalName || 'Principal';
    (dataPackage as any).principalTitle = ep.principalTitle || 'Executive';
    
    // Map prioritized controls to recommendations format
    (dataPackage as any).prioritizedRecommendations = (ep.prioritizedControls || []).map(c => ({
      id: c.controlId,
      name: c.controlName,
      category: c.category,
      urgency: c.urgency,
      rationale: c.rationale,
      estimatedCost: c.estimatedCost,
      addressesThreats: c.addressesThreats
    }));
    
    // Map top risk signals to key findings
    (dataPackage as any).keyFindings = (ep.topRiskSignals || []).map(s => s.signal);
    (dataPackage as any).topPriorities = (ep.prioritizedControls || []).slice(0, 3).map(c => c.controlName);
    
    // Map EP data to interviewFindings format for vulnerability-reality section
    // Use topRiskSignals and threat evidence as interview findings
    const interviewFindingsFromEP: any[] = [];
    
    // Add findings from top risk signals
    (ep.topRiskSignals || []).forEach(signal => {
      interviewFindingsFromEP.push({
        source: 'Principal',
        role: 'Executive',
        date: dataPackage.generatedAt,
        findings: [{ finding: signal.signal }],
        keyQuote: signal.signal
      });
    });
    
    // Add findings from threat vulnerability assessments
    ep.threatAssessments.forEach(t => {
      if (t.vulnerability?.controlGaps && t.vulnerability.controlGaps.length > 0) {
        interviewFindingsFromEP.push({
          source: 'Security Assessment',
          role: 'Analyst',
          date: dataPackage.generatedAt,
          findings: t.vulnerability.controlGaps.map(gap => ({ finding: gap })),
          keyQuote: t.vulnerability.reasoning || `Gaps identified in ${t.threatName} defenses`
        });
      }
    });
    
    (dataPackage as any).interviewFindings = interviewFindingsFromEP;
    
    // Map EP vulnerability data to siteWalkFindings format
    const siteWalkFindingsFromEP: any[] = [];
    
    ep.threatAssessments.forEach(t => {
      // Extract control gaps as site walk findings
      if (t.vulnerability?.controlGaps && t.vulnerability.controlGaps.length > 0) {
        siteWalkFindingsFromEP.push({
          location: 'Principal Environment',
          date: dataPackage.generatedAt,
          findings: t.vulnerability.controlGaps.map(gap => ({
            finding: gap,
            quote: t.vulnerability.reasoning
          }))
        });
      }
      
      // Extract evidence trail as findings
      if (t.evidenceTrail && t.evidenceTrail.length > 0) {
        siteWalkFindingsFromEP.push({
          location: t.threatName,
          date: dataPackage.generatedAt,
          findings: t.evidenceTrail.map(e => ({ finding: e }))
        });
      }
    });
    
    (dataPackage as any).siteWalkFindings = siteWalkFindingsFromEP;
    
    // Add geographic context placeholders (would come from GeoIntel if available)
    (dataPackage as any).workplaceCAP = dataPackage.geographicIntelligence?.capIndexData?.overallCrimeIndex || 'N/A';
    (dataPackage as any).workplaceBE = 'N/A';
    (dataPackage as any).residenceCAP = 'N/A';
    (dataPackage as any).residenceVC = 'N/A';
    
    // Add assessment metadata
    (dataPackage as any).assessmentDate = dataPackage.generatedAt;
    (dataPackage as any).consultantName = 'RiskFixer Security Consulting';
    (dataPackage as any).methodology = 'ASIS International Security Risk Assessment Standard (ASIS SRA-2024)';
    (dataPackage as any).dataSources = [
      { type: 'Interview', description: 'Executive protection questionnaire', date: dataPackage.generatedAt },
      { type: 'AI Analysis', description: 'T×V×I×E risk calculation engine', date: dataPackage.generatedAt }
    ];
    (dataPackage as any).siteWalkDates = dataPackage.generatedAt;
    
    console.log(`[ReportGenerator] EP field mapping applied:
    - threatScore: ${(dataPackage as any).threatScore}
    - vulnerabilityScore: ${(dataPackage as any).vulnerabilityScore}
    - impactScore: ${(dataPackage as any).impactScore}
    - overallRiskScore: ${(dataPackage as any).overallRiskScore}
    - interviewFindings: ${(dataPackage as any).interviewFindings?.length || 0}
    - siteWalkFindings: ${(dataPackage as any).siteWalkFindings?.length || 0}
    - threatDomains: ${(dataPackage as any).threatDomains?.length || 0}
    - principalName: ${(dataPackage as any).principalName}`);
  }

  const generationLog: GenerationLogEntry[] = [];
  const generatedSections: GeneratedSection[] = [];
  let totalTokensUsed = 0;
  let totalNarrativeWords = 0;

  const sortedSections = [...(recipe.sections || [])].sort((a, b) => a.order - b.order);

  for (const section of sortedSections) {
    console.log(`[ReportGenerator] Processing section ${section.order}: ${section.title}`);
    
    if (section.displayCondition) {
      const shouldDisplay = checkDisplayCondition(section.displayCondition, dataPackage);
      if (!shouldDisplay) {
        console.log(`[ReportGenerator] Skipping section ${section.id} - display condition not met`);
        generationLog.push({
          sectionId: section.id,
          timestamp: new Date(),
          status: 'skipped',
          message: 'Display condition not met'
        });
        continue;
      }
    }

    const missingData = validateRequiredData(section, dataPackage);
    if (missingData.length > 0 && section.required) {
      console.warn(`[ReportGenerator] Section ${section.id} missing required data: ${missingData.join(', ')}`);
    }

    const generatedSection = await generateSectionContent(section, dataPackage, generationLog);
    generatedSections.push(generatedSection);

    if (generatedSection.generationMetadata?.tokensUsed) {
      totalTokensUsed += generatedSection.generationMetadata.tokensUsed;
    }
    if (generatedSection.generationMetadata?.wordCount) {
      totalNarrativeWords += generatedSection.generationMetadata.wordCount;
    }
  }

  console.log(`[ReportGenerator] Report generation complete`);
  console.log(`[ReportGenerator] Total sections generated: ${generatedSections.length}`);
  console.log(`[ReportGenerator] Total tokens used: ${totalTokensUsed}`);
  console.log(`[ReportGenerator] Total narrative words: ${totalNarrativeWords}`);

  return {
    recipeId,
    assessmentId,
    generatedAt: new Date(),
    sections: generatedSections,
    dataSnapshot: dataPackage,
    generationLog,
    totalTokensUsed,
    totalNarrativeWords
  };
}

export async function saveGeneratedReport(
  result: GeneratedReportResult,
  userId?: string
): Promise<string> {
  const reportId = crypto.randomUUID();
  
  await db.insert(generatedReports).values({
    id: reportId,
    assessmentId: result.assessmentId,
    recipeId: result.recipeId,
    reportType: 'executive-summary',
    status: 'completed',
    dataSnapshot: result.dataSnapshot as any,
    generationLog: result.generationLog as any,
    generatedAt: result.generatedAt,
    generatedBy: userId || null
  });

  console.log(`[ReportGenerator] Saved generated report: ${reportId}`);
  return reportId;
}

export async function getGeneratedReports(assessmentId: string) {
  return db
    .select()
    .from(generatedReports)
    .where(eq(generatedReports.assessmentId, assessmentId));
}

export async function getGeneratedReport(reportId: string) {
  const [report] = await db
    .select()
    .from(generatedReports)
    .where(eq(generatedReports.id, reportId));
  return report;
}

export async function getRecipe(recipeId: string) {
  const [recipe] = await db
    .select()
    .from(reportRecipes)
    .where(eq(reportRecipes.id, recipeId));
  return recipe;
}

export async function getAllRecipes() {
  return db.select().from(reportRecipes);
}
