/**
 * AI Photo Analysis Intelligence for Retail Store Security
 * 
 * Uses OpenAI GPT-4o Vision to analyze uploaded security photos
 * and identify shrinkage, ORC, employee theft, and POS security risks
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
 * Context types for retail store photo analysis
 */
export type RetailPhotoContext = 
  | 'sales-floor'        // Main sales floor, merchandise displays
  | 'pos-registers'      // Point of sale, checkout area
  | 'fitting-rooms'      // Dressing rooms, try-on areas
  | 'stockroom'          // Backstock, receiving area
  | 'entrance-exit'      // Store entrance, exit doors, EAS gates
  | 'general';           // Unknown or multi-purpose area

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
 * Analyze a retail store security photo using GPT-4o Vision
 * 
 * @param imagePath - Path to the image file
 * @param context - What part of the store this photo represents
 * @param caption - Optional user-provided caption/description
 * @returns Structured security analysis
 */
export async function analyzeRetailPhoto(
  imagePath: string,
  context: RetailPhotoContext = 'general',
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
          content: `You are an expert loss prevention consultant analyzing retail store security photos. You specialize in:
- Shrinkage reduction and shoplifting prevention
- Organized retail crime (ORC) detection
- Employee theft and internal controls
- Electronic article surveillance (EAS) systems
- Point of sale (POS) security
- CCTV blind spot identification
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
    
    console.log(`✅ Analyzed retail photo (${context}): ${result.securityRisks.length} risks, ${result.positiveFindings.length} positives`);
    
    return result;
    
  } catch (error) {
    console.error("❌ Error analyzing retail photo:", error);
    throw new Error(`Failed to analyze photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct context-specific vision analysis prompt
 */
function constructVisionPrompt(context: RetailPhotoContext, caption?: string): string {
  
  const baseInstructions = `Analyze this retail store security photo and provide a structured assessment.`;
  
  const captionText = caption ? `\n\n**Photo Caption:** ${caption}` : '';
  
  // Context-specific security focuses
  const contextGuidance: Record<RetailPhotoContext, string> = {
    'sales-floor': `**Focus Areas for Sales Floor:**
- CCTV camera coverage and blind spots (corners, behind displays)
- High-value merchandise security (locked cases, spider wraps, EAS tags)
- Merchandise display height (can staff see over displays?)
- Sightline obstructions (tall fixtures blocking visibility)
- Convex mirrors for blind spot coverage
- Lighting adequacy (dark areas = shoplifting opportunities)
- Customer flow patterns (chokepoints, escape routes)
- EAS tag placement on merchandise (properly attached?)
- Staff positioning (can they see entire floor?)
- Unattended merchandise in accessible areas`,
    
    'pos-registers': `**Focus Areas for Point of Sale/Registers:**
- POS terminal security (till locks, cash drawer controls)
- Register sightlines (can manager see all registers?)
- Cash handling procedures visible (open tills, loose bills)
- Void/refund signage and controls
- Receipt printer security (refund fraud prevention)
- Employee bag storage (near registers = theft opportunity)
- CCTV coverage of register area
- Customer traffic flow (queuing, crowding)
- Panic button visibility
- Barcode scanner security (sweethearting opportunities)`,
    
    'fitting-rooms': `**Focus Areas for Fitting Rooms:**
- Attendant station presence (staffed or unstaffed?)
- Item count controls (numbered tags visible?)
- Door gaps (can attendant see feet under doors?)
- CCTV coverage of entrance (not inside rooms)
- Mirror placement (attendant can see exit?)
- Lighting (bright = deterrent to theft)
- Alarm tags still attached to garments
- Emergency call buttons
- Abandoned merchandise procedures
- Maximum item limits posted`,
    
    'stockroom': `**Focus Areas for Stockroom/Receiving:**
- Access control (locked doors, badge readers)
- High-value inventory security (locked cages)
- Trash/cardboard removal procedures (concealment method)
- Employee bag check policy enforcement
- Receiving door security (alarms, cameras)
- Inventory organization (disorganization = shrinkage)
- CCTV coverage of key areas
- Time clock placement (employee accountability)
- Fire exit security (alarmed but accessible)
- Shipping/receiving separation`,
    
    'entrance-exit': `**Focus Areas for Entrance/Exit:**
- EAS pedestals (Electronic Article Surveillance) present and functional
- Alarm acknowledgment procedures (do staff respond?)
- Receipt checking station
- Shopping cart/basket security
- CCTV coverage of doors
- Signage about security measures
- Entry/exit separation (one-way flow)
- Sight lines to front (can staff see doors?)
- Panic hardware on emergency exits
- Exterior lighting for parking lot visibility`,
    
    'general': `**General Retail Security Focus:**
- EAS system presence and coverage
- CCTV blind spots
- POS security controls
- Employee theft indicators
- Shrinkage prevention measures
- High-value merchandise protection`
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
