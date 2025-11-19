/**
 * Bureau of Justice Statistics (BJS) NIBRS National Estimates API Service
 * 
 * BJS provides national crime estimates from the National Incident-Based Reporting System.
 * Available years: 2021, 2022, 2023
 * No authentication required - public API
 * 
 * API Documentation: https://bjs.ojp.gov/national-incident-based-reporting-system-nibrs-national-estimates-api
 */

const BJS_NIBRS_ENDPOINT = "https://api.ojp.gov/bjsdataset/v1/iv7i-eah6.json";

export interface BJSCrimeData {
  indicator_name: string;
  estimate: string | number;
  estimate_unweighted: string;
  estimate_geographic_location: string;
  estimate_type: string;
  estimate_domain_1: string;
  estimate_domain_2?: string;
  estimate_standard_error?: string;
  time_series_start_year: string;
  [key: string]: any;
}

export interface BJSCrimeDataResult {
  violentCrimeTotal: number;
  propertyCrimeTotal: number;
  year: number;
  dataSource: string;
  location: string;
}

/**
 * Fetch BJS NIBRS crime statistics for a specific year
 * Available years: 2021, 2022, 2023
 */
export async function getBJSCrimeStatistics(year: number): Promise<BJSCrimeDataResult> {
  // Validate year
  if (year < 2021 || year > 2023) {
    throw new Error(`BJS NIBRS data is only available for years 2021-2023. Requested year: ${year}`);
  }

  try {
    // Query for violent crimes (Total) - NIBRS crimes against persons
    const violentQuery = new URLSearchParams({
      $where: `indicator_name like '%crimes against persons (Total)%' AND estimate_domain_1='Incident count' AND time_series_start_year='${year}'`,
      $limit: "100",
    });

    // Query for property crimes (Total) - NIBRS crimes against property
    const propertyQuery = new URLSearchParams({
      $where: `indicator_name like '%crimes against property (Total)%' AND estimate_domain_1='Incident count' AND time_series_start_year='${year}'`,
      $limit: "100",
    });

    console.log(`Fetching BJS NIBRS data for year ${year}...`);
    
    // Fetch both datasets in parallel
    const [violentResponse, propertyResponse] = await Promise.all([
      fetch(`${BJS_NIBRS_ENDPOINT}?${violentQuery.toString()}`),
      fetch(`${BJS_NIBRS_ENDPOINT}?${propertyQuery.toString()}`),
    ]);

    if (!violentResponse.ok || !propertyResponse.ok) {
      throw new Error(`BJS API returned error status: ${violentResponse.status} / ${propertyResponse.status}`);
    }

    const violentData: BJSCrimeData[] = await violentResponse.json();
    const propertyData: BJSCrimeData[] = await propertyResponse.json();

    console.log(`BJS ${year} - Found ${violentData.length} violent and ${propertyData.length} property indicators`);

    // Find the main "Total" indicator for each category
    // We want the one with just "Incident count" as the only domain (no additional filters like "Multiple victims")
    const violentTotal = violentData.find(d => 
      d.indicator_name.includes("crimes against persons (Total)") &&
      d.estimate_domain_1 === "Incident count" &&
      !d.estimate_domain_2 // No additional filtering - this is the overall total
    );

    const propertyTotal = propertyData.find(d => 
      d.indicator_name.includes("crimes against property (Total)") &&
      d.estimate_domain_1 === "Incident count" &&
      !d.estimate_domain_2 // No additional filtering - this is the overall total
    );

    if (!violentTotal || !propertyTotal) {
      console.error('BJS data structure:', { 
        violentSample: violentData[0], 
        propertySample: propertyData[0],
        violentCount: violentData.length,
        propertyCount: propertyData.length
      });
      throw new Error(`Could not find total crime indicators in BJS data for year ${year}`);
    }

    // Parse estimates (they can be strings or numbers)
    const violentCrimeTotal = Math.round(parseFloat(String(violentTotal.estimate)));
    const propertyCrimeTotal = Math.round(parseFloat(String(propertyTotal.estimate)));

    console.log(`BJS ${year} statistics:`, {
      violent: violentCrimeTotal.toLocaleString(),
      property: propertyCrimeTotal.toLocaleString(),
    });

    return {
      violentCrimeTotal,
      propertyCrimeTotal,
      year,
      dataSource: "Bureau of Justice Statistics NIBRS National Estimates",
      location: "United States (National)",
    };
  } catch (error: any) {
    console.error(`BJS NIBRS API error for year ${year}:`, error);
    throw new Error(`Failed to fetch BJS crime statistics: ${error.message}`);
  }
}

/**
 * Get available years for BJS NIBRS data
 */
export function getAvailableBJSYears(): number[] {
  return [2021, 2022, 2023];
}
