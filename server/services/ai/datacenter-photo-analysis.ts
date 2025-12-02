/**
 * AI Photo Analysis Intelligence for Data Center Security
 * 
 * Uses OpenAI GPT-4o Vision to analyze uploaded security photos
 * and identify uptime risks, compliance gaps, and physical security issues
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
 * Context types for data center photo analysis
 */
export type DataCenterPhotoContext = 
  | 'server-room'        // Main server halls, racks
  | 'power-infrastructure' // UPS, PDUs, generators, electrical
  | 'cooling-system'     // CRAC units, chillers, cooling
  | 'network-operations' // NOC, network equipment
  | 'entrance-security'  // Mantraps, access control, lobby
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
 * Analyze a data center security photo using GPT-4o Vision
 * 
 * @param imagePath - Path to the image file
 * @param context - What part of the data center this photo represents
 * @param caption - Optional user-provided caption/description
 * @returns Structured security analysis
 */
export async function analyzeDataCenterPhoto(
  imagePath: string,
  context: DataCenterPhotoContext = 'general',
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
          content: `You are an expert data center security consultant analyzing facility security photos. You specialize in:
- Uptime and SLA breach prevention
- Compliance gap identification (SOC 2, PCI-DSS, HIPAA, ISO 27001)
- Physical security and access control
- Environmental control systems
- Power and cooling redundancy
- Change management and operational security
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
    
    console.log(`✅ Analyzed data center photo (${context}): ${result.securityRisks.length} risks, ${result.positiveFindings.length} positives`);
    
    return result;
    
  } catch (error) {
    console.error("❌ Error analyzing data center photo:", error);
    throw new Error(`Failed to analyze photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct context-specific vision analysis prompt
 */
function constructVisionPrompt(context: DataCenterPhotoContext, caption?: string): string {
  
  const baseInstructions = `Analyze this data center security photo and provide a structured assessment.`;
  
  const captionText = caption ? `\n\n**Photo Caption:** ${caption}` : '';
  
  // Context-specific security focuses
  const contextGuidance: Record<DataCenterPhotoContext, string> = {
    'server-room': `**Focus Areas for Server Room/Halls:**
- Hot aisle/cold aisle containment (efficiency and uptime)
- Rack security (locked cabinets, cable locks)
- Environmental sensors (temperature, humidity monitoring)
- Fire suppression nozzles/sprinklers
- Cable management (trip hazards, airflow obstruction)
- Unauthorized equipment or rogue devices
- Access control to individual cages/zones
- CCTV camera coverage
- Server labeling and asset management
- Emergency power indicators (UPS, redundancy)`,
    
    'power-infrastructure': `**Focus Areas for Power Infrastructure:**
- UPS units (condition, redundancy level: N+1, 2N)
- PDU security and labeling
- Generator testing logs/maintenance indicators
- Automatic transfer switches (ATS)
- Fuel storage security
- Emergency shutdown (EPO) button security
- Power monitoring displays
- Cable routing and protection
- Single points of failure visible
- Load balancing across power sources`,
    
    'cooling-system': `**Focus Areas for Cooling Systems:**
- CRAC/CRAH unit redundancy
- Temperature monitoring displays
- Chilled water leaks or moisture
- Airflow obstruction (blocked vents, improper containment)
- Condensation or water damage indicators
- Preventive maintenance logs visible
- Cooling capacity indicators
- Hot spots or temperature differentials
- Emergency cooling backup
- Humidity control systems`,
    
    'network-operations': `**Focus Areas for Network Operations Center:**
- Monitoring displays (uptime metrics, alerts)
- Change management documentation visible
- Clean desk policy compliance (credentials exposed)
- Access control to NOC area
- Incident response playbooks accessible
- Network diagrams or topology exposed
- Visitor escort compliance
- Equipment security (locked cabinets)
- Backup connectivity paths visible
- Security camera coverage of NOC`,
    
    'entrance-security': `**Focus Areas for Entrance/Access Control:**
- Mantrap/airlock functionality (prevents tailgating)
- Biometric readers (fingerprint, palm vein, facial recognition)
- Security guard presence and alertness
- Visitor management system (sign-in, badge issuance)
- CCTV coverage of entry points
- Turnstiles or physical barriers
- Anti-passback technology
- Visitor escort procedures posted
- Emergency exit security (alarmed, monitored)
- Badge visibility requirements`,
    
    'general': `**General Data Center Security Focus:**
- Access control measures
- Environmental controls
- Redundancy indicators
- Compliance documentation
- Physical security controls
- Safety and emergency systems`
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
