import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GoogleMap } from "@/components/GoogleMap";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Navigation, AlertTriangle, Building2, Loader2 } from "lucide-react";
import type { Site, PointOfInterest, CrimeSource, CrimeObservation } from "@shared/schema";

interface SiteGeoIntelProps {
  site: Site;
}

// Helper function to safely extract crime count from JSONB field
function getCrimeCount(crimeData: unknown): string {
  if (typeof crimeData === 'object' && crimeData !== null) {
    const total = (crimeData as any).total;
    return total !== undefined ? String(total) : 'N/A';
  }
  return 'N/A';
}

// Component to display a crime source with its observations
function CrimeSourceDisplay({ source, observations }: { source: CrimeSource; observations: CrimeObservation[] }) {
  const sourceObservations = observations.filter(obs => obs.crimeSourceId === source.id);
  const latestObservation = sourceObservations[0]; // Most recent observation

  return (
    <div className="p-4 rounded-lg border" data-testid={`crime-source-${source.id}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium capitalize">{source.dataSource.replace(/_/g, ' ')}</h4>
            <Badge variant="outline" className="text-xs">
              {source.dataTimePeriod || 'N/A'}
            </Badge>
            {latestObservation?.comparisonRating && (
              <Badge
                variant="outline"
                className={
                  latestObservation.comparisonRating === "very_high" || latestObservation.comparisonRating === "high"
                    ? "border-red-500 text-red-700"
                    : latestObservation.comparisonRating === "average"
                    ? "border-yellow-500 text-yellow-700"
                    : "border-green-500 text-green-700"
                }
              >
                {latestObservation.comparisonRating.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Imported: {source.importDate ? new Date(source.importDate).toLocaleDateString() : 'N/A'}
          </p>
          {(source.city || source.county || source.state) && (
            <p className="text-sm text-muted-foreground">
              Coverage: {[source.city, source.county, source.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        {latestObservation?.overallCrimeIndex !== null && latestObservation?.overallCrimeIndex !== undefined && (
          <div className="text-center">
            <div className="text-3xl font-bold">{latestObservation.overallCrimeIndex}</div>
            <div className="text-xs text-muted-foreground">Crime Index</div>
          </div>
        )}
      </div>

      {latestObservation ? (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {latestObservation.violentCrimes ? (
            <div className="p-2 rounded bg-muted/50">
              <div className="font-medium">Violent Crimes</div>
              <div className="text-muted-foreground">
                {getCrimeCount(latestObservation.violentCrimes)}
              </div>
            </div>
          ) : null}
          {latestObservation.propertyCrimes ? (
            <div className="p-2 rounded bg-muted/50">
              <div className="font-medium">Property Crimes</div>
              <div className="text-muted-foreground">
                {getCrimeCount(latestObservation.propertyCrimes)}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 text-muted-foreground">No observations available</div>
      )}

      {source.notes && (
        <p className="text-sm mt-3 text-muted-foreground italic">{source.notes}</p>
      )}
    </div>
  );
}

export function SiteGeoIntel({ site }: SiteGeoIntelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("map");

  // Fetch POIs for this site
  const { data: pois = [], isLoading: poisLoading } = useQuery<PointOfInterest[]>({
    queryKey: ["/api/points-of-interest", site.id],
    queryFn: async () => {
      const response = await fetch(`/api/points-of-interest?siteId=${site.id}`);
      if (!response.ok) throw new Error("Failed to fetch POIs");
      return response.json();
    },
  });

  // Fetch crime sources for this site
  const { data: crimeSources = [], isLoading: crimeLoading } = useQuery<CrimeSource[]>({
    queryKey: ["/api/crime-sources", site.id],
    queryFn: async () => {
      const response = await fetch(`/api/crime-sources?siteId=${site.id}`);
      if (!response.ok) throw new Error("Failed to fetch crime data");
      return response.json();
    },
  });

  // Fetch all crime observations for all sources at once (avoids N+1 queries)
  const { data: allObservations = [] } = useQuery<CrimeObservation[]>({
    queryKey: ["/api/crime-observations", site.id, ...crimeSources.map(s => s.id).sort()], // Include source IDs for automatic refetch
    queryFn: async () => {
      // Fetch observations for all crime sources in parallel
      const promises = crimeSources.map(source =>
        fetch(`/api/crime-sources/${source.id}/observations`)
          .then(res => res.ok ? res.json() : [])
          .catch(err => {
            console.error(`Failed to fetch observations for source ${source.id}:`, err);
            return [];
          })
      );
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: crimeSources.length > 0, // Only fetch if we have crime sources
  });

  // Geocode mutation
  const geocodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/sites/${site.id}/geocode`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: "Site geocoded",
        description: "Coordinates have been retrieved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Geocoding failed",
        description: error.message || "Could not geocode address.",
      });
    },
  });

  // Find proximity mutation
  const proximityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sites/${site.id}/proximity`);
      if (!response.ok) throw new Error("Failed to search for nearby services");
      return response.json();
    },
    onSuccess: async (data: any) => {
      // Invalidate and refetch POIs
      await queryClient.invalidateQueries({ queryKey: ["/api/points-of-interest", site.id] });
      await queryClient.refetchQueries({ queryKey: ["/api/points-of-interest", site.id] });
      toast({
        title: "Emergency services found",
        description: `Found ${data.pois?.length || 0} nearby emergency services.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Proximity search failed",
        description: error.message || "Could not find nearby services.",
      });
    },
  });

  const hasCoordinates = site.latitude && site.longitude;
  const center = hasCoordinates
    ? { lat: parseFloat(site.latitude!), lng: parseFloat(site.longitude!) }
    : undefined;

  // Prepare markers for map
  const markers = pois.map((poi) => ({
    id: poi.id,
    position: { lat: parseFloat(poi.latitude), lng: parseFloat(poi.longitude) },
    title: poi.name,
    type: poi.poiType, // Use actual POI type from backend
  }));

  // Add site marker if coordinates exist
  if (hasCoordinates) {
    markers.unshift({
      id: site.id,
      position: center!,
      title: site.name,
      type: "site" as const,
    });
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map" data-testid="tab-map">
            <MapPin className="h-4 w-4 mr-2" />
            Map
          </TabsTrigger>
          <TabsTrigger value="proximity" data-testid="tab-proximity">
            <Navigation className="h-4 w-4 mr-2" />
            Proximity
          </TabsTrigger>
          <TabsTrigger value="crime" data-testid="tab-crime">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Crime Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Site Location</span>
                {!hasCoordinates && (
                  <Button
                    size="sm"
                    onClick={() => geocodeMutation.mutate()}
                    disabled={geocodeMutation.isPending}
                    data-testid="button-geocode"
                  >
                    {geocodeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Geocode Address
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {hasCoordinates
                  ? `Coordinates: ${site.latitude}, ${site.longitude}`
                  : "No coordinates available. Click 'Geocode Address' to get coordinates from the address."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCoordinates ? (
                <GoogleMap
                  center={center}
                  zoom={15}
                  markers={markers}
                  height="400px"
                  data-testid="site-map"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg border">
                  <div className="text-center space-y-2">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Geocode the site address to view on map
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proximity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Emergency Services Proximity</span>
                {hasCoordinates && (
                  <Button
                    size="sm"
                    onClick={() => proximityMutation.mutate()}
                    disabled={proximityMutation.isPending}
                    data-testid="button-find-proximity"
                  >
                    {proximityMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Find Nearby Services
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {hasCoordinates
                  ? "Search for police stations, hospitals, and fire stations within 5 miles"
                  : "Geocode the site first to search for nearby emergency services"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {poisLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : pois.length > 0 ? (
                <div className="space-y-2">
                  {pois.map((poi) => (
                    <div
                      key={poi.id}
                      className="flex items-start justify-between p-3 rounded-lg border hover-elevate"
                      data-testid={`poi-${poi.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{poi.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {poi.poiType}
                          </Badge>
                        </div>
                        {poi.address && (
                          <p className="text-sm text-muted-foreground mt-1">{poi.address}</p>
                        )}
                        {poi.distanceToSite && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {parseFloat(poi.distanceToSite).toFixed(2)} miles away
                            {poi.estimatedResponseTime && ` • ~${poi.estimatedResponseTime} min response`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No emergency services found nearby.</p>
                  {hasCoordinates && (
                    <p className="text-xs mt-2">
                      Click "Find Nearby Services" to search for emergency services.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crime Data & Statistics</CardTitle>
              <CardDescription>
                Crime statistics and safety metrics for this location
              </CardDescription>
            </CardHeader>
            <CardContent>
              {crimeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : crimeSources.length > 0 ? (
                <div className="space-y-4">
                  {crimeSources.map((source) => (
                    <CrimeSourceDisplay key={source.id} source={source} observations={allObservations} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No crime data available for this site.</p>
                  <p className="text-xs mt-2">Import crime data to view statistics.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
