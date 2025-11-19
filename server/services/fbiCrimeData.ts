const FBI_API_BASE = "https://api.usa.gov/crime/fbi/sapi";
const API_KEY = process.env.DATA_GOV_API_KEY;

if (!API_KEY) {
  console.warn("DATA_GOV_API_KEY not set. FBI crime data features will be unavailable.");
}

export interface FBIAgency {
  ori: string;
  agency_name: string;
  state_abbr: string;
  state_name: string;
  county_name?: string;
  city_name?: string;
  agency_type_name: string;
  population?: number;
}

export interface FBICrimeStats {
  ori: string;
  year: number;
  violent_crime: number;
  homicide: number;
  rape_legacy?: number;
  rape_revised?: number;
  robbery: number;
  aggravated_assault: number;
  property_crime: number;
  burglary: number;
  larceny: number;
  motor_vehicle_theft: number;
  arson?: number;
}

export interface FBIAgencySearchResult {
  agencies: FBIAgency[];
  total: number;
}

export interface FBICrimeDataResult {
  agency: FBIAgency;
  stats: FBICrimeStats[];
  mostRecentYear: number;
  location: {
    city?: string;
    county?: string;
    state: string;
  };
}

/**
 * Search for law enforcement agencies by location
 */
export async function searchFBIAgencies(params: {
  state?: string;
  city?: string;
  county?: string;
  limit?: number;
}): Promise<FBIAgencySearchResult> {
  if (!API_KEY) {
    throw new Error("DATA_GOV_API_KEY not configured");
  }

  const queryParams = new URLSearchParams();

  if (params.state) {
    queryParams.append("state_abbr", params.state.toUpperCase());
  }
  if (params.city) {
    queryParams.append("city_name", params.city);
  }
  if (params.county) {
    queryParams.append("county_name", params.county);
  }
  if (params.limit) {
    queryParams.append("per_page", params.limit.toString());
  } else {
    queryParams.append("per_page", "50");
  }

  const url = `${FBI_API_BASE}/api/agencies?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("FBI API error response:", errorText);
      throw new Error(`FBI API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    
    return {
      agencies: data.results || [],
      total: data.pagination?.count || 0,
    };
  } catch (error: any) {
    console.error("FBI agency search error:", error);
    throw new Error(`Failed to search FBI agencies: ${error.message}`);
  }
}

/**
 * Get crime statistics for a specific agency
 */
export async function getFBIAgencyCrimeData(ori: string): Promise<FBICrimeDataResult> {
  if (!API_KEY) {
    throw new Error("DATA_GOV_API_KEY not configured");
  }

  try {
    // First, get agency details
    const agencyUrl = `${FBI_API_BASE}/api/agencies/${ori}`;
    const agencyResponse = await fetch(agencyUrl, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });
    
    if (!agencyResponse.ok) {
      const errorText = await agencyResponse.text();
      console.error("FBI API error fetching agency:", errorText);
      throw new Error(`Failed to fetch agency: ${agencyResponse.status}`);
    }

    const agency: FBIAgency = await agencyResponse.json();

    // Get summarized crime data for multiple offense types
    // Fetch last 5 years of data
    const currentYear = new Date().getFullYear();
    const fromYear = currentYear - 5;
    const toYear = currentYear - 1; // Most recent complete year

    const offenseTypes = [
      "violent-crime",
      "homicide",
      "rape",
      "robbery",
      "aggravated-assault",
      "property-crime",
      "burglary",
      "larceny",
      "motor-vehicle-theft",
      "arson"
    ];

    const statsPromises = offenseTypes.map(async (offense) => {
      const url = `${FBI_API_BASE}/api/summarized/agencies/${ori}/${offense}/${fromYear}/${toYear}`;
      try {
        const response = await fetch(url, {
          headers: {
            'X-Api-Key': API_KEY,
          },
        });
        if (!response.ok) return null;
        const data: any = await response.json();
        return { offense, data: data.results || [] };
      } catch {
        return null;
      }
    });

    const allStats = await Promise.all(statsPromises);

    // Aggregate data by year
    const statsByYear = new Map<number, Partial<FBICrimeStats>>();

    allStats.forEach((result) => {
      if (!result) return;
      
      const { offense, data } = result;
      
      data.forEach((yearData: any) => {
        const year = yearData.data_year;
        if (!year) return;

        if (!statsByYear.has(year)) {
          statsByYear.set(year, {
            ori,
            year,
            violent_crime: 0,
            homicide: 0,
            robbery: 0,
            aggravated_assault: 0,
            property_crime: 0,
            burglary: 0,
            larceny: 0,
            motor_vehicle_theft: 0,
          });
        }

        const stats = statsByYear.get(year)!;
        const actual = yearData.actual || 0;

        switch (offense) {
          case "violent-crime":
            stats.violent_crime = actual;
            break;
          case "homicide":
            stats.homicide = actual;
            break;
          case "rape":
            stats.rape_revised = actual;
            break;
          case "robbery":
            stats.robbery = actual;
            break;
          case "aggravated-assault":
            stats.aggravated_assault = actual;
            break;
          case "property-crime":
            stats.property_crime = actual;
            break;
          case "burglary":
            stats.burglary = actual;
            break;
          case "larceny":
            stats.larceny = actual;
            break;
          case "motor-vehicle-theft":
            stats.motor_vehicle_theft = actual;
            break;
          case "arson":
            stats.arson = actual;
            break;
        }
      });
    });

    const stats = Array.from(statsByYear.values())
      .filter((s): s is FBICrimeStats => s.year !== undefined)
      .sort((a, b) => b.year - a.year);

    const mostRecentYear = stats.length > 0 ? stats[0].year : new Date().getFullYear() - 1;

    return {
      agency,
      stats,
      mostRecentYear,
      location: {
        city: agency.city_name,
        county: agency.county_name,
        state: agency.state_name,
      },
    };
  } catch (error: any) {
    console.error("FBI crime data fetch error:", error);
    throw new Error(`Failed to fetch FBI crime data: ${error.message}`);
  }
}

/**
 * Convert FBI crime stats to our crime data format
 */
export function convertFBIStatsToOurFormat(
  stats: FBICrimeStats,
  agency: FBIAgency
): {
  violentTotal: number;
  propertyTotal: number;
  population: number;
  overallCrimeIndex: number;
} {
  const violentTotal = stats.violent_crime || 0;
  const propertyTotal = stats.property_crime || 0;
  const population = agency.population || 1;

  // Calculate crime index (crimes per 100,000 population)
  const totalCrimes = violentTotal + propertyTotal;
  const crimeRate = (totalCrimes / population) * 100000;
  const overallCrimeIndex = Math.round(crimeRate);

  return {
    violentTotal,
    propertyTotal,
    population,
    overallCrimeIndex,
  };
}
