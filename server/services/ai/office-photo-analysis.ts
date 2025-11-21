/**
 * AI Photo Analysis Intelligence for Office Building Security
 * 
 * Uses OpenAI GPT-4o Vision to analyze uploaded security photos
 * and identify workplace violence, data security, and access control risks
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
 * Context types for office building photo analysis
 */
export type OfficePhotoContext = 
  | 'lobby'           // Reception, entrance areas, visitor access
  | 'work-area'       // Open office, cubicles, desk spaces
  | 'server-room'     // IT infrastructure, data centers
  | 'conference-room' // Meeting spaces
  | 'emergency-exit'  // Evacuation routes, stairwells
  | 'general';        // Unknown or multi-purpose area

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
 * Analyze an office building security photo using GPT-4o Vision
 * 
 * @param imagePath - Path to the image file
 * @param context - What part of the office this photo represents
 * @param caption - Optional user-provided caption/description
 * @returns Structured security analysis
 */
export async function analyzeOfficePhoto(
  imagePath: string,
  context: OfficePhotoContext = 'general',
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
          content: `You are an expert physical security consultant analyzing office building security photos. You specialize in:
- Workplace violence prevention and threat indicators
- Data security and clean desk compliance
- Access control and visitor management
- Emergency preparedness and life safety
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
    
    console.log(`✅ Analyzed office photo (${context}): ${result.securityRisks.length} risks, ${result.positiveFindings.length} positives`);
    
    return result;
    
  } catch (error) {
    console.error("❌ Error analyzing office photo:", error);
    throw new Error(`Failed to analyze photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct context-specific vision analysis prompt
 */
function constructVisionPrompt(context: OfficePhotoContext, caption?: string): string {
  
  const baseInstructions = `Analyze this office building security photo and provide a structured assessment.`;
  
  const captionText = caption ? `\n\n**Photo Caption:** ${caption}` : '';
  
  // Context-specific security focuses
  const contextGuidance: Record<OfficePhotoContext, string> = {
    'lobby': `**Focus Areas for Lobby/Reception:**
- Tailgating opportunities (can unauthorized people follow employees through doors?)
- Visitor management controls (is there a staffed reception? visitor sign-in visible?)
- Line-of-sight security (can reception see all entry points?)
- Access control gates/turnstiles present?
- Emergency panic buttons visible?
- CCTV camera coverage
- Unattended packages or security concerns`,
    
    'work-area': `**Focus Areas for Work Area/Cubicles:**
- Clean desk violations (passwords on sticky notes, confidential documents visible)
- Unsecured laptops or mobile devices
- Privacy screen filters on monitors
- File cabinets unlocked or documents exposed
- USB drives or external media visible
- Whiteboards with sensitive information
- Visitor badges required for non-employees?
- Clear escape routes for emergencies`,
    
    'server-room': `**Focus Areas for Server Room/IT Infrastructure:**
- Propped doors or malfunctioning access control
- Biometric readers present and functional?
- Cable management (trip hazards, unprofessional appearance)
- Fire suppression systems visible
- Environmental controls (HVAC, temperature monitoring)
- Unauthorized personnel present
- Physical security measures (cages, racks, locks)
- Emergency power (UPS, generators)`,
    
    'conference-room': `**Focus Areas for Conference Rooms:**
- Whiteboards with confidential information not erased
- Visitor escort policy compliance
- Documents left behind after meetings
- Presentation equipment security
- Window blinds/privacy controls for sensitive meetings
- Emergency exits clearly marked`,
    
    'emergency-exit': `**Focus Areas for Emergency Exits/Evacuation Routes:**
- Exit signs illuminated and visible
- Paths obstructed by furniture, equipment, or storage
- Doors locked or chained (fire code violation)
- Emergency lighting functional
- Evacuation maps posted and current
- Rally point signage
- Fire extinguishers accessible`,
    
    'general': `**General Office Security Focus:**
- Access control measures
- Visitor management indicators
- Data security practices
- Emergency preparedness indicators
- Physical security controls
- Workplace safety hazards`
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
