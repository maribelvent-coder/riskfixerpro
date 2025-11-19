import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export interface CrimeStatistics {
  violentCrimes: {
    total: number;
    rate_per_100k: number;
    breakdown: {
      murder?: number;
      assault?: number;
      robbery?: number;
      rape?: number;
    };
  };
  propertyCrimes: {
    total: number;
    rate_per_100k: number;
    breakdown: {
      burglary?: number;
      theft?: number;
      auto_theft?: number;
    };
  };
  otherCrimes?: {
    drug_offenses?: number;
    dui?: number;
    vandalism?: number;
  };
  overallCrimeIndex?: number; // 0-100 scale
  nationalAverage?: any;
  stateAverage?: any;
  comparisonRating?: 'very_high' | 'high' | 'average' | 'low' | 'very_low';
  dataTimePeriod?: string;
  city?: string;
  county?: string;
  state?: string;
  zipCodes?: string[];
}

export async function parseCAPIndexPDF(pdfBuffer: Buffer): Promise<CrimeStatistics> {
  try {
    const openai = getOpenAIClient();
    
    // Upload PDF file to OpenAI
    const file = await openai.files.create({
      file: new File([pdfBuffer], 'crime_report.pdf', { type: 'application/pdf' }),
      purpose: 'assistants',
    });

    // Create an assistant to parse the PDF
    const assistant = await openai.beta.assistants.create({
      name: 'Crime Data Extractor',
      instructions: `You are extracting crime statistics from a CAP Index report PDF or similar crime report. 
Extract the following data in JSON format:
{
  "violentCrimes": {"total": number, "rate_per_100k": number, "breakdown": {"murder": number, "assault": number, "robbery": number, "rape": number}},
  "propertyCrimes": {"total": number, "rate_per_100k": number, "breakdown": {"burglary": number, "theft": number, "auto_theft": number}},
  "overallCrimeIndex": number (0-200 scale, where 100 = national average, higher is more crime),
  "comparisonRating": "very_high" | "high" | "average" | "low" | "very_low",
  "dataTimePeriod": "e.g., 2025 or 2024 Annual",
  "city": string,
  "county": string,
  "state": string,
  "zipCodes": [string array]
}

For CAP Index reports:
- Extract the CAP Index Score (usually shown prominently, e.g., "131") as the overallCrimeIndex
- Look for "Crimes Against Persons" scores for violent crimes
- Look for "Crimes Against Property" scores for property crimes
- Extract specific crime type scores: Homicide, Sexual Assault, Robbery, Assault for violent
- Extract: Breaking & Entering, Theft, Motor Vehicle Theft for property
- The CAP Score scale ranges from 0-2000, with 100 being the national average

If any data is not available in the document, use null for that field.
Return ONLY valid JSON, no additional text.`,
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
    });

    // Create a thread with the file
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: 'Extract crime statistics from this CAP Index report or crime data PDF.',
          attachments: [{ file_id: file.id, tools: [{ type: 'file_search' }] }],
        },
      ],
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    if (run.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${run.status}`);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find((msg) => msg.role === 'assistant');
    
    if (!assistantMessage || assistantMessage.content[0].type !== 'text') {
      throw new Error('No valid response from AI assistant');
    }

    const content = assistantMessage.content[0].text.value;

    // Clean up resources
    await openai.files.delete(file.id).catch(() => {/* ignore cleanup errors */});
    await openai.beta.assistants.delete(assistant.id).catch(() => {/* ignore cleanup errors */});

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const jsonMatch = jsonContent.match(/```(?:json)?\s*\n([\s\S]+?)\n```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
    }

    // Parse JSON response
    const crimeData = JSON.parse(jsonContent) as CrimeStatistics;
    
    // Validate required fields
    if (!crimeData.violentCrimes || !crimeData.propertyCrimes) {
      throw new Error('Invalid crime data extracted from PDF');
    }

    return crimeData;
  } catch (error: any) {
    console.error('CAP Index PDF parsing error:', error.message);
    throw new Error(`Failed to parse CAP Index PDF: ${error.message}`);
  }
}

export async function fetchFBIUCRData(city: string, state: string, year: number = 2023): Promise<CrimeStatistics | null> {
  // FBI UCR API integration
  // Note: FBI UCR API may require registration and has rate limits
  // This is a placeholder for the actual API implementation
  
  const apiKey = process.env.FBI_UCR_API_KEY;
  
  if (!apiKey) {
    console.warn('FBI_UCR_API_KEY not set, skipping FBI UCR data fetch');
    return null;
  }

  try {
    // Example API endpoint (actual endpoint may differ)
    const response = await fetch(
      `https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/${encodeURIComponent(city)}/${state}/${year}?API_KEY=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`FBI UCR API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform FBI UCR data to our standard format
    return transformFBIDataToStandard(data, city, state, year);
  } catch (error: any) {
    console.error('FBI UCR API error:', error.message);
    return null; // Return null on error, don't throw
  }
}

function transformFBIDataToStandard(data: any, city: string, state: string, year: number): CrimeStatistics {
  // Transform FBI UCR data structure to our standardized format
  // This is a placeholder - actual transformation depends on FBI API response format
  
  return {
    violentCrimes: {
      total: data.violent_crime || 0,
      rate_per_100k: data.violent_crime_rate || 0,
      breakdown: {
        murder: data.murder || 0,
        assault: data.aggravated_assault || 0,
        robbery: data.robbery || 0,
        rape: data.rape || 0,
      },
    },
    propertyCrimes: {
      total: data.property_crime || 0,
      rate_per_100k: data.property_crime_rate || 0,
      breakdown: {
        burglary: data.burglary || 0,
        theft: data.larceny || 0,
        auto_theft: data.motor_vehicle_theft || 0,
      },
    },
    dataTimePeriod: `${year} Annual`,
    city,
    state,
  };
}

export async function fetchLocalPDData(policeAgency: string, dateRange?: string): Promise<CrimeStatistics | null> {
  // This would integrate with local police department open data portals
  // Many cities have open data portals with crime statistics
  // Examples: NYC Open Data, Chicago Data Portal, LA Open Data, etc.
  
  // This is a placeholder for future implementation
  console.log('Local PD data integration not yet implemented');
  return null;
}

export function calculateCrimeIndexFromStats(stats: CrimeStatistics): number {
  // Calculate a 0-100 crime index based on crime rates
  // This is a simplified algorithm - actual CAP Index uses more sophisticated methods
  
  const violentWeight = 0.6; // Violent crimes weighted more heavily
  const propertyWeight = 0.4;
  
  // Normalize rates (using national averages as baseline)
  // These are approximate 2023 national averages per 100k population
  const nationalViolentRate = 380;
  const nationalPropertyRate = 2000;
  
  const violentRatio = stats.violentCrimes.rate_per_100k / nationalViolentRate;
  const propertyRatio = stats.propertyCrimes.rate_per_100k / nationalPropertyRate;
  
  const weightedScore = (violentRatio * violentWeight) + (propertyRatio * propertyWeight);
  
  // Convert to 0-100 scale (capped at 100)
  const crimeIndex = Math.min(100, Math.round(weightedScore * 50));
  
  return crimeIndex;
}

export function determineComparisonRating(crimeIndex: number): 'very_high' | 'high' | 'average' | 'low' | 'very_low' {
  if (crimeIndex >= 80) return 'very_high';
  if (crimeIndex >= 60) return 'high';
  if (crimeIndex >= 40) return 'average';
  if (crimeIndex >= 20) return 'low';
  return 'very_low';
}

export function createManualCrimeEntry(
  violentTotal: number,
  propertyTotal: number,
  population: number,
  options?: {
    violentBreakdown?: any;
    propertyBreakdown?: any;
    city?: string;
    county?: string;
    state?: string;
    dataTimePeriod?: string;
  }
): CrimeStatistics {
  // Only calculate rates if we have valid population data
  const hasPopulation = population > 0;
  const violentRate = hasPopulation ? (violentTotal / population) * 100000 : 0;
  const propertyRate = hasPopulation ? (propertyTotal / population) * 100000 : 0;
  
  const stats: CrimeStatistics = {
    violentCrimes: {
      total: violentTotal,
      rate_per_100k: Math.round(violentRate),
      breakdown: options?.violentBreakdown || {},
    },
    propertyCrimes: {
      total: propertyTotal,
      rate_per_100k: Math.round(propertyRate),
      breakdown: options?.propertyBreakdown || {},
    },
    city: options?.city,
    county: options?.county,
    state: options?.state,
    dataTimePeriod: options?.dataTimePeriod,
  };
  
  // Only calculate crime index if we have population data to calculate rates
  if (hasPopulation) {
    stats.overallCrimeIndex = calculateCrimeIndexFromStats(stats);
    stats.comparisonRating = determineComparisonRating(stats.overallCrimeIndex);
  } else {
    // For national-level or aggregate data without population context
    stats.overallCrimeIndex = undefined;
    stats.comparisonRating = undefined;
  }
  
  return stats;
}
