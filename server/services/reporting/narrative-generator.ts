import Handlebars from 'handlebars';
import { db } from "../../db";
import { narrativePrompts } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateNarrative, type NarrativeResult } from "../anthropic-service";
import type { ReportDataPackage } from "../../types/report-data";
import type { OutputConstraints } from "../../types/report-recipe";

Handlebars.registerHelper('formatDate', function(date: string | Date) {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

Handlebars.registerHelper('join', function(array: any[], separator: string) {
  if (!Array.isArray(array)) return '';
  return array.join(separator || ', ');
});

Handlebars.registerHelper('uppercase', function(str: string) {
  return str?.toUpperCase() || '';
});

Handlebars.registerHelper('lowercase', function(str: string) {
  return str?.toLowerCase() || '';
});

Handlebars.registerHelper('pluralize', function(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
});

Handlebars.registerHelper('formatNumber', function(num: number) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-US');
});

Handlebars.registerHelper('formatCurrency', function(num: number) {
  if (typeof num !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
});

Handlebars.registerHelper('severityColor', function(severity: string) {
  const colors: Record<string, string> = {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#CA8A04',
    low: '#16A34A'
  };
  return colors[severity?.toLowerCase()] || '#6B7280';
});

Handlebars.registerHelper('priorityLabel', function(priority: string) {
  const labels: Record<string, string> = {
    immediate: 'Immediate Action Required',
    'short-term': 'Short-Term (0-30 days)',
    'medium-term': 'Medium-Term (30-90 days)',
    'long-term': 'Long-Term (90+ days)'
  };
  return labels[priority?.toLowerCase()] || priority;
});

Handlebars.registerHelper('json', function(obj: any) {
  return JSON.stringify(obj, null, 2);
});

Handlebars.registerHelper('first', function(array: any[], count: number) {
  if (!Array.isArray(array)) return [];
  return array.slice(0, count || 1);
});

Handlebars.registerHelper('last', function(array: any[], count: number) {
  if (!Array.isArray(array)) return [];
  return array.slice(-(count || 1));
});

Handlebars.registerHelper('length', function(array: any[]) {
  return Array.isArray(array) ? array.length : 0;
});

Handlebars.registerHelper('gt', function(a: number, b: number) {
  return a > b;
});

Handlebars.registerHelper('lt', function(a: number, b: number) {
  return a < b;
});

Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('or', function(...args: any[]) {
  args.pop();
  return args.some(arg => !!arg);
});

Handlebars.registerHelper('and', function(...args: any[]) {
  args.pop();
  return args.every(arg => !!arg);
});

function applyOutputConstraints(content: string, constraints?: OutputConstraints): string {
  if (!constraints) return content;
  
  let result = content;
  
  if (constraints.prohibitedPhrases && constraints.prohibitedPhrases.length > 0) {
    for (const phrase of constraints.prohibitedPhrases) {
      const regex = new RegExp(phrase, 'gi');
      result = result.replace(regex, '');
    }
  }
  
  result = result.replace(/\s{2,}/g, ' ').trim();
  
  return result;
}

export interface NarrativeGenerationResult extends NarrativeResult {
  promptId: string;
  sectionId: string;
  constraintsApplied: boolean;
}

export async function generateSectionNarrative(
  promptId: string, 
  data: ReportDataPackage
): Promise<NarrativeGenerationResult> {
  console.log(`[NarrativeGenerator] Generating narrative for prompt: ${promptId}`);
  
  const [prompt] = await db
    .select()
    .from(narrativePrompts)
    .where(eq(narrativePrompts.id, promptId));
  
  if (!prompt) {
    throw new Error(`Narrative prompt not found: ${promptId}`);
  }

  const outputConstraints = prompt.outputConstraints as OutputConstraints | null;
  
  let compiledUserPrompt: string;
  try {
    const template = Handlebars.compile(prompt.userPromptTemplate);
    compiledUserPrompt = template(data);
  } catch (error) {
    console.error(`[NarrativeGenerator] Template compilation error for ${promptId}:`, error);
    throw new Error(`Failed to compile template for prompt ${promptId}`);
  }

  let systemPrompt = prompt.systemPrompt;
  
  if (outputConstraints) {
    const constraintParts: string[] = [];
    
    if (outputConstraints.maxWords) {
      constraintParts.push(`Maximum length: ${outputConstraints.maxWords} words.`);
    }
    if (outputConstraints.minWords) {
      constraintParts.push(`Minimum length: ${outputConstraints.minWords} words.`);
    }
    if (outputConstraints.prohibitedPhrases?.length) {
      constraintParts.push(`Do NOT use these phrases: ${outputConstraints.prohibitedPhrases.join(', ')}.`);
    }
    if (outputConstraints.requiredElements?.length) {
      constraintParts.push(`Must include: ${outputConstraints.requiredElements.join(', ')}.`);
    }
    if (outputConstraints.preferredStructure) {
      constraintParts.push(`Structure: ${outputConstraints.preferredStructure}`);
    }
    
    if (constraintParts.length > 0) {
      systemPrompt += '\n\nOutput Constraints:\n' + constraintParts.join('\n');
    }
  }

  console.log(`[NarrativeGenerator] Calling Anthropic API...`);
  
  const result = await generateNarrative(systemPrompt, compiledUserPrompt, {
    maxWords: outputConstraints?.maxWords,
    minWords: outputConstraints?.minWords,
    temperature: 0.7
  });

  const processedContent = applyOutputConstraints(result.content, outputConstraints || undefined);

  console.log(`[NarrativeGenerator] Generated ${result.wordCount} words for ${promptId}`);
  console.log(`[NarrativeGenerator] Token usage: ${result.usage.inputTokens} input, ${result.usage.outputTokens} output`);

  return {
    ...result,
    content: processedContent,
    promptId,
    sectionId: prompt.sectionId,
    constraintsApplied: !!outputConstraints
  };
}

export async function generateMultipleNarratives(
  promptIds: string[],
  data: ReportDataPackage
): Promise<Map<string, NarrativeGenerationResult>> {
  const results = new Map<string, NarrativeGenerationResult>();
  
  for (const promptId of promptIds) {
    try {
      const result = await generateSectionNarrative(promptId, data);
      results.set(promptId, result);
    } catch (error) {
      console.error(`[NarrativeGenerator] Failed to generate narrative for ${promptId}:`, error);
      throw error;
    }
  }
  
  return results;
}

export async function getNarrativePrompt(promptId: string) {
  const [prompt] = await db
    .select()
    .from(narrativePrompts)
    .where(eq(narrativePrompts.id, promptId));
  return prompt;
}

export async function getAllNarrativePrompts() {
  return db.select().from(narrativePrompts);
}
