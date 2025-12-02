/**
 * AI Photo Analysis Intelligence for Manufacturing Facility Security
 * 
 * Uses OpenAI GPT-4o Vision to analyze uploaded security photos
 * and identify IP theft, sabotage, and operational security risks
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
 * Context types for manufacturing facility photo analysis
 */
export type ManufacturingPhotoContext = 
  | 'production-floor'   // Main manufacturing areas
  | 'clean-room'         // Controlled environment areas
  | 'shipping-receiving' // Loading docks, material handling
  | 'equipment-room'     // Critical machinery, utilities
  | 'storage-area'       // Raw materials, finished goods
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
 * Analyze a manufacturing facility security photo using GPT-4o Vision
 * 
 * @param imagePath - Path to the image file
 * @param context - What part of the facility this photo represents
 * @param caption - Optional user-provided caption/description
 * @returns Structured security analysis
 */
export async function analyzeManufacturingPhoto(
  imagePath: string,
  context: ManufacturingPhotoContext = 'general',
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
          content: `You are an expert industrial security consultant analyzing manufacturing facility security photos. You specialize in:
- IP theft prevention and trade secret protection
- Production sabotage and equipment tampering detection
- Operational security and process control
- Industrial espionage indicators
- Safety and regulatory compliance
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
    
    console.log(`✅ Analyzed manufacturing photo (${context}): ${result.securityRisks.length} risks, ${result.positiveFindings.length} positives`);
    
    return result;
    
  } catch (error) {
    console.error("❌ Error analyzing manufacturing photo:", error);
    throw new Error(`Failed to analyze photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct context-specific vision analysis prompt
 */
function constructVisionPrompt(context: ManufacturingPhotoContext, caption?: string): string {
  
  const baseInstructions = `Analyze this manufacturing facility security photo and provide a structured assessment.`;
  
  const captionText = caption ? `\n\n**Photo Caption:** ${caption}` : '';
  
  // Context-specific security focuses
  const contextGuidance: Record<ManufacturingPhotoContext, string> = {
    'production-floor': `**Focus Areas for Production Floor:**
- Visitor escort compliance (unescorted visitors = IP theft risk)
- Photography/recording devices visible (phones, cameras = espionage risk)
- Proprietary equipment or processes exposed
- Unsecured blueprints, technical documents, or whiteboards
- Access control to sensitive production areas
- Equipment tampering indicators (unusual attachments, modifications)
- Safety hazards (OSHA compliance)
- Security camera coverage gaps`,
    
    'clean-room': `**Focus Areas for Clean Room/Controlled Environment:**
- Gowning procedures followed (contamination/security control)
- Access control (badge readers, biometric systems)
- Airlock/mantrap functionality
- Environmental monitoring displays
- Document control (procedures, formulas exposed)
- Visitor log compliance
- Photography prohibitions enforced
- Material transfer protocols`,
    
    'shipping-receiving': `**Focus Areas for Shipping/Receiving:**
- Driver verification procedures
- Trailer seal inspection and documentation
- CCTV coverage of loading areas
- Unauthorized personnel in secure zones
- Valuable inventory exposed or unsecured
- Bill of lading verification processes
- Truck security (seals, GPS tracking)
- Perimeter gate controls`,
    
    'equipment-room': `**Focus Areas for Equipment/Utility Rooms:**
- Access control (locked doors, badge readers)
- Critical infrastructure exposed (electrical, HVAC, compressed air)
- Sabotage opportunities (exposed wiring, control panels)
- Fire suppression systems present
- Equipment maintenance logs and procedures
- Emergency shutdown controls secured
- Environmental monitoring (temperature, humidity)
- Backup power systems (UPS, generators)`,
    
    'storage-area': `**Focus Areas for Storage Areas:**
- High-value inventory security (cages, locked areas)
- Raw material/finished goods separation
- Inventory tracking systems (barcodes, RFID)
- Access restrictions enforced
- Fire protection systems
- Pest control measures
- Proper stacking and storage safety
- Lighting adequacy for surveillance`,
    
    'general': `**General Manufacturing Security Focus:**
- Access control measures
- Visitor management indicators
- IP protection practices
- Equipment security
- Safety compliance
- Surveillance coverage`
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
