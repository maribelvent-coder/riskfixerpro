/**
 * AI Photo Analysis Intelligence for Executive Protection Security
 * 
 * Uses OpenAI GPT-4o Vision to analyze uploaded security photos
 * and identify personal security risks, exposure vulnerabilities, and protection gaps
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.");
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Context types for executive protection photo analysis
 */
export type ExecutiveProtectionPhotoContext = 
  | 'residence'          // Primary residence, home security
  | 'office-executive'   // Executive office, workspace
  | 'vehicle'            // Vehicle security, motorcade
  | 'travel-location'    // Hotels, destinations, public venues
  | 'public-event'       // Public appearances, conferences
  | 'general';           // Unknown or multi-purpose

/**
 * Photo analysis result
 */
export interface PhotoAnalysisResult {
  securityRisks: string[];
  positiveFindings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

/**
 * Analyze an executive protection security photo using GPT-4o Vision
 * 
 * @param imagePath - Path to the image file
 * @param context - What environment this photo represents
 * @param caption - Optional user-provided caption/description
 * @returns Structured security analysis
 */
export async function analyzeExecutiveProtectionPhoto(
  imagePath: string,
  context: ExecutiveProtectionPhotoContext = 'general',
  caption?: string
): Promise<PhotoAnalysisResult> {
  
  try {
    const client = getOpenAIClient();
    
    // Read image file and convert to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    
    // Construct context-specific prompt
    const prompt = constructVisionPrompt(context, caption);
    
    // Call OpenAI GPT-4o Vision API
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert executive protection specialist analyzing security photos. You specialize in:
- Kidnapping and abduction prevention
- Stalking and harassment threat assessment
- OSINT exposure and privacy vulnerabilities
- Travel security and advance work
- Residential security and family protection
- Counter-surveillance and threat detection
- CPTED (Crime Prevention Through Environmental Design) principles

Provide thorough, actionable security assessments based on visual evidence.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent security analysis
      max_tokens: 800
    });
    
    const analysisText = response.choices[0].message.content || "Failed to analyze image.";
    
    // Parse the structured response
    const result = parseAnalysisResponse(analysisText);
    
    console.log(`✅ Analyzed executive protection photo (${context}): ${result.securityRisks.length} risks, ${result.positiveFindings.length} positives`);
    
    return result;
    
  } catch (error) {
    console.error("❌ Error analyzing executive protection photo:", error);
    throw new Error(`Failed to analyze photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct context-specific vision analysis prompt
 */
function constructVisionPrompt(context: ExecutiveProtectionPhotoContext, caption?: string): string {
  
  const baseInstructions = `Analyze this executive protection security photo and provide a structured assessment.`;
  
  const captionText = caption ? `\n\n**Photo Caption:** ${caption}` : '';
  
  // Context-specific security focuses
  const contextGuidance: Record<ExecutiveProtectionPhotoContext, string> = {
    'residence': `**Focus Areas for Residence Security:**
- Perimeter fence/wall (height, material, deterrent value)
- Gate security (automation, intercom, camera)
- Landscaping (clear sight lines vs. concealment for intruders)
- Window security (bars, film, locks visible)
- Lighting (motion-activated, coverage, dark zones)
- Surveillance cameras (coverage, blind spots)
- Address numbers visible from street (privacy concern)
- Predictable routines indicated (car always parked in same spot)
- Neighbor proximity (natural surveillance)
- Entry point vulnerabilities (unlocked gates, accessible windows)`,
    
    'office-executive': `**Focus Areas for Executive Office:**
- Office location visibility from public areas
- Clear sight lines to desk (sniper threat through windows)
- Escape route availability (secondary exit visible)
- Panic button placement
- Visitor access control (reception, screening)
- Document security (whiteboards, papers with sensitive info)
- Window treatments (blinds, film for privacy)
- Protective barriers between door and desk
- Electronic sweep indicators (phone, computer placement)
- Personal security devices (duress alarms)`,
    
    'vehicle': `**Focus Areas for Vehicle Security:**
- Vehicle armoring indicators (thick glass, weight)
- Tinted windows (privacy level)
- License plate visibility (OSINT exposure)
- Parking location predictability (same spot daily)
- Run-flat tires visible
- Driver training indicators (defensive positioning)
- Rear-seat passenger security (child seats = family targeting)
- GPS tracking device visible
- Advance team presence (security lead vehicle)
- Public route exposure (traffic chokepoints, predictable routes)`,
    
    'travel-location': `**Focus Areas for Travel Locations:**
- Hotel room location (ground floor = easy access, top floor = escape limitation)
- Exit route visibility (stairwells, secondary exits)
- Room number visible (OSINT exposure)
- Balcony accessibility from adjacent rooms
- Security presence (guards, cameras)
- Advance work indicators (security sweep, room inspection)
- Minibar/room service usage (poisoning opportunity)
- Window access from outside (ladders, adjacent buildings)
- Door security (deadbolt, chain, peephole)
- Lobby visibility (public exposure during check-in)`,
    
    'public-event': `**Focus Areas for Public Events:**
- Crowd density and chokepoints (stampede risk, targeting opportunity)
- Security screening visible (metal detectors, bag checks)
- Protective detail positioning (close protection agents)
- Escape route availability (blocked exits, congestion)
- Elevated positions (sniper perches)
- Stage/podium security (barriers, setback distance)
- Public photography (OSINT exposure, facial recognition)
- Vehicle staging (extraction readiness)
- Medical support visible (ambulance, first aid)
- Counter-surveillance indicators (security scanning crowd)`,
    
    'general': `**General Executive Protection Focus:**
- Personal exposure risks
- Routine predictability indicators
- Privacy vulnerabilities
- Escape route availability
- Protective measure presence
- Threat approach vectors`
  };
  
  const guidance = contextGuidance[context];
  
  return `${baseInstructions}${captionText}

${guidance}

**Provide your analysis in this exact format:**

SECURITY RISKS:
- [List specific security vulnerabilities you observe]

POSITIVE FINDINGS:
- [List security controls or good practices you observe]

RECOMMENDATIONS:
- [List specific, actionable security improvements]

RISK LEVEL: [low/medium/high/critical]

SUMMARY:
[2-3 sentence executive summary of the security posture shown in this photo]`;
}

/**
 * Parse the GPT-4o Vision response into structured format
 */
function parseAnalysisResponse(text: string): PhotoAnalysisResult {
  
  const securityRisks: string[] = [];
  const positiveFindings: string[] = [];
  const recommendations: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let summary = '';
  
  // Split response into sections
  const lines = text.split('\n');
  let currentSection: 'risks' | 'positive' | 'recommendations' | 'summary' | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect section headers
    if (trimmed.match(/^SECURITY RISKS?:/i)) {
      currentSection = 'risks';
      continue;
    } else if (trimmed.match(/^POSITIVE FINDINGS?:/i)) {
      currentSection = 'positive';
      continue;
    } else if (trimmed.match(/^RECOMMENDATIONS?:/i)) {
      currentSection = 'recommendations';
      continue;
    } else if (trimmed.match(/^RISK LEVEL:/i)) {
      const match = trimmed.match(/^RISK LEVEL:\s*(low|medium|high|critical)/i);
      if (match) {
        riskLevel = match[1].toLowerCase() as typeof riskLevel;
      }
      currentSection = null;
      continue;
    } else if (trimmed.match(/^SUMMARY:/i)) {
      currentSection = 'summary';
      continue;
    }
    
    // Parse bullet points or numbered items
    if (currentSection && trimmed.startsWith('-')) {
      const item = trimmed.substring(1).trim();
      if (item) {
        if (currentSection === 'risks') securityRisks.push(item);
        else if (currentSection === 'positive') positiveFindings.push(item);
        else if (currentSection === 'recommendations') recommendations.push(item);
      }
    } else if (currentSection === 'summary' && trimmed) {
      summary += (summary ? ' ' : '') + trimmed;
    }
  }
  
  // Fallback to simple parsing if structured parsing failed
  if (securityRisks.length === 0 && positiveFindings.length === 0) {
    summary = text.substring(0, 300); // Use first 300 chars as summary
  }
  
  return {
    securityRisks,
    positiveFindings,
    recommendations,
    riskLevel,
    summary: summary || 'Security analysis completed.'
  };
}

/**
 * Determine MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}
