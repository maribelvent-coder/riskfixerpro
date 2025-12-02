export type AssessmentType = 
  | 'executive-protection'
  | 'office-building'
  | 'retail-store'
  | 'warehouse'
  | 'data-center'
  | 'manufacturing';

export type ReportType = 'executive-summary' | 'comprehensive' | 'client-dashboard';
export type ToneSetting = 'executive' | 'technical' | 'hybrid';
export type ContentType = 'narrative' | 'table' | 'visualization' | 'mixed';

export interface ReportRecipe {
  id: string;
  name: string;
  description: string;
  reportType: ReportType;
  assessmentTypes: AssessmentType[];
  sections: SectionDefinition[];
  toneSetting: ToneSetting;
  branding?: BrandingConfig;
  pageLayout?: PageLayoutConfig;
}

export interface SectionDefinition {
  id: string;
  title: string;
  order: number;
  required: boolean;
  pageBreakBefore: boolean;
  contentType: ContentType;
  requiredData: string[];
  optionalData?: string[];
  narrativePromptId?: string;
  maxWords?: number;
  minWords?: number;
  tableConfig?: TableConfiguration;
  visualizationId?: string;
  displayCondition?: DisplayCondition;
}

export interface DisplayCondition {
  field: string;
  operator: 'exists' | 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value?: any;
}

export interface NarrativePrompt {
  id: string;
  sectionId: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputConstraints?: OutputConstraints;
}

export interface OutputConstraints {
  maxWords?: number;
  minWords?: number;
  prohibitedPhrases?: string[];
  requiredElements?: string[];
  preferredStructure?: string;
}

export interface TableConfiguration {
  id: string;
  columns: ColumnDefinition[];
  dataSource: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  highlightRows?: RowHighlightConfig;
  footerRow?: Record<string, string>;
  footerStyle?: 'bold' | 'italic' | 'normal';
}

export interface ColumnDefinition {
  header: string;
  field: string;
  width: string;
  bold?: boolean;
  format?: 'text' | 'date' | 'number' | 'multiplier' | 'severity-badge' | 'priority-badge' | 'comma-list' | 'percentage';
}

export interface RowHighlightConfig {
  condition: {
    field: string;
    operator: 'greaterThan' | 'lessThan' | 'equals';
    value: any;
  };
  style: 'bold' | 'highlight' | 'warning';
}

export interface BrandingConfig {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface PageLayoutConfig {
  pageSize: 'Letter' | 'A4';
  margins: { top: string; right: string; bottom: string; left: string };
  headerHeight?: string;
  footerHeight?: string;
}
