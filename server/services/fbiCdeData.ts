/**
 * FBI Crime Data Explorer (CDE) API Service
 * 
 * Provides national crime statistics from FBI's Crime Data Explorer
 * More recent data than BJS (updated monthly through current year)
 * Requires API key from api.data.gov
 * 
 * API Documentation: https://api.usa.gov/crime/fbi/cde
 */

const FBI_CDE_BASE = "https://api.usa.gov/crime/fbi/cde";

export interface FBICrimeMonthlyData {
  [month: string]: number; // e.g., "01-2023": 101652
}

export interface FBICrimeResponse {
  offenses: {
    actuals: {
      "United States": FBICrimeMonthlyData;
      "United States Clearances": FBICrimeMonthlyData;
    };
    rates: {
      "United States": FBICrimeMonthlyData;
      "United States Clearances": FBICrimeMonthlyData;
    };
  };
  populations: {
    population: {
      "United States": FBICrimeMonthlyData;
    };
    participated_population: {
      "United States": FBICrimeMonthlyData;
    };
  };
}

export interface FBICrimeStatistics {
  year: number;
  violentCrimeTotal: number;
  propertyCrimeTotal: number;
  totalCrimes: number;
  dataSource: string;
  monthlyBreakdown: {
    violent: FBICrimeMonthlyData;
    property: FBICrimeMonthlyData;
  };
}

/**
 * Fetch FBI CDE crime statistics for a specific year
 * Available: 2020-present (updated monthly)
 */
export async function getFBICrimeStatistics(year: number): Promise<FBICrimeStatistics> {
  const apiKey = process.env.DATA_GOV_API_KEY;
  
  if (!apiKey) {
    throw new Error("DATA_GOV_API_KEY environment variable is required for FBI Crime Data Explorer API");
  }

  // Validate year (FBI CDE has data from 2020 onwards)
  const currentYear = new Date().getFullYear();
  if (year < 2020 || year > currentYear) {
    throw new Error(`FBI CDE data is available for years 2020-${currentYear}. Requested year: ${year}`);
  }

  try {
    const fromDate = `01-${year}`;
    const toDate = `12-${year}`;

    console.log(`Fetching FBI CDE data for year ${year}...`);

    // Fetch both violent and property crime data in parallel
    const [violentResponse, propertyResponse] = await Promise.all([
      fetch(`${FBI_CDE_BASE}/summarized/national/violent-crime?from=${fromDate}&to=${toDate}&api_key=${apiKey}`),
      fetch(`${FBI_CDE_BASE}/summarized/national/property-crime?from=${fromDate}&to=${toDate}&api_key=${apiKey}`),
    ]);

    if (!violentResponse.ok || !propertyResponse.ok) {
      const violentError = violentResponse.ok ? null : await violentResponse.text();
      const propertyError = propertyResponse.ok ? null : await propertyResponse.text();
      throw new Error(`FBI CDE API error: ${violentError || propertyError || 'Unknown error'}`);
    }

    const violentData: FBICrimeResponse = await violentResponse.json();
    const propertyData: FBICrimeResponse = await propertyResponse.json();

    // Sum up monthly actuals to get yearly totals
    const violentMonthly = violentData.offenses.actuals["United States"];
    const propertyMonthly = propertyData.offenses.actuals["United States"];

    const violentCrimeTotal = Object.values(violentMonthly).reduce((sum, val) => sum + val, 0);
    const propertyCrimeTotal = Object.values(propertyMonthly).reduce((sum, val) => sum + val, 0);
    const totalCrimes = violentCrimeTotal + propertyCrimeTotal;

    console.log(`FBI CDE ${year} statistics:`, {
      violent: violentCrimeTotal.toLocaleString(),
      property: propertyCrimeTotal.toLocaleString(),
      total: totalCrimes.toLocaleString(),
      months: Object.keys(violentMonthly).length,
    });

    return {
      year,
      violentCrimeTotal,
      propertyCrimeTotal,
      totalCrimes,
      dataSource: "FBI Crime Data Explorer",
      monthlyBreakdown: {
        violent: violentMonthly,
        property: propertyMonthly,
      },
    };
  } catch (error: any) {
    console.error(`FBI CDE API error for year ${year}:`, error);
    throw new Error(`Failed to fetch FBI crime statistics: ${error.message}`);
  }
}

/**
 * Get available years for FBI CDE data
 */
export function getAvailableFBIYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = 2020; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
}
