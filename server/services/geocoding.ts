import { Client, GeocodeResult } from '@googlemaps/google-maps-services-js';

// Initialize Google Maps client
const mapsClient = new Client({});

export interface GeocodedLocation {
  address: string;
  latitude: string;
  longitude: string;
  normalizedAddress: string;
  placeId: string;
  county?: string;
  timezone?: string;
}

export interface ProximitySearchResult {
  type: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  distance: string; // in miles
  duration?: number; // in minutes
  placeId: string;
  phoneNumber?: string;
  rating?: number;
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  try {
    const response = await mapsClient.geocode({
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.results.length === 0) {
      throw new Error('Address not found');
    }

    const result = response.data.results[0];
    
    // Extract county from address components
    const countyComponent = result.address_components?.find(
      (component) => component.types.includes('administrative_area_level_2' as any)
    );

    return {
      address,
      latitude: result.geometry.location.lat.toString(),
      longitude: result.geometry.location.lng.toString(),
      normalizedAddress: result.formatted_address,
      placeId: result.place_id,
      county: countyComponent?.long_name,
    };
  } catch (error: any) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  try {
    const response = await mapsClient.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: apiKey,
      },
    });

    if (response.data.results.length === 0) {
      throw new Error('Location not found');
    }

    const result = response.data.results[0];
    
    const countyComponent = result.address_components?.find(
      (component) => component.types.includes('administrative_area_level_2' as any)
    );

    return {
      address: result.formatted_address,
      latitude: lat.toString(),
      longitude: lng.toString(),
      normalizedAddress: result.formatted_address,
      placeId: result.place_id,
      county: countyComponent?.long_name,
    };
  } catch (error: any) {
    console.error('Reverse geocoding error:', error.message);
    throw new Error(`Failed to reverse geocode: ${error.message}`);
  }
}

export async function findNearbyEmergencyServices(
  lat: number,
  lng: number,
  radiusMiles: number = 10
): Promise<ProximitySearchResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  const radiusMeters = radiusMiles * 1609.34;
  const results: ProximitySearchResult[] = [];

  try {
    // Find police stations
    const policeResponse = await mapsClient.placesNearby({
      params: {
        location: { lat, lng },
        radius: radiusMeters,
        type: 'police',
        key: apiKey,
      },
    });

    for (const place of policeResponse.data.results.slice(0, 3)) {
      const distance = calculateDistance(
        lat,
        lng,
        place.geometry!.location.lat,
        place.geometry!.location.lng
      );
      
      results.push({
        type: 'police_station',
        name: place.name || 'Police Station',
        address: place.vicinity || '',
        latitude: place.geometry!.location.lat.toString(),
        longitude: place.geometry!.location.lng.toString(),
        distance: distance.toFixed(2),
        placeId: place.place_id || '',
        rating: place.rating,
      });
    }

    // Find hospitals
    const hospitalResponse = await mapsClient.placesNearby({
      params: {
        location: { lat, lng },
        radius: radiusMeters,
        type: 'hospital',
        key: apiKey,
      },
    });

    for (const place of hospitalResponse.data.results.slice(0, 3)) {
      const distance = calculateDistance(
        lat,
        lng,
        place.geometry!.location.lat,
        place.geometry!.location.lng
      );
      
      results.push({
        type: 'hospital',
        name: place.name || 'Hospital',
        address: place.vicinity || '',
        latitude: place.geometry!.location.lat.toString(),
        longitude: place.geometry!.location.lng.toString(),
        distance: distance.toFixed(2),
        placeId: place.place_id || '',
        rating: place.rating,
      });
    }

    // Find fire stations
    const fireResponse = await mapsClient.placesNearby({
      params: {
        location: { lat, lng },
        radius: radiusMeters,
        type: 'fire_station',
        key: apiKey,
      },
    });

    for (const place of fireResponse.data.results.slice(0, 3)) {
      const distance = calculateDistance(
        lat,
        lng,
        place.geometry!.location.lat,
        place.geometry!.location.lng
      );
      
      results.push({
        type: 'fire_station',
        name: place.name || 'Fire Station',
        address: place.vicinity || '',
        latitude: place.geometry!.location.lat.toString(),
        longitude: place.geometry!.location.lng.toString(),
        distance: distance.toFixed(2),
        placeId: place.place_id || '',
        rating: place.rating,
      });
    }

    return results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } catch (error: any) {
    console.error('Proximity search error:', error.message);
    throw new Error(`Failed to find nearby services: ${error.message}`);
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of Earth in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export async function estimateDrivingTime(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<number> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  try {
    const response = await mapsClient.distancematrix({
      params: {
        origins: [`${originLat},${originLng}`],
        destinations: [`${destLat},${destLng}`],
        key: apiKey,
      },
    });

    const element = response.data.rows[0]?.elements[0];
    
    if (element && element.status === 'OK' && element.duration) {
      return Math.round(element.duration.value / 60); // Convert seconds to minutes
    }
    
    // Fallback: estimate based on distance (assuming 30 mph average)
    const distance = calculateDistance(originLat, originLng, destLat, destLng);
    return Math.round((distance / 30) * 60);
  } catch (error: any) {
    console.error('Distance matrix error:', error.message);
    // Fallback calculation
    const distance = calculateDistance(originLat, originLng, destLat, destLng);
    return Math.round((distance / 30) * 60);
  }
}
