/**
 * Crimeometer API Integration Service
 * 
 * Provides access to crime incidents, statistics, sex offender data, and 911 calls
 * using the Crimeometer API v2/v3.
 * 
 * API Documentation: https://documenter.getpostman.com/view/12755833/TzK2auPn
 */

const CRIMEOMETER_BASE_URL = 'https://api.crimeometer.com';

interface CrimeometerConfig {
  apiKey: string;
}

function getConfig(): CrimeometerConfig | null {
  const apiKey = process.env.CRIMEOMETER_API_KEY;
  if (!apiKey) {
    console.warn('CRIMEOMETER_API_KEY not set. Crimeometer features will be unavailable.');
    return null;
  }
  return { apiKey };
}

async function crimeometerFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new Error('Crimeometer API key not configured. Please set CRIMEOMETER_API_KEY environment variable.');
  }

  const url = new URL(`${CRIMEOMETER_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Crimeometer API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ============================================================================
// TYPES
// ============================================================================

export interface CrimeIncident {
  incident_id?: string;
  incident_code?: string;
  incident_offense?: string;
  incident_offense_code?: string;
  incident_offense_description?: string;
  incident_offense_detail_description?: string;
  incident_offense_crime_against?: string;
  incident_offense_action?: string;
  incident_source_original_type?: string;
  incident_source_name?: string;
  incident_latitude?: number;
  incident_longitude?: number;
  incident_address?: string;
  city_key?: string;
  incident_date?: string;
  incident_date_relative?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrimeIncidentsResponse {
  incidents: CrimeIncident[];
  total_incidents?: number;
  total_pages?: number;
  page?: number;
}

export interface CrimeCoverageArea {
  city_key?: string;
  city_name?: string;
  state?: string;
  country?: string;
  coverage_start_date?: string;
  last_update?: string;
  total_incidents?: number;
}

export interface CrimeCoverageResponse {
  coverage: CrimeCoverageArea[];
}

export interface CrimeStatsByType {
  incident_type: string;
  incident_count: number;
  percentage?: number;
}

export interface CrimeStatsResponse {
  total_incidents: number;
  incident_types: CrimeStatsByType[];
  datetime_ini?: string;
  datetime_end?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
}

export interface SexOffender {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  aliases?: string[];
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  offense_description?: string;
  registration_date?: string;
  birthdate?: string;
  race?: string;
  sex?: string;
  height?: string;
  weight?: string;
  hair_color?: string;
  eye_color?: string;
}

export interface SexOffendersResponse {
  sex_offenders: SexOffender[];
  total_records?: number;
  page?: number;
  total_pages?: number;
}

export interface CallForService {
  id?: string;
  event_number?: string;
  call_type?: string;
  call_type_group?: string;
  description?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  datetime?: string;
  disposition?: string;
  priority?: string;
}

export interface CallsForServiceResponse {
  calls: CallForService[];
  total_calls?: number;
  page?: number;
  total_pages?: number;
}

// ============================================================================
// CRIME INCIDENTS API (v2)
// ============================================================================

/**
 * Get coverage areas for crime incidents data
 */
export async function getCrimeCoverage(): Promise<CrimeCoverageResponse> {
  return crimeometerFetch<CrimeCoverageResponse>('/v2/crime-incidents/coverage');
}

/**
 * Get crime incidents by location (lat/lon)
 */
export async function getCrimeIncidentsByLocation(options: {
  lat: number;
  lon: number;
  datetimeIni: string;
  datetimeEnd: string;
  distance?: string;
  page?: number;
}): Promise<CrimeIncidentsResponse> {
  const params: Record<string, string> = {
    lat: options.lat.toString(),
    lon: options.lon.toString(),
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };
  
  if (options.distance) params.distance = options.distance;
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<CrimeIncidentsResponse>('/v2/crime-incidents', params);
}

/**
 * Get crime incidents by city name
 */
export async function getCrimeIncidentsByCityName(options: {
  cityname: string;
  datetimeIni: string;
  datetimeEnd: string;
  page?: number;
}): Promise<CrimeIncidentsResponse> {
  const params: Record<string, string> = {
    cityname: options.cityname,
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };
  
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<CrimeIncidentsResponse>('/v2/crime-incidents-by-city', params);
}

/**
 * Get crime incidents by city key
 */
export async function getCrimeIncidentsByCityKey(options: {
  citykey: string;
  datetimeIni: string;
  datetimeEnd: string;
  page?: number;
}): Promise<CrimeIncidentsResponse> {
  const params: Record<string, string> = {
    citykey: options.citykey,
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };
  
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<CrimeIncidentsResponse>('/v2/crime-incidents-by-city', params);
}

/**
 * Get crime statistics by location
 */
export async function getCrimeStatsByLocation(options: {
  lat: number;
  lon: number;
  datetimeIni: string;
  datetimeEnd: string;
  distance?: string;
  incidentTypes?: string[];
  page?: number;
}): Promise<CrimeStatsResponse> {
  const params: Record<string, string> = {
    lat: options.lat.toString(),
    lon: options.lon.toString(),
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };
  
  if (options.distance) params.distance = options.distance;
  if (options.page) params.page = options.page.toString();

  const url = new URL(`${CRIMEOMETER_BASE_URL}/v2/incidents/stats`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  if (options.incidentTypes) {
    options.incidentTypes.forEach(type => {
      url.searchParams.append('incident_type', type);
    });
  }

  const config = getConfig();
  if (!config) {
    throw new Error('Crimeometer API key not configured');
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Crimeometer API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Get crime statistics by city key
 */
export async function getCrimeStatsByCityKey(options: {
  citykey: string;
  datetimeIni: string;
  datetimeEnd: string;
}): Promise<CrimeStatsResponse> {
  const params: Record<string, string> = {
    citykey: options.citykey,
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };

  return crimeometerFetch<CrimeStatsResponse>('/v2/crime-stats-by-city', params);
}

/**
 * Get crime statistics by city name
 */
export async function getCrimeStatsByCityName(options: {
  cityname: string;
  datetimeIni: string;
  datetimeEnd: string;
}): Promise<CrimeStatsResponse> {
  const params: Record<string, string> = {
    cityname: options.cityname,
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };

  return crimeometerFetch<CrimeStatsResponse>('/v2/crime-stats-by-city', params);
}

// ============================================================================
// SEX OFFENDERS API (v3)
// ============================================================================

/**
 * Get sex offenders by location
 */
export async function getSexOffendersByLocation(options: {
  lat: number;
  lon: number;
  distance?: string;
  page?: number;
}): Promise<SexOffendersResponse> {
  const params: Record<string, string> = {
    lat: options.lat.toString(),
    lon: options.lon.toString(),
  };
  
  if (options.distance) params.distance = options.distance;
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<SexOffendersResponse>('/v3/sex-offenders/location', params);
}

/**
 * Get sex offenders by zipcode
 */
export async function getSexOffendersByZipcode(options: {
  zipcode: string;
  exactZipcode?: boolean;
  page?: number;
}): Promise<SexOffendersResponse> {
  const params: Record<string, string> = {};
  
  if (options.exactZipcode) {
    params.exact_zipcode = options.zipcode;
  } else {
    params.zipcode = options.zipcode;
  }
  
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<SexOffendersResponse>('/v3/sex-offenders/records', params);
}

/**
 * Search sex offenders by name
 */
export async function getSexOffendersByName(options: {
  name?: string;
  firstName?: string;
  lastName?: string;
  exactName?: string;
  alias?: string;
  birthdate?: string;
  birthdateYear?: number;
  zipcode?: string;
  page?: number;
}): Promise<SexOffendersResponse> {
  const params: Record<string, string> = {};
  
  if (options.name) params.name = options.name;
  if (options.firstName) params.first_name = options.firstName;
  if (options.lastName) params.last_name = options.lastName;
  if (options.exactName) params.exact_name = options.exactName;
  if (options.alias) params.alias = options.alias;
  if (options.birthdate) params.birthdate = options.birthdate;
  if (options.birthdateYear) params.birthdate_year = options.birthdateYear.toString();
  if (options.zipcode) params.zipcode = options.zipcode;
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<SexOffendersResponse>('/v3/sex-offenders/records', params);
}

// ============================================================================
// 911 CALLS API (v3)
// ============================================================================

/**
 * Get 911 calls for service by location
 */
export async function getCallsForServiceByLocation(options: {
  lat: number;
  lon: number;
  datetimeIni: string;
  datetimeEnd: string;
  distance?: string;
  page?: number;
}): Promise<CallsForServiceResponse> {
  const params: Record<string, string> = {
    lat: options.lat.toString(),
    lon: options.lon.toString(),
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };
  
  if (options.distance) params.distance = options.distance;
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<CallsForServiceResponse>('/v3/calls-for-service', params);
}

/**
 * Get 911 calls for service by city key
 */
export async function getCallsForServiceByCityKey(options: {
  citykey: string;
  datetimeIni: string;
  datetimeEnd: string;
  page?: number;
}): Promise<CallsForServiceResponse> {
  const params: Record<string, string> = {
    citykey: options.citykey,
    datetime_ini: options.datetimeIni,
    datetime_end: options.datetimeEnd,
  };
  
  if (options.page) params.page = options.page.toString();

  return crimeometerFetch<CallsForServiceResponse>('/v3/calls-for-service', params);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Crimeometer API is configured
 */
export function isCrimeometerConfigured(): boolean {
  return !!process.env.CRIMEOMETER_API_KEY;
}

/**
 * Get date range for last N months
 */
export function getDateRangeLastMonths(months: number): { datetimeIni: string; datetimeEnd: string } {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  
  return {
    datetimeIni: start.toISOString(),
    datetimeEnd: end.toISOString(),
  };
}

/**
 * Get date range for a specific year
 */
export function getDateRangeForYear(year: number): { datetimeIni: string; datetimeEnd: string } {
  return {
    datetimeIni: `${year}-01-01T00:00:00.000Z`,
    datetimeEnd: `${year}-12-31T23:59:59.999Z`,
  };
}
