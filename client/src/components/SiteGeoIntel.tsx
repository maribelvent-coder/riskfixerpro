import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GoogleMap } from "@/components/GoogleMap";
import { CrimeDataImportDialog } from "@/components/CrimeDataImportDialog";
import { IncidentImportDialog } from "@/components/IncidentImportDialog";
import { CrimeDataCharts } from "@/components/CrimeDataCharts";
import { RiskIntelligencePanel } from "@/components/RiskIntelligencePanel";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Navigation, AlertTriangle, Building2, Loader2, Trash2, Plus, Shield, Upload, Download, BarChart3, X, Target } from "lucide-react";
import type { Site, PointOfInterest, CrimeSource, CrimeObservation, SiteIncident } from "@shared/schema";

interface SiteGeoIntelProps {
  site: Site;
}

// Helper function to safely parse and extract crime count from JSONB field
function getCrimeCount(crimeData: unknown): string {
  try {
    let parsed = crimeData;
    
    // Parse JSON string if needed
    if (typeof crimeData === 'string') {
      parsed = JSON.parse(crimeData);
    }
    
    // Extract total from parsed object
    if (typeof parsed === 'object' && parsed !== null) {
      const total = (parsed as any).total;
      
      // Handle numeric values (including strings that are numbers)
      if (typeof total === 'number') {
        return total.toLocaleString();
      }
      if (typeof total === 'string') {
        const num = Number(total);
        if (!isNaN(num)) {
          return num.toLocaleString();
        }
      }
    }
  } catch (error) {
    // Failed to parse or extract
  }
  
  return 'N/A';
}

// Component to display a crime source with its observations
function CrimeSourceDisplay({ 
  source, 
  observations,
  onDelete,
}: { 
  source: CrimeSource; 
  observations: CrimeObservation[];
  onDelete: (sourceId: string) => void;
}) {
  const [showCharts, setShowCharts] = useState(false);
  const sourceObservations = observations.filter(obs => obs.crimeSourceId === source.id);
  const latestObservation = sourceObservations[0]; // Most recent observation

  return (
    <div className="space-y-4" data-testid={`crime-source-${source.id}`}>
      <div className="p-4 rounded-lg border">
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
          <div className="flex flex-col items-end gap-2">
            {latestObservation?.overallCrimeIndex !== null && latestObservation?.overallCrimeIndex !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold">{latestObservation.overallCrimeIndex}</div>
                <div className="text-xs text-muted-foreground">Crime Index</div>
              </div>
            )}
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowCharts(!showCharts)}
                disabled={sourceObservations.length === 0}
                data-testid={`button-toggle-charts-${source.id}`}
                title={sourceObservations.length === 0 ? "No crime observations available for visualization" : (showCharts ? "Hide charts" : "Show charts")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(source.id)}
                data-testid={`button-delete-source-${source.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

      {showCharts && sourceObservations.length > 0 && (
        <CrimeDataCharts observations={sourceObservations} source={source} />
      )}
    </div>
  );
}

export function SiteGeoIntel({ site: initialSite }: SiteGeoIntelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("map");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [incidentUploadOpen, setIncidentUploadOpen] = useState(false);

  // Fetch fresh site data to get updated coordinates after geocoding
  const { data: freshSite } = useQuery<Site>({
    queryKey: ["/api/sites", initialSite.id],
    queryFn: async () => {
      const response = await fetch(`/api/sites/${initialSite.id}`);
      if (!response.ok) throw new Error("Failed to fetch site");
      return response.json();
    },
    initialData: initialSite,
  });

  // Use fresh site data (falls back to initial if query hasn't completed)
  const site = freshSite || initialSite;

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

  // Fetch site incidents
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<SiteIncident[]>({
    queryKey: ["/api/sites", site.id, "incidents"],
    queryFn: async () => {
      const response = await fetch(`/api/sites/${site.id}/incidents`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      return response.json();
    },
  });

  // Geocode mutation
  const geocodeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/sites/${site.id}/geocode`, {});
    },
    onSuccess: async () => {
      // Invalidate both the sites list and this specific site query
      await queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/sites", initialSite.id] });
      await queryClient.refetchQueries({ queryKey: ["/api/sites", initialSite.id] });
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

  // Delete POI mutation
  const deletePoiMutation = useMutation({
    mutationFn: async (poiId: string) => {
      const response = await fetch(`/api/points-of-interest/${poiId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to delete point of interest" }));
        throw new Error(error.error || "Failed to delete point of interest");
      }
      return response.json().catch(() => ({ success: true }));
    },
    onSuccess: async () => {
      // Invalidate POI list and refetch to update both list and map
      await queryClient.invalidateQueries({ queryKey: ["/api/points-of-interest", site.id] });
      await queryClient.refetchQueries({ queryKey: ["/api/points-of-interest", site.id] });
      // Also invalidate site data in case it affects map layers
      queryClient.invalidateQueries({ queryKey: ["/api/sites", site.id] });
      toast({
        title: "Point removed",
        description: "Point of interest has been removed from the map.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    },
  });

  // Delete crime source mutation
  const deleteCrimeSourceMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      const response = await fetch(`/api/crime-sources/${sourceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to delete crime source" }));
        throw new Error(error.error || "Failed to delete crime source");
      }
      return response.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", site.id] });
      toast({
        title: "Crime source deleted",
        description: "Crime data source has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    },
  });

  // Delete incident mutation
  const deleteIncidentMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await fetch(`/api/sites/incidents/${incidentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to delete incident" }));
        throw new Error(error.error || "Failed to delete incident");
      }
      return response.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", site.id, "incidents"] });
      toast({
        title: "Incident deleted",
        description: "Site incident has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
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
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="risk-intelligence" data-testid="tab-risk-intelligence">
            <Target className="h-4 w-4 mr-2" />
            Risk Intelligence
          </TabsTrigger>
          <TabsTrigger value="incidents" data-testid="tab-incidents">
            <Shield className="h-4 w-4 mr-2" />
            Incidents
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => deletePoiMutation.mutate(poi.id)}
                        disabled={deletePoiMutation.isPending}
                        data-testid={`button-delete-poi-${poi.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setImportDialogOpen(true)}
                      size="sm"
                      data-testid="button-import-crime-data"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Import Crime Data
                    </Button>
                  </div>
                  {crimeSources.map((source) => (
                    <CrimeSourceDisplay
                      key={source.id}
                      source={source}
                      observations={allObservations}
                      onDelete={(id) => deleteCrimeSourceMutation.mutate(id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="text-muted-foreground">
                    <p className="text-sm">No crime data available for this site.</p>
                    <p className="text-xs mt-2">Import crime data to view statistics.</p>
                  </div>
                  <Button
                    onClick={() => setImportDialogOpen(true)}
                    size="sm"
                    data-testid="button-import-crime-data-empty"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Import Crime Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crime-Informed Risk Intelligence</CardTitle>
              <CardDescription>
                Threat likelihood recommendations based on local crime data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskIntelligencePanel siteId={site.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Incident Tracking</CardTitle>
              <CardDescription>
                Track security incidents, break-ins, thefts, and other events at this facility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : incidents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm text-muted-foreground">
                      {incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          // Generate and download CSV template
                          const csvContent = `Date,Type,Description,Severity,Location,Police Notified,Police Report #,Estimated Cost,Notes
2024-01-15,theft,Equipment stolen from storage room,high,Building A - Storage,yes,2024-001,5000,Multiple items missing
2024-02-20,vandalism,Graffiti on exterior wall,medium,North Entrance,yes,2024-002,800,Cleaned same day`;
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'site-incidents-template.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        size="sm"
                        variant="outline"
                        data-testid="button-download-template"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV Template
                      </Button>
                      <Button
                        onClick={() => setIncidentUploadOpen(true)}
                        size="sm"
                        data-testid="button-upload-incidents"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-left p-3 font-medium">Severity</th>
                          <th className="text-left p-3 font-medium">Location</th>
                          <th className="text-center p-3 font-medium">Police</th>
                          <th className="text-right p-3 font-medium">Cost</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.map((incident) => (
                          <tr
                            key={incident.id}
                            className="border-t hover-elevate"
                            data-testid={`incident-row-${incident.id}`}
                          >
                            <td className="p-3 text-muted-foreground">
                              {new Date(incident.incidentDate).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="capitalize">
                                {incident.incidentType.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="p-3">{incident.description}</td>
                            <td className="p-3">
                              <Badge
                                variant={
                                  incident.severity === 'critical' || incident.severity === 'high'
                                    ? 'destructive'
                                    : incident.severity === 'medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {incident.severity}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">
                              {incident.locationWithinSite || '-'}
                            </td>
                            <td className="p-3 text-center">
                              {incident.policeNotified ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Badge variant="outline" className="text-xs">Yes</Badge>
                                  {incident.policeReportNumber && (
                                    <span className="text-xs text-muted-foreground">
                                      #{incident.policeReportNumber}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs">No</Badge>
                              )}
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              {incident.estimatedCost
                                ? `$${incident.estimatedCost.toLocaleString()}`
                                : '-'}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteIncidentMutation.mutate(incident.id)}
                                data-testid={`button-delete-incident-${incident.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm">No incidents recorded for this site.</p>
                    <p className="text-xs mt-2">Import incident data from CSV to begin tracking.</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        // Generate and download CSV template
                        const csvContent = `Date,Type,Description,Severity,Location,Police Notified,Police Report #,Estimated Cost,Notes
2024-01-15,theft,Equipment stolen from storage room,high,Building A - Storage,yes,2024-001,5000,Multiple items missing
2024-02-20,vandalism,Graffiti on exterior wall,medium,North Entrance,yes,2024-002,800,Cleaned same day`;
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'site-incidents-template.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      size="sm"
                      variant="outline"
                      data-testid="button-download-template-empty"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV Template
                    </Button>
                    <Button
                      onClick={() => setIncidentUploadOpen(true)}
                      size="sm"
                      data-testid="button-upload-incidents-empty"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CrimeDataImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        siteId={site.id}
      />
      <IncidentImportDialog
        open={incidentUploadOpen}
        onOpenChange={setIncidentUploadOpen}
        siteId={site.id}
      />
    </div>
  );
}
