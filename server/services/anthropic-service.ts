import Anthropic from '@anthropic-ai/sdk';
import type { NarrativePrompt, OutputConstraints } from '../types/report-recipe';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface NarrativeOptions {
  maxWords?: number;
  minWords?: number;
  temperature?: number;
}

export interface NarrativeResult {
  content: string;
  wordCount: number;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

function estimateMaxTokens(maxWords?: number): number {
  if (!maxWords) return 2048;
  return Math.ceil(maxWords * 1.5);
}

export async function generateNarrative(
  systemPrompt: string,
  userPrompt: string,
  options: NarrativeOptions = {}
): Promise<NarrativeResult> {
  const maxTokens = estimateMaxTokens(options.maxWords);
  
  const message = await anthropic.messages.create({
    model: DEFAULT_MODEL_STR,
    max_tokens: maxTokens,
    temperature: options.temperature ?? 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = message.content.find(block => block.type === 'text');
  const content = textContent?.type === 'text' ? textContent.text : '';
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return {
    content,
    wordCount,
    model: DEFAULT_MODEL_STR,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  };
}

function interpolateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const keys = path.split('.');
    let value: any = data;
    for (const key of keys) {
      if (value === undefined || value === null) return match;
      value = value[key];
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value ?? match);
  });
}

export async function generateSectionNarrative(
  promptId: string,
  data: Record<string, any>,
  prompts: NarrativePrompt[]
): Promise<NarrativeResult> {
  const prompt = prompts.find(p => p.id === promptId);
  
  if (!prompt) {
    throw new Error(`Narrative prompt not found: ${promptId}`);
  }

  const interpolatedUserPrompt = interpolateTemplate(prompt.userPromptTemplate, data);
  
  let systemPrompt = prompt.systemPrompt;
  
  if (prompt.outputConstraints) {
    const constraints = prompt.outputConstraints;
    const constraintParts: string[] = [];
    
    if (constraints.maxWords) {
      constraintParts.push(`Maximum length: ${constraints.maxWords} words.`);
    }
    if (constraints.minWords) {
      constraintParts.push(`Minimum length: ${constraints.minWords} words.`);
    }
    if (constraints.prohibitedPhrases?.length) {
      constraintParts.push(`Do NOT use these phrases: ${constraints.prohibitedPhrases.join(', ')}.`);
    }
    if (constraints.requiredElements?.length) {
      constraintParts.push(`Must include: ${constraints.requiredElements.join(', ')}.`);
    }
    if (constraints.preferredStructure) {
      constraintParts.push(`Structure: ${constraints.preferredStructure}`);
    }
    
    if (constraintParts.length > 0) {
      systemPrompt += '\n\nOutput Constraints:\n' + constraintParts.join('\n');
    }
  }

  return generateNarrative(systemPrompt, interpolatedUserPrompt, {
    maxWords: prompt.outputConstraints?.maxWords,
    minWords: prompt.outputConstraints?.minWords,
  });
}

export async function generateMultipleSections(
  sectionPromptIds: string[],
  data: Record<string, any>,
  prompts: NarrativePrompt[]
): Promise<Map<string, NarrativeResult>> {
  const results = new Map<string, NarrativeResult>();
  
  for (const promptId of sectionPromptIds) {
    try {
      const result = await generateSectionNarrative(promptId, data, prompts);
      results.set(promptId, result);
    } catch (error) {
      console.error(`Failed to generate section ${promptId}:`, error);
      throw error;
    }
  }
  
  return results;
}

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
