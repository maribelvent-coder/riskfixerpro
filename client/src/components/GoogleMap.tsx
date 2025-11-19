import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface Marker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  type?: "site" | "poi" | "emergency";
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

// Load Google Maps script
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

export function GoogleMap({
  center = { lat: 37.7749, lng: -122.4194 },
  zoom = 12,
  markers = [],
  height = "500px",
  onMapClick,
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to .env");
      setLoading(false);
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add click listener
        if (onMapClick) {
          mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setMap(mapInstance);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load Google Maps");
        setLoading(false);
      });
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center.lat, center.lng]);

  // Update zoom when prop changes
  useEffect(() => {
    if (map) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  // Update markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: 600;">${markerData.title}</h3>
            ${markerData.type ? `<p style="margin: 0; font-size: 12px; color: #666;">${markerData.type.toUpperCase()}</p>` : ""}
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [map, markers]);

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Map Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
          <Badge variant="outline">Loading map...</Badge>
        </div>
      )}
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-lg border"
        data-testid="google-map-container"
      />
    </div>
  );
}
