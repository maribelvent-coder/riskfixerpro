import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateNarrativesParams {
  reportType: string;
  assessment: any;
  scenarios: any[];
}

export async function generateReportNarratives(params: GenerateNarrativesParams) {
  const { reportType, assessment, scenarios } = params;
  
  const executiveSummaryPrompt = `
You are writing an executive summary for a ${assessment.facilityType} security assessment report.
Write in a professional consulting tone. Use narrative prose, not bullet points.

ASSESSMENT:
- Name: ${assessment.name}
- Type: ${assessment.facilityType}
- Date: ${new Date(assessment.createdAt).toLocaleDateString()}

RISK SCENARIOS (${scenarios.length} total):
${scenarios.slice(0, 5).map(s => 
  `- ${s.threatId}: Risk Score ${s.inherentRisk}/125 (T:${s.threatLikelihood} V:${s.vulnerability} I:${s.impact})`
).join('\n')}

Generate a 2-3 paragraph executive summary that:
1. Introduces the assessment scope and methodology
2. Highlights the key risk findings
3. Provides forward-looking guidance on priorities

Return ONLY the narrative text, no JSON or formatting.
`;

  const executiveSummaryResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: executiveSummaryPrompt }],
    max_tokens: 1000,
  });
  
  const executiveSummary = executiveSummaryResponse.choices[0]?.message?.content || '';
  
  const conclusionPrompt = `
Write a 2-paragraph conclusion for a security assessment of ${assessment.name}.

Key findings were:
${scenarios.slice(0, 3).map(s => `- ${s.threatId}: ${s.riskLevel} risk`).join('\n')}

The conclusion should:
1. Synthesize the main findings
2. Recommend where to begin implementation
3. End with a forward-looking statement

Return ONLY the narrative text.
`;

  const conclusionResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: conclusionPrompt }],
    max_tokens: 500,
  });
  
  const conclusion = conclusionResponse.choices[0]?.message?.content || '';
  
  return {
    executiveSummary,
    conclusion,
  };
}
