import OpenAI from 'openai';
import type { GeographicIntelligence } from '../../types/report-data';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateNarrativesParams {
  reportType: string;
  assessment: any;
  scenarios: any[];
  geographicIntelligence?: GeographicIntelligence;
}

function buildGeoIntelContext(geoIntel?: GeographicIntelligence): string {
  if (!geoIntel) return 'No geographic intelligence data available for this location.';
  
  const parts: string[] = [];
  
  const capIndex = geoIntel.capIndexData;
  if (capIndex && capIndex.overallCrimeIndex > 0) {
    const ratingText = capIndex.comparisonRating ? ` (${capIndex.comparisonRating.replace('_', ' ')} vs national average)` : '';
    parts.push(`CAP INDEX DATA: Overall Crime Score: ${capIndex.overallCrimeIndex}${ratingText}. Violent crime rate: ${capIndex.violentCrimes?.rate_per_100k || 0}/100K. Property crime rate: ${capIndex.propertyCrimes?.rate_per_100k || 0}/100K. Data period: ${capIndex.dataTimePeriod || 'N/A'}.`);
  }
  
  const crimeData = geoIntel.crimeData;
  if (crimeData && crimeData.totalIncidents > 0) {
    const topCrimes = (crimeData.crimeTypes || []).slice(0, 5)
      .map(c => `${c.type} (${c.count} incidents)`)
      .join(', ');
    parts.push(`CRIME DATA: ${crimeData.totalIncidents} total incidents recorded, ${crimeData.recentIncidents || 0} in the past year. Crime risk level: ${(crimeData.riskLevel || 'unknown').toUpperCase()}. Top crime types: ${topCrimes || 'N/A'}. Trend: ${crimeData.trendDirection || 'unknown'}.`);
  }
  
  const siteIncidents = geoIntel.siteIncidents || [];
  if (siteIncidents.length > 0) {
    const criticalCount = siteIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    const incidentTypes = [...new Set(siteIncidents.map(i => i.incidentType))].slice(0, 3).join(', ');
    parts.push(`SITE INCIDENTS: ${siteIncidents.length} documented incidents at this location${criticalCount > 0 ? ` (${criticalCount} critical/high severity)` : ''}. Types: ${incidentTypes}.`);
  }
  
  const pois = geoIntel.pointsOfInterest || [];
  if (pois.length > 0) {
    const highRiskPOIs = pois.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
    if (highRiskPOIs.length > 0) {
      parts.push(`HIGH-RISK POIs: ${highRiskPOIs.length} concerning points of interest nearby: ${highRiskPOIs.slice(0, 3).map(p => `${p.name} (${p.poiType})`).join(', ')}.`);
    }
  }
  
  return parts.length > 0 ? parts.join('\n') : 'Geographic intelligence reviewed; no significant risk factors identified.';
}

export async function generateReportNarratives(params: GenerateNarrativesParams) {
  const { reportType, assessment, scenarios, geographicIntelligence } = params;
  
  const geoContext = buildGeoIntelContext(geographicIntelligence);
  
  const executiveSummaryPrompt = `
You are writing an executive summary for a ${assessment.facilityType || assessment.templateId} security assessment report.
Write in a professional consulting tone. Use narrative prose, not bullet points.

ASSESSMENT:
- Name: ${assessment.name}
- Type: ${assessment.facilityType || assessment.templateId}
- Date: ${new Date(assessment.createdAt).toLocaleDateString()}

RISK SCENARIOS (${scenarios.length} total):
${scenarios.slice(0, 5).map(s => 
  `- ${s.threatId || s.scenario}: Risk Score ${s.inherentRisk}/125 (T:${s.threatLikelihood} V:${s.vulnerability} I:${s.impact})`
).join('\n')}

GEOGRAPHIC RISK INTELLIGENCE:
${geoContext}

Generate a 2-3 paragraph executive summary that:
1. Introduces the assessment scope and methodology
2. Highlights the key risk findings including any relevant geographic/crime data
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
${scenarios.slice(0, 3).map(s => `- ${s.threatId || s.scenario}: ${s.riskLevel} risk`).join('\n')}

${geographicIntelligence ? `Geographic context: ${geographicIntelligence.riskContext}` : ''}

The conclusion should:
1. Synthesize the main findings including geographic risk factors
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
  
  let geographicNarrative = '';
  const hasGeoData = geographicIntelligence && (
    (geographicIntelligence.crimeData?.totalIncidents ?? 0) > 0 || 
    (geographicIntelligence.siteIncidents?.length ?? 0) > 0 ||
    (geographicIntelligence.capIndexData?.overallCrimeIndex ?? 0) > 0
  );
  if (hasGeoData) {
    const geoNarrativePrompt = `
Write a 2-paragraph geographic risk analysis section for a security assessment report.

LOCATION: ${assessment.name}

CRIME DATA:
${geoContext}

Write a professional analysis that:
1. Summarizes the crime environment and trends around the location
2. Discusses the implications for security planning
3. Provides context for how this affects overall risk posture

Return ONLY the narrative text, no headers or formatting.
`;
    
    const geoResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: geoNarrativePrompt }],
      max_tokens: 600,
    });
    
    geographicNarrative = geoResponse.choices[0]?.message?.content || '';
  }
  
  return {
    executiveSummary,
    conclusion,
    geographicNarrative,
    hasGeographicData: hasGeoData,
  };
}
