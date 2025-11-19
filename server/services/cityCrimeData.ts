/**
 * City Crime Data API Service
 * Integrates with major US cities using Socrata Open Data APIs
 * No authentication required (optional app token for higher rate limits)
 */

// Classification strategies for different city data schemas
type DirectStrategy = {
  type: "direct";
  categoryField: string;
  violentValue: string;
  propertyValue: string;
};

type MappingStrategy = {
  type: "mapping";
  typeField: string;
  violentTypes: string[];
  propertyTypes: string[];
};

type KeywordStrategy = {
  type: "keyword";
  descriptionField: string;
  violentKeywords: string[];
  propertyKeywords: string[];
};

type ClassificationStrategy = DirectStrategy | MappingStrategy | KeywordStrategy;

export interface CityCrimeConfig {
  city: string;
  domain: string;
  datasetId: string;
  dateField: string;
  coordinateFields?: {
    latitude: string;
    longitude: string;
  };
  classificationStrategy: ClassificationStrategy;
}

// Major US Cities Socrata API Configurations
export const CITY_CRIME_CONFIGS: Record<string, CityCrimeConfig> = {
  "seattle": {
    city: "Seattle",
    domain: "data.seattle.gov",
    datasetId: "tazs-3rd5",
    dateField: "offense_date",
    coordinateFields: {
      latitude: "latitude",
      longitude: "longitude",
    },
    classificationStrategy: {
      type: "direct",
      categoryField: "offense_category",
      violentValue: "VIOLENT CRIME",
      propertyValue: "PROPERTY CRIME",
    },
  },
  "chicago": {
    city: "Chicago",
    domain: "data.cityofchicago.org",
    datasetId: "6zsd-86xi",
    dateField: "date",
    coordinateFields: {
      latitude: "latitude",
      longitude: "longitude",
    },
    classificationStrategy: {
      type: "mapping",
      typeField: "primary_type",
      violentTypes: ["HOMICIDE", "ROBBERY", "ASSAULT", "BATTERY", "CRIMINAL SEXUAL ASSAULT", "CRIM SEXUAL ASSAULT", "KIDNAPPING", "HUMAN TRAFFICKING"],
      propertyTypes: ["BURGLARY", "THEFT", "MOTOR VEHICLE THEFT", "ARSON"],
    },
  },
  "los-angeles": {
    city: "Los Angeles",
    domain: "data.lacity.org",
    datasetId: "2nrs-mtv8",
    dateField: "date_occ",
    coordinateFields: {
      latitude: "lat",
      longitude: "lon",
    },
    classificationStrategy: {
      type: "keyword",
      descriptionField: "crm_cd_desc",
      violentKeywords: ["HOMICIDE", "MURDER", "MANSLAUGHTER", "ASSAULT", "BATTERY", "ROBBERY", "RAPE", "SEXUAL", "KIDNAPPING"],
      propertyKeywords: ["BURGLARY", "THEFT", "LARCENY", "STOLEN", "VEHICLE THEFT", "AUTO THEFT", "ARSON", "VANDALISM"],
    },
  },
  "new-york": {
    city: "New York City",
    domain: "data.cityofnewyork.us",
    datasetId: "5uac-w243",
    dateField: "cmplnt_fr_dt",
    coordinateFields: {
      latitude: "latitude",
      longitude: "longitude",
    },
    classificationStrategy: {
      type: "keyword",
      descriptionField: "ofns_desc",
      violentKeywords: ["MURDER", "HOMICIDE", "RAPE", "ROBBERY", "FELONY ASSAULT", "ASSAULT", "SEX CRIMES", "KIDNAPPING"],
      propertyKeywords: ["BURGLARY", "GRAND LARCENY", "PETIT LARCENY", "THEFT", "GRAND THEFT", "PETIT THEFT", "STOLEN PROPERTY"],
    },
  },
};

export interface CityCrimeData {
  date: string;
  type: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

export interface CityCrimeStatistics {
  city: string;
  violentCrimeTotal: number;
  propertyCrimeTotal: number;
  otherCrimeTotal: number;
  totalCrimes: number;
  year: number;
  dataSource: string;
  rawData: CityCrimeData[];
}

/**
 * Build SoQL WHERE clause for crime classification based on strategy
 */
function buildClassificationWhere(
  strategy: ClassificationStrategy,
  dateFilter: string,
  category: "violent" | "property"
): string {
  switch (strategy.type) {
    case "direct": {
      const value = category === "violent" ? strategy.violentValue : strategy.propertyValue;
      return `(${dateFilter}) AND (${strategy.categoryField} = '${value}')`;
    }

    case "mapping": {
      const types = category === "violent" ? strategy.violentTypes : strategy.propertyTypes;
      const conditions = types.map(t => `${strategy.typeField} = '${t}'`).join(" OR ");
      return `(${dateFilter}) AND (${conditions})`;
    }

    case "keyword": {
      const keywords = category === "violent" ? strategy.violentKeywords : strategy.propertyKeywords;
      const conditions = keywords.map(k => 
        `upper(${strategy.descriptionField}) like '%${k}%'`
      ).join(" OR ");
      return `(${dateFilter}) AND (${conditions})`;
    }
  }
}

/**
 * Fetch crime data from a city's Socrata API
 */
export async function getCityCrimeData(
  cityKey: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    crimeTypes?: string[];
  } = {}
): Promise<CityCrimeData[]> {
  const config = CITY_CRIME_CONFIGS[cityKey];
  if (!config) {
    throw new Error(`Unknown city: ${cityKey}. Available cities: ${Object.keys(CITY_CRIME_CONFIGS).join(", ")}`);
  }

  const { limit = 10000, startDate, endDate } = options;

  try {
    const url = `https://${config.domain}/resource/${config.datasetId}.json`;
    const params = new URLSearchParams({
      $limit: limit.toString(),
      $order: `${config.dateField} DESC`,
    });

    const whereConditions: string[] = [];
    if (startDate) {
      whereConditions.push(`${config.dateField} >= '${startDate}T00:00:00'`);
    }
    if (endDate) {
      whereConditions.push(`${config.dateField} <= '${endDate}T23:59:59'`);
    }

    if (whereConditions.length > 0) {
      params.append("$where", whereConditions.join(" AND "));
    }

    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`${config.city} API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`${config.city} crime data fetch error:`, error);
    throw new Error(`Failed to fetch ${config.city} crime data: ${error.message}`);
  }
}

/**
 * Get crime statistics for a city for a specific year using city-specific SoQL aggregation
 */
export async function getCityCrimeStatistics(
  cityKey: string,
  year: number
): Promise<CityCrimeStatistics> {
  const config = CITY_CRIME_CONFIGS[cityKey];
  if (!config) {
    throw new Error(`Unknown city: ${cityKey}`);
  }

  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const url = `https://${config.domain}/resource/${config.datasetId}.json`;
    const dateFilter = `${config.dateField} >= '${startDate}T00:00:00' AND ${config.dateField} <= '${endDate}T23:59:59'`;

    // Build WHERE clauses using city-specific classification strategy
    const violentWhere = buildClassificationWhere(config.classificationStrategy, dateFilter, "violent");
    const propertyWhere = buildClassificationWhere(config.classificationStrategy, dateFilter, "property");

    // Execute parallel SoQL count queries for total, violent, and property crimes
    const [totalResponse, violentResponse, propertyResponse] = await Promise.all([
      // Total crimes
      fetch(`${url}?${new URLSearchParams({
        $select: "count(*) as total",
        $where: dateFilter,
      }).toString()}`),
      
      // Violent crimes
      fetch(`${url}?${new URLSearchParams({
        $select: "count(*) as total",
        $where: violentWhere,
      }).toString()}`),
      
      // Property crimes
      fetch(`${url}?${new URLSearchParams({
        $select: "count(*) as total",
        $where: propertyWhere,
      }).toString()}`),
    ]);

    if (!totalResponse.ok || !violentResponse.ok || !propertyResponse.ok) {
      const errors = [];
      if (!totalResponse.ok) errors.push(`total: ${totalResponse.status}`);
      if (!violentResponse.ok) errors.push(`violent: ${violentResponse.status}`);
      if (!propertyResponse.ok) errors.push(`property: ${propertyResponse.status}`);
      throw new Error(`${config.city} API error(s): ${errors.join(", ")}`);
    }

    const [totalData, violentData, propertyData] = await Promise.all([
      totalResponse.json(),
      violentResponse.json(),
      propertyResponse.json(),
    ]);

    const totalCrimes = parseInt(totalData[0]?.total || "0");
    const violentCrimeTotal = parseInt(violentData[0]?.total || "0");
    const propertyCrimeTotal = parseInt(propertyData[0]?.total || "0");
    const otherCrimeTotal = totalCrimes - violentCrimeTotal - propertyCrimeTotal;

    // Get small sample for display purposes only
    const sampleData = await getCityCrimeData(cityKey, {
      startDate,
      endDate,
      limit: 100,
    });

    console.log(`${config.city} ${year} crime statistics:`, {
      total: totalCrimes,
      violent: violentCrimeTotal,
      property: propertyCrimeTotal,
      other: otherCrimeTotal,
    });

    return {
      city: config.city,
      violentCrimeTotal,
      propertyCrimeTotal,
      otherCrimeTotal,
      totalCrimes,
      year,
      dataSource: `${config.city} Open Data Portal (Socrata)`,
      rawData: sampleData,
    };
  } catch (error: any) {
    console.error(`${config.city} crime statistics error:`, error);
    throw new Error(`Failed to get ${config.city} crime statistics: ${error.message}`);
  }
}

/**
 * Get available cities
 */
export function getAvailableCities(): { key: string; name: string }[] {
  return Object.entries(CITY_CRIME_CONFIGS).map(([key, config]) => ({
    key,
    name: config.city,
  }));
}
