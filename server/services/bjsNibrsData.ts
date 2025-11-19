/**
 * BJS NIBRS National Estimates API Service
 * Bureau of Justice Statistics - National Incident-Based Reporting System
 * Documentation: https://bjs.ojp.gov/national-incident-based-reporting-system-nibrs-national-estimates-api
 * 
 * No authentication required - completely open API
 */

const BJS_API_BASE = "https://api.ojp.gov/bjsdataset/v1";

export interface BJSCrimeData {
  indicator_name: string;
  estimate_type: string; // 'count', 'percentage', 'rate'
  estimate_domain_1?: string;
  estimate_domain_2?: string;
  estimate?: string | number; // API returns as string
  estimate_geographic_location?: string;
  time_series_start_year?: string;
}

export interface BJSCrimeDataResult {
  violentCrimeTotal: number;
  propertyCrimeTotal: number;
  year: number;
  dataSource: string;
  location: string;
}

/**
 * Get national violent crime estimates from BJS NIBRS
 */
export async function getBJSViolentCrimeData(year?: number): Promise<BJSCrimeData[]> {
  try {
    // Endpoint: Violent Offenses - get counts
    const url = `${BJS_API_BASE}/x3sz-eb6y.json`;
    const params = new URLSearchParams({
      $limit: "50000",
      $where: `estimate_type = 'count' and estimate_domain_1 = 'Offense count'${year ? ` and time_series_start_year = '${year}'` : ''}`,
    });

    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`BJS API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("BJS violent crime data fetch error:", error);
    throw new Error(`Failed to fetch BJS violent crime data: ${error.message}`);
  }
}

/**
 * Get national property crime estimates from BJS NIBRS
 */
export async function getBJSPropertyCrimeData(year?: number): Promise<BJSCrimeData[]> {
  try {
    // Endpoint: Property Offenses - get counts
    const url = `${BJS_API_BASE}/kj7p-vx4s.json`;
    const params = new URLSearchParams({
      $limit: "50000",
      $where: `estimate_type = 'count' and estimate_domain_1 = 'Offense count'${year ? ` and time_series_start_year = '${year}'` : ''}`,
    });

    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`BJS API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("BJS property crime data fetch error:", error);
    throw new Error(`Failed to fetch BJS property crime data: ${error.message}`);
  }
}

/**
 * Get aggregated crime statistics from BJS for a specific year
 */
export async function getBJSCrimeStatistics(year: number): Promise<BJSCrimeDataResult> {
  try {
    const [violentData, propertyData] = await Promise.all([
      getBJSViolentCrimeData(year),
      getBJSPropertyCrimeData(year),
    ]);

    // Only use the "Total" indicator to avoid double-counting
    // The dataset contains both overall totals and subcategory breakdowns
    const violentTotalRow = violentData.find(d => 
      d.estimate_type === 'count' && 
      d.indicator_name && 
      d.indicator_name.toLowerCase().includes('total') &&
      d.estimate
    );

    const propertyTotalRow = propertyData.find(d => 
      d.estimate_type === 'count' && 
      d.indicator_name && 
      d.indicator_name.toLowerCase().includes('total') &&
      d.estimate
    );

    if (!violentTotalRow || !propertyTotalRow) {
      throw new Error("Could not find total crime indicators in BJS data");
    }

    return {
      violentCrimeTotal: Math.round(parseFloat(violentTotalRow.estimate)),
      propertyCrimeTotal: Math.round(parseFloat(propertyTotalRow.estimate)),
      year,
      dataSource: "Bureau of Justice Statistics NIBRS",
      location: "United States (National)",
    };
  } catch (error: any) {
    console.error("BJS crime statistics fetch error:", error);
    throw new Error(`Failed to fetch BJS crime statistics: ${error.message}`);
  }
}
